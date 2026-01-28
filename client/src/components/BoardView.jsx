import React, { useMemo, useRef, useState, useEffect, memo } from 'react';
import { ChevronDown, ChevronRight, Plus, GripVertical, MoreHorizontal, Calendar as CalendarIcon, X } from 'lucide-react';
import { statusOptions, priorityOptions } from '../utils/dataTransform';
import { getUsers } from '../services/api';
import { createItem, updateItem, updateItemTimeline as patchItemTimeline, createGroup, getBoardById, createSubItem, updateSubItem, deleteSubItem } from '../services/api';
import { transformBoard, prepareItemForBackend, UI_STATUS_TO_BACKEND, UI_PRIORITY_TO_BACKEND } from '../utils/dataTransform';
import { formatDateLocal, parseDateLocal, formatDateDisplay, getTodayLocal } from '../utils/dateUtils';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { toast } from '../hooks/use-toast';

const ItemNameInput = memo(function ItemNameInput({ initialValue, onDebouncedCommit }) {
  const [value, setValue] = useState(initialValue ?? '');
  const timerRef = useRef(null);

  useEffect(() => {
    setValue(initialValue ?? '');
  }, [initialValue]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onChange = (next) => {
    setValue(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onDebouncedCommit(next);
    }, 500);
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent text-sm text-gray-900 focus:outline-none"
      aria-label="Item title"
    />
  );
});

