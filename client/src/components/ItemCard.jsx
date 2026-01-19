import React, { useState } from 'react';
import { updateItem, getUsers } from '../services/api';

const ItemCard = ({ item, onEdit, onDelete, onAddSubItem, onUpdate }) => {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isEditingPriority, setIsEditingPriority] = useState(false);
  const [isEditingAssignees, setIsEditingAssignees] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status) => {
    const colors = {
      'to_do': 'bg-gray-200 text-gray-800',
      'in_progress': 'bg-blue-200 text-blue-800',
      'done': 'bg-green-200 text-green-800',
    };
    return colors[status] || 'bg-gray-200 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'to_do': 'To Do',
      'in_progress': 'In Progress',
      'done': 'Done',
    };
    return labels[status] || status;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'text-gray-600',
      'medium': 'text-yellow-600',
      'high': 'text-orange-600',
      'urgent': 'text-red-600',
    };
    return colors[priority] || 'text-gray-600';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'low': 'Low',
      'medium': 'Medium',
      'high': 'High',
      'urgent': 'Urgent',
    };
    return labels[priority] || priority;
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === item.status) {
      setIsEditingStatus(false);
      return;
    }

    setLoading(true);
    try {
      const response = await updateItem(item.id, { status: newStatus });
      if (response.data.success && onUpdate) {
        onUpdate(response.data.data);
      }
      setIsEditingStatus(false);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    if (newPriority === item.priority) {
      setIsEditingPriority(false);
      return;
    }

    setLoading(true);
    try {
      const response = await updateItem(item.id, { priority: newPriority });
      if (response.data.success && onUpdate) {
        onUpdate(response.data.data);
      }
      setIsEditingPriority(false);
    } catch (error) {
      console.error('Error updating priority:', error);
      alert('Failed to update priority');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    if (users.length === 0) {
      try {
        const response = await getUsers();
        if (response.data.success) {
          setUsers(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    }
  };

  const handleAssigneeChange = async (userId, checked) => {
    setLoading(true);
    try {
      let newAssignees = item.assignee_ids || [];
      if (checked) {
        newAssignees = [...newAssignees, parseInt(userId)];
      } else {
        newAssignees = newAssignees.filter(id => id !== parseInt(userId));
      }

      const response = await updateItem(item.id, { assignee_ids: newAssignees });
      if (response.data.success && onUpdate) {
        onUpdate(response.data.data);
      }
    } catch (error) {
      console.error('Error updating assignees:', error);
      alert('Failed to update assignees');
    } finally {
      setLoading(false);
      setIsEditingAssignees(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition cursor-pointer relative">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900">{item.title}</h3>
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddSubItem();
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800"
            title="Add Sub-item"
          >
            +
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="text-xs text-blue-600 hover:text-blue-800"
            title="Edit"
          >
            ✎
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-xs text-red-600 hover:text-red-800"
            title="Delete"
          >
            ×
          </button>
        </div>
      </div>

      {item.description && (
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-2">
        {/* Inline Status Edit */}
        <div className="relative">
          {isEditingStatus ? (
            <select
              value={item.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              onBlur={() => setIsEditingStatus(false)}
              autoFocus
              className={`px-2 py-1 rounded text-xs font-medium border-2 border-indigo-500 ${getStatusColor(item.status)}`}
              disabled={loading}
            >
              <option value="to_do">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          ) : (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingStatus(true);
              }}
              className={`px-2 py-1 rounded text-xs font-medium cursor-pointer hover:ring-2 hover:ring-indigo-300 ${getStatusColor(item.status)}`}
            >
              {getStatusLabel(item.status)}
            </span>
          )}
        </div>

        {/* Inline Priority Edit */}
        <div className="relative">
          {isEditingPriority ? (
            <select
              value={item.priority}
              onChange={(e) => handlePriorityChange(e.target.value)}
              onBlur={() => setIsEditingPriority(false)}
              autoFocus
              className={`text-xs font-medium border-2 border-indigo-500 px-2 py-1 rounded ${getPriorityColor(item.priority)}`}
              disabled={loading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          ) : (
            <span
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingPriority(true);
              }}
              className={`text-xs font-medium cursor-pointer hover:underline ${getPriorityColor(item.priority)}`}
            >
              {getPriorityLabel(item.priority)}
            </span>
          )}
        </div>
      </div>

      {/* Inline Assignees Edit */}
      <div className="text-xs text-gray-500 mb-2">
        {isEditingAssignees ? (
          <div className="bg-white border-2 border-indigo-500 rounded p-2 shadow-lg z-10 max-h-32 overflow-y-auto">
            {users.length === 0 ? (
              <div>Loading users...</div>
            ) : (
              users.map(user => (
                <label key={user.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1">
                  <input
                    type="checkbox"
                    checked={(item.assignee_ids || []).includes(user.id)}
                    onChange={(e) => handleAssigneeChange(user.id, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span>{user.name}</span>
                </label>
              ))
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingAssignees(false);
              }}
              className="text-xs text-indigo-600 mt-2"
            >
              Done
            </button>
          </div>
        ) : (
          <div
            onClick={(e) => {
              e.stopPropagation();
              loadUsers();
              setIsEditingAssignees(true);
            }}
            className="cursor-pointer hover:text-indigo-600"
          >
            {item.assignee_names && item.assignee_names.length > 0 ? (
              <>👤 {item.assignee_names.join(', ')}</>
            ) : (
              <>👤 Click to assign</>
            )}
          </div>
        )}
      </div>

      {(item.timeline_start || item.timeline_end) && (
        <div className="text-xs text-gray-500">
          📅 {item.timeline_start || '?'} - {item.timeline_end || '?'}
        </div>
      )}

      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center rounded-lg">
          <div className="text-xs text-gray-500">Updating...</div>
        </div>
      )}
    </div>
  );
};

export default ItemCard;
