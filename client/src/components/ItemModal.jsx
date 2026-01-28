import React, { useState, useEffect } from 'react';
import { getTeams, getItemById } from '../services/api';

const ItemModal = ({ item, group, boardId, onSave, onClose }) => {
  const [title, setTitle] = useState(item?.title || '');
  const [description, setDescription] = useState(item?.description || '');
  const [status, setStatus] = useState(item?.status || 'to_do');
  const [priority, setPriority] = useState(item?.priority || 'medium');
  const [timelineStart, setTimelineStart] = useState(item?.timeline_start || '');
  const [timelineEnd, setTimelineEnd] = useState(item?.timeline_end || '');
  const [assigneeIds, setAssigneeIds] = useState(item?.assignee_ids || []);
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [showActivityLogs, setShowActivityLogs] = useState(false);

  useEffect(() => {
    fetchTeams();
    if (item?.id) {
      fetchActivityLogs();
    }
  }, [item]);

  const fetchActivityLogs = async () => {
    if (!item?.id) return;
    try {
      const response = await getItemById(item.id);
      if (response.data.success && response.data.data.activity_logs) {
        setActivityLogs(response.data.data.activity_logs);
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await getTeams();
      if (response.data.success) {
        setTeams(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleTeamAssign = (teamId) => {
    const team = teams.find(t => t.id === parseInt(teamId));
    if (team && team.member_ids) {
      setAssigneeIds([...new Set([...assigneeIds, ...team.member_ids])]);
      setSelectedTeam('');
    }
  };

  const handleRemoveAssignee = (userId) => {
    setAssigneeIds(assigneeIds.filter(id => id !== userId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      description,
      status,
      priority,
      timeline_start: timelineStart || null,
      timeline_end: timelineEnd || null,
      assignee_ids: assigneeIds
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {item ? 'Edit Item' : 'Create New Item'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="to_do">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeline Start
              </label>
              <input
                type="date"
                value={timelineStart}
                onChange={(e) => setTimelineStart(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeline End
              </label>
              <input
                type="date"
                min={todayStr}
                value={timelineEnd}
                onChange={(e) => setTimelineEnd(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assign to Team
            </label>
            <div className="flex gap-2">
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleTeamAssign(selectedTeam)}
                disabled={!selectedTeam}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300"
              >
                Assign Team
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignees
            </label>
            <div className="flex flex-wrap gap-2">
              {assigneeIds.map(userId => (
                <span
                  key={userId}
                  className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm flex items-center gap-2"
                >
                  User {userId}
                  <button
                    type="button"
                    onClick={() => handleRemoveAssignee(userId)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Note: In a full implementation, you would select from a list of users
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {item ? 'Update' : 'Create'}
            </button>
          </div>
        </form>

        {/* Activity Logs Section */}
        {item && (
          <div className="mt-6 border-t pt-4">
            <button
              type="button"
              onClick={() => {
                setShowActivityLogs(!showActivityLogs);
                if (!showActivityLogs && activityLogs.length === 0) {
                  fetchActivityLogs();
                }
              }}
              className="w-full text-left text-sm font-medium text-gray-700 hover:text-indigo-600 flex items-center justify-between"
            >
              <span>Activity Log {activityLogs.length > 0 && `(${activityLogs.length})`}</span>
              <span>{showActivityLogs ? '▼' : '▶'}</span>
            </button>
            {showActivityLogs && (
              <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                {activityLogs.length === 0 ? (
                  <p className="text-sm text-gray-400">No activity yet</p>
                ) : (
                  activityLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-gray-50 rounded text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium">{log.user_name || 'System'}</span>
                          <span className="text-gray-600 ml-2">{log.action}</span>
                        </div>
                        <span className="text-gray-400 text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemModal;