const BoardView = ({ board, onUpdateBoard }) => {
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [collapsedSubItems, setCollapsedSubItems] = useState({});
  const [hoveredRow, setHoveredRow] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState({});
  const [editingSubItem, setEditingSubItem] = useState(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await getUsers();
      if (response.data.success) {
        // Transform users to teamMembers format
        const members = response.data.data.map(user => {
          const names = user.name.split(' ');
          const avatar = names.length >= 2 
            ? `${names[0][0]}${names[1][0]}`.toUpperCase()
            : user.name.substring(0, 2).toUpperCase();
          const colors = ['#9D99E5', '#579BFC', '#FF7575', '#037F4C', '#FDAB3D', '#FF6B6B', '#00C875'];
          const hash = user.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          const color = colors[hash % colors.length];
          
          return { 
            id: user.id,
            name: user.name, 
            avatar, 
            color 
          };
        });
        setTeamMembers(members);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const refetchBoard = async () => {
    try {
      const response = await getBoardById(board.id);
      if (response.data.success) {
        const transformedBoard = transformBoard(response.data.data);
        onUpdateBoard(transformedBoard);
      }
    } catch (error) {
      console.error('Error refetching board:', error);
    }
  };

  const toggleGroup = (groupId) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const toggleSubItems = (itemId) => {
    setCollapsedSubItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const updateItemStatus = async (groupId, itemId, newStatus) => {
    const loadingKey = `status-${itemId}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      const backendStatus = UI_STATUS_TO_BACKEND[newStatus.label] || 'to_do';
      await updateItem(itemId, { status: backendStatus });
      await refetchBoard();
    } catch (error) {
      console.error('Error updating item status:', error);
      alert('Failed to update status');
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const updateItemPerson = async (groupId, itemId, newPerson) => {
    const loadingKey = `person-${itemId}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      // Get the current item to find assignee_ids
      const group = board.groups.find(g => g.id === groupId);
      const item = group.items.find(i => i.id === itemId);
      
      // For now, we'll use the person's ID if available, otherwise assign first user
      const assigneeIds = newPerson.id ? [newPerson.id] : [];
      
      await updateItem(itemId, { assignee_ids: assigneeIds });
      await refetchBoard();
    } catch (error) {
      console.error('Error updating item person:', error);
      alert('Failed to update assignee');
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const updateItemPriority = async (groupId, itemId, newPriority) => {
    const loadingKey = `priority-${itemId}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      const backendPriority = UI_PRIORITY_TO_BACKEND[newPriority.label] || 'medium';
      await updateItem(itemId, { priority: backendPriority });
      await refetchBoard();
    } catch (error) {
      console.error('Error updating item priority:', error);
      alert('Failed to update priority');
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const updateItemName = async (groupId, itemId, newName) => {
    const loadingKey = `name-${itemId}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      await updateItem(itemId, { title: newName });
      await refetchBoard();
    } catch (error) {
      console.error('Error updating item name:', error);
      alert('Failed to update item name');
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const updateItemDate = async (groupId, itemId, newDate) => {
    const loadingKey = `date-${itemId}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      // Format date as local YYYY-MM-DD (no UTC conversion)
      const dateStr = formatDateLocal(newDate);
      if (!dateStr) {
        throw new Error('Invalid date');
      }
      
      await patchItemDate(itemId, dateStr);
      await refetchBoard();
    } catch (error) {
      console.error('Error updating item date:', error);
      const message = error?.response?.data?.error || 'Failed to update date';
      toast({
        title: 'Date update failed',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const updateItemTimelineRange = async (groupId, itemId, timelineStart, timelineEnd) => {
    const loadingKey = `timeline-${itemId}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      await patchItemTimeline(itemId, {
        timeline_start: timelineStart,
        timeline_end: timelineEnd
      });
      await refetchBoard();
    } catch (error) {
      console.error('Error updating timeline:', error);
      const message = error?.response?.data?.error || 'Failed to update timeline';
      toast({
        title: 'Timeline update failed',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  const addNewItem = async (groupId) => {
    try {
      const todayStr = getTodayLocal();
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = formatDateLocal(nextWeek);
      
      const newItem = {
        name: 'New Item',
        status: statusOptions[0],
        person: teamMembers[0] || { name: 'Unassigned', avatar: 'UA', color: '#C4C4C4' },
        date: todayStr,
        priority: priorityOptions[2],
        timeline: {
          start: todayStr,
          end: nextWeekStr || todayStr
        }
      };
      
      const itemData = prepareItemForBackend(newItem, groupId, board.id);
      if (teamMembers[0]?.id) {
        itemData.assignee_ids = [teamMembers[0].id];
      }
      
      await createItem(itemData);
      await refetchBoard();
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Failed to create item');
    }
  };

  const addGroup = async () => {
    try {
      const groupName = prompt('Enter group name:');
      if (!groupName) return;
      
      await createGroup({ name: groupName, board_id: parseInt(board.id) });
      await refetchBoard();
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    }
  };

  const handleCreateSubItem = async (itemId) => {
    try {
      const title = prompt('Enter sub-item title:');
      if (!title) return;
      
      await createSubItem({
        title: title.trim(),
        parent_item_id: parseInt(itemId),
        status: 'to_do',
        priority: 'medium'
      });
      await refetchBoard();
    } catch (error) {
      console.error('Error creating sub-item:', error);
      alert('Failed to create sub-item');
    }
  };

  const handleUpdateSubItem = async (subItemId, updates) => {
    try {
      await updateSubItem(subItemId, updates);
      await refetchBoard();
    } catch (error) {
      console.error('Error updating sub-item:', error);
      alert('Failed to update sub-item');
    }
  };

  const handleDeleteSubItem = async (subItemId) => {
    if (!window.confirm('Are you sure you want to delete this sub-item?')) return;
    
    try {
      await deleteSubItem(subItemId);
      await refetchBoard();
    } catch (error) {
      console.error('Error deleting sub-item:', error);
      alert('Failed to delete sub-item');
    }
  };

  const updateSubItemStatus = async (subItemId, newStatus) => {
    try {
      const backendStatus = UI_STATUS_TO_BACKEND[newStatus.label] || 'to_do';
      await handleUpdateSubItem(subItemId, { status: backendStatus });
    } catch (error) {
      console.error('Error updating sub-item status:', error);
    }
  };

  const updateSubItemPriority = async (subItemId, newPriority) => {
    try {
      const backendPriority = UI_PRIORITY_TO_BACKEND[newPriority.label] || 'medium';
      await handleUpdateSubItem(subItemId, { priority: backendPriority });
    } catch (error) {
      console.error('Error updating sub-item priority:', error);
    }
  };

  const today = useMemo(() => {
    return parseDateLocal(getTodayLocal());
  }, []);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
      <div className="w-full lg:min-w-max">
        {/* Column Headers */}
        <div className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center">
            <div className="w-12 flex-shrink-0"></div>
            <div className="w-80 px-4 py-3 font-semibold text-sm text-gray-700 border-r border-gray-200">Item</div>
            <div className="w-40 px-4 py-3 font-semibold text-sm text-gray-700 border-r border-gray-200">Status</div>
            <div className="w-40 px-4 py-3 font-semibold text-sm text-gray-700 border-r border-gray-200">Person</div>
            <div className="w-40 px-4 py-3 font-semibold text-sm text-gray-700 border-r border-gray-200">Date</div>
            <div className="w-40 px-4 py-3 font-semibold text-sm text-gray-700 border-r border-gray-200">Priority</div>
            <div className="w-60 px-4 py-3 font-semibold text-sm text-gray-700">Timeline</div>
          </div>
        </div>

        {/* Groups and Items */}
        <div className="pb-8">
          {board.groups.map((group) => (
            <div key={group.id} className="mb-2">
              {/* Group Header */}
              <div 
                className="bg-white flex items-center px-2 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleGroup(group.id)}
              >
                <div className="w-12 flex items-center justify-center">
                  {collapsedGroups[group.id] ? 
                    <ChevronRight className="w-4 h-4 text-gray-600" /> : 
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  }
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 rounded" style={{ backgroundColor: group.color }}></div>
                  <span className="font-semibold text-gray-900">{group.name}</span>
                  <span className="text-sm text-gray-500">({group.items.length})</span>
                </div>
              </div>

              {/* Items */}
              {!collapsedGroups[group.id] && (
                <div className="bg-white">
                  {group.items.map((item, idx) => (
                    <React.Fragment key={item.id}>
                    <div 
                      className={`group border-b border-gray-200 hover:bg-blue-50 transition-colors lg:flex lg:items-center grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 p-3 lg:p-0 ${
                        idx === group.items.length - 1 ? '' : ''
                      }`}
                      onMouseEnter={() => setHoveredRow(item.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      {/* Drag Handle */}
                      <div className="hidden lg:flex w-12 items-center justify-center">
                        <GripVertical className={`w-4 h-4 text-gray-400 ${
                          hoveredRow === item.id ? 'opacity-100' : 'opacity-0'
                        } transition-opacity`} />
                      </div>

                      {/* Item Name */}
                      <div className="w-full sm:col-span-2 lg:w-80 lg:px-4 lg:py-3 lg:border-r border-gray-200">
                        <div className="lg:hidden text-[11px] font-medium text-gray-500 mb-1">Item</div>
                        <ItemNameInput
                          initialValue={item.name}
                          onDebouncedCommit={(next) => updateItemName(group.id, item.id, next)}
                        />
                      </div>

                      {/* Status */}
                      <div className="w-full lg:w-40 lg:px-4 lg:py-3 lg:border-r border-gray-200">
                        <div className="lg:hidden text-[11px] font-medium text-gray-500 mb-1">Status</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button 
                              className="px-3 py-1.5 rounded-md text-sm font-medium text-white hover:opacity-90 transition-opacity w-full"
                              style={{ backgroundColor: item.status.color }}
                              disabled={loading[`status-${item.id}`]}
                            >
                              {loading[`status-${item.id}`] ? '...' : item.status.label}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2">
                            {statusOptions.map((status) => (
                              <button
                                key={status.label}
                                onClick={() => updateItemStatus(group.id, item.id, status)}
                                className="w-full px-3 py-2 text-left text-sm rounded hover:bg-gray-100 flex items-center gap-2"
                              >
                                <div className="w-3 h-3 rounded" style={{ backgroundColor: status.color }}></div>
                                {status.label}
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Person */}
                      <div className="w-full lg:w-40 lg:px-4 lg:py-3 lg:border-r border-gray-200">
                        <div className="lg:hidden text-[11px] font-medium text-gray-500 mb-1">Person</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors">
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                style={{ backgroundColor: item.person.color }}
                              >
                                {item.person.avatar}
                              </div>
                              <span className="text-sm text-gray-900 truncate">{item.person.name.split(' ')[0]}</span>
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-56 p-2">
                            {teamMembers.length > 0 ? (
                              teamMembers.map((member) => (
                                <button
                                  key={member.id || member.name}
                                  onClick={() => updateItemPerson(group.id, item.id, member)}
                                  className="w-full px-3 py-2 text-left text-sm rounded hover:bg-gray-100 flex items-center gap-2"
                                >
                                  <div 
                                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                    style={{ backgroundColor: member.color }}
                                  >
                                    {member.avatar}
                                  </div>
                                  {member.name}
                                </button>
                              ))
                            ) : (
                              <div className="px-3 py-2 text-sm text-gray-500">No users available</div>
                            )}
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Date */}
                      <div className="w-full lg:w-40 lg:px-4 lg:py-3 lg:border-r border-gray-200">
                        <div className="lg:hidden text-[11px] font-medium text-gray-500 mb-1">Date</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full flex items-center gap-2 text-sm text-gray-900 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors">
                              <CalendarIcon className="w-4 h-4 text-gray-500" />
                              {formatDateDisplay(item.date)}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={parseDateLocal(item.date)}
                              disabled={{ before: today }}
                              onSelect={(date) => {
                                if (date) {
                                  updateItemDate(group.id, item.id, date);
                                }
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Priority */}
                      <div className="w-full lg:w-40 lg:px-4 lg:py-3 lg:border-r border-gray-200">
                        <div className="lg:hidden text-[11px] font-medium text-gray-500 mb-1">Priority</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button 
                              className="px-3 py-1.5 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                              style={{ 
                                backgroundColor: `${item.priority.color}20`,
                                color: item.priority.color
                              }}
                              disabled={loading[`priority-${item.id}`]}
                            >
                              {loading[`priority-${item.id}`] ? '...' : item.priority.label}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2">
                            {priorityOptions.map((priority) => (
                              <button
                                key={priority.label}
                                onClick={() => updateItemPriority(group.id, item.id, priority)}
                                className="w-full px-3 py-2 text-left text-sm rounded hover:bg-gray-100 flex items-center gap-2"
                              >
                                <div className="w-3 h-3 rounded" style={{ backgroundColor: priority.color }}></div>
                                {priority.label}
                              </button>
                            ))}
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Timeline */}
                      <div className="w-full sm:col-span-2 lg:w-60 lg:px-4 lg:py-3">
                        <div className="lg:hidden text-[11px] font-medium text-gray-500 mb-1">Timeline</div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="w-full flex items-center gap-2 text-xs text-gray-600 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors">
                              {new Date(item.timeline.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full rounded-full"
                                  style={{ 
                                    backgroundColor: item.status.color,
                                    width: '60%'
                                  }}
                                ></div>
                              </div>
                              {new Date(item.timeline.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-4">
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
                                <Calendar
                                  mode="single"
                                  selected={new Date(item.timeline.start)}
                                  onSelect={(date) => {
                                    if (date) {
                                      const dateStr = date.toISOString().split('T')[0];
                                      const endStr = item.timeline.end && item.timeline.end < dateStr ? dateStr : item.timeline.end;
                                      updateItemTimelineRange(group.id, item.id, dateStr, endStr);
                                    }
                                  }}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">End Date</label>
                                <Calendar
                                  mode="single"
                                  selected={new Date(item.timeline.end)}
                                  disabled={{ before: today }}
                                  onSelect={(date) => {
                                    if (date) {
                                      const dateStr = date.toISOString().split('T')[0];
                                      updateItemTimelineRange(group.id, item.id, item.timeline.start, dateStr);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Sub-items Section */}
                    {item.sub_items && item.sub_items.length > 0 && (
                      <div className="bg-gray-50 border-t border-gray-200">
                        <div className="flex items-center px-2 py-1">
                          <button
                            onClick={() => toggleSubItems(item.id)}
                            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                          >
                            {collapsedSubItems[item.id] ? 
                              <ChevronRight className="w-3 h-3" /> : 
                              <ChevronDown className="w-3 h-3" />
                            }
                            <span>{item.sub_items.length} sub-item{item.sub_items.length !== 1 ? 's' : ''}</span>
                          </button>
                          <button
                            onClick={() => handleCreateSubItem(item.id)}
                            className="ml-auto text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add sub-item</span>
                          </button>
                        </div>

                        {!collapsedSubItems[item.id] && (
                          <div className="pl-12 pr-4 pb-2 space-y-1">
                            {item.sub_items.map((subItem) => (
                              <div
                                key={subItem.id}
                                className="border border-gray-300 rounded bg-white hover:bg-blue-50 transition-colors text-xs lg:flex lg:items-center grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2 p-2"
                              >
                                {/* Sub-item Title */}
                                <div className="w-full sm:col-span-2 lg:flex-1 lg:px-2 lg:py-1.5 lg:border-r border-gray-300">
                                  <div className="lg:hidden text-[11px] font-medium text-gray-500 mb-1">Sub-item</div>
                                  <input
                                    type="text"
                                    value={editingSubItem?.id === subItem.id ? editingSubItem.title : subItem.title}
                                    onChange={(e) => {
                                      if (editingSubItem?.id === subItem.id) {
                                        setEditingSubItem({ ...editingSubItem, title: e.target.value });
                                      } else {
                                        setEditingSubItem({ id: subItem.id, title: e.target.value });
                                      }
                                    }}
                                    onBlur={() => {
                                      if (editingSubItem?.id === subItem.id && editingSubItem.title !== subItem.title) {
                                        handleUpdateSubItem(subItem.id, { title: editingSubItem.title });
                                      }
                                      setEditingSubItem(null);
                                    }}
                                    className="w-full bg-transparent text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1"
                                  />
                                </div>

                                {/* Sub-item Status */}
                                <div className="w-full lg:w-24 lg:px-2 lg:py-1.5 lg:border-r border-gray-300">
                                  <div className="lg:hidden text-[11px] font-medium text-gray-500 mb-1">Status</div>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button 
                                        className="px-2 py-0.5 rounded text-xs font-medium text-white hover:opacity-90 transition-opacity w-full"
                                        style={{ backgroundColor: subItem.status.color }}
                                      >
                                        {subItem.status.label}
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 p-2">
                                      {statusOptions.map((status) => (
                                        <button
                                          key={status.label}
                                          onClick={() => updateSubItemStatus(subItem.id, status)}
                                          className="w-full px-3 py-2 text-left text-sm rounded hover:bg-gray-100 flex items-center gap-2"
                                        >
                                          <div className="w-3 h-3 rounded" style={{ backgroundColor: status.color }}></div>
                                          {status.label}
                                        </button>
                                      ))}
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                {/* Sub-item Priority */}
                                <div className="w-full lg:w-24 lg:px-2 lg:py-1.5 lg:border-r border-gray-300">
                                  <div className="lg:hidden text-[11px] font-medium text-gray-500 mb-1">Priority</div>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button 
                                        className="px-2 py-0.5 rounded text-xs font-medium hover:opacity-90 transition-opacity w-full"
                                        style={{ 
                                          backgroundColor: `${subItem.priority.color}20`,
                                          color: subItem.priority.color
                                        }}
                                      >
                                        {subItem.priority.label}
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-48 p-2">
                                      {priorityOptions.map((priority) => (
                                        <button
                                          key={priority.label}
                                          onClick={() => updateSubItemPriority(subItem.id, priority)}
                                          className="w-full px-3 py-2 text-left text-sm rounded hover:bg-gray-100 flex items-center gap-2"
                                        >
                                          <div className="w-3 h-3 rounded" style={{ backgroundColor: priority.color }}></div>
                                          {priority.label}
                                        </button>
                                      ))}
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                {/* Sub-item Timeline */}
                                <div className="w-full sm:col-span-2 lg:w-32 lg:px-2 lg:py-1.5 lg:border-r border-gray-300 text-gray-600">
                                  <div className="lg:hidden text-[11px] font-medium text-gray-500 mb-1">Timeline</div>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button className="text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-0.5 rounded transition-colors w-full text-left">
                                        {subItem.timeline.start && subItem.timeline.end ? (
                                          <>
                                            {formatDateDisplay(subItem.timeline.start)} - {formatDateDisplay(subItem.timeline.end)}
                                          </>
                                        ) : (
                                          <span className="text-gray-400">No dates</span>
                                        )}
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-4">
                                      <div className="space-y-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-700 mb-2 block">Start Date</label>
                                          <Calendar
                                            mode="single"
                                            selected={subItem.timeline.start ? parseDateLocal(subItem.timeline.start) : undefined}
                                            disabled={{ before: today }}
                                            onSelect={(date) => {
                                              if (date) {
                                                const startStr = formatDateLocal(date);
                                                const currentEnd = subItem.timeline.end;
                                                // If new start date is after end date, adjust end date
                                                const endStr = currentEnd && startStr > currentEnd ? startStr : (currentEnd || startStr);
                                                handleUpdateSubItem(subItem.id, { 
                                                  timeline_start: startStr,
                                                  timeline_end: endStr
                                                });
                                              }
                                            }}
                                          />
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-700 mb-2 block">End Date</label>
                                          <Calendar
                                            mode="single"
                                            selected={subItem.timeline.end ? parseDateLocal(subItem.timeline.end) : undefined}
                                            disabled={{ before: today }}
                                            onSelect={(date) => {
                                              if (date) {
                                                const endStr = formatDateLocal(date);
                                                const currentStart = subItem.timeline.start;
                                                // Ensure end date is not before start date
                                                const startStr = currentStart && endStr < currentStart ? endStr : (currentStart || endStr);
                                                handleUpdateSubItem(subItem.id, { 
                                                  timeline_start: startStr,
                                                  timeline_end: endStr
                                                });
                                              }
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>

                                {/* Delete Button */}
                                <div className="flex justify-end px-2 py-1.5 sm:col-span-2 lg:col-auto">
                                  <button
                                    onClick={() => handleDeleteSubItem(subItem.id)}
                                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                    title="Delete sub-item"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Add Sub-item Button (when no sub-items exist) */}
                    {(!item.sub_items || item.sub_items.length === 0) && (
                      <div className="bg-gray-50 border-t border-gray-200 px-2 py-1">
                        <button
                          onClick={() => handleCreateSubItem(item.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add sub-item</span>
                        </button>
                      </div>
                    )}
                    </React.Fragment>
                  ))}

                  {/* Add Item Button */}
                  <div className="flex items-center px-2 py-2 hover:bg-blue-50 transition-colors">
                    <div className="w-12"></div>
                    <button 
                      onClick={() => addNewItem(group.id)}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add item</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Group Button */}
          <div className="mt-4 px-4">
            <button 
              onClick={addGroup}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white hover:shadow-sm rounded-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add group</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardView;
