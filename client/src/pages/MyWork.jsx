import React, { useState, useEffect } from 'react';
import { getMyWork, getItemById } from '../services/api';
import ItemModal from '../components/ItemModal';

const MyWork = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [userId] = useState(1); // In a real app, this would come from auth context
  const [selectedItem, setSelectedItem] = useState(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [itemDetails, setItemDetails] = useState(null);

  useEffect(() => {
    fetchMyWork();
  }, [filter, userId]);

  const fetchMyWork = async () => {
    try {
      const response = await getMyWork(userId, filter === 'all' ? null : filter);
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching my work:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = async (item) => {
    try {
      const response = await getItemById(item.id);
      if (response.data.success) {
        setItemDetails(response.data.data);
        setSelectedItem(item);
        setShowItemModal(true);
      }
    } catch (error) {
      console.error('Error fetching item details:', error);
    }
  };

  const handleSaveItem = async (itemData) => {
    try {
      // This would call updateItem, but for now just refresh
      await fetchMyWork();
      setShowItemModal(false);
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading your work...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Work</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('this_week')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'this_week'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'upcoming'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Upcoming
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {filter === 'all'
              ? "You don't have any assigned tasks yet."
              : `No tasks found for ${filter === 'this_week' ? 'this week' : 'upcoming'}.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
              </div>

              {item.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
              )}

              <div className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Board:</span> {item.board_name}
              </div>
              <div className="text-sm text-gray-500 mb-2">
                <span className="font-medium">Group:</span> {item.group_name}
              </div>

              {item.priority && (
                <div className="text-sm text-gray-500 mb-2">
                  <span className="font-medium">Priority:</span> {item.priority}
                </div>
              )}

              {(item.timeline_start || item.timeline_end) && (
                <div className="text-sm text-gray-500">
                  📅 {item.timeline_start || '?'} - {item.timeline_end || '?'}
                </div>
              )}

              {itemDetails && itemDetails.id === item.id && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-medium text-sm mb-2">Activity Log:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {itemDetails.activity_logs && itemDetails.activity_logs.length > 0 ? (
                      itemDetails.activity_logs.slice(0, 3).map((log) => (
                        <div key={log.id} className="text-xs text-gray-600">
                          <span className="font-medium">{log.user_name || 'System'}:</span> {log.action}
                          <span className="text-gray-400 ml-2">
                            {new Date(log.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400">No activity yet</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showItemModal && selectedItem && itemDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{itemDetails.title}</h2>
              <button
                onClick={() => {
                  setShowItemModal(false);
                  setSelectedItem(null);
                  setItemDetails(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-gray-600">{itemDetails.description || 'No description'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold mb-2">Status</h3>
                <span className={`px-3 py-1 rounded ${getStatusColor(itemDetails.status)}`}>
                  {getStatusLabel(itemDetails.status)}
                </span>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Priority</h3>
                <span className="text-gray-600">{itemDetails.priority}</span>
              </div>
            </div>

            {itemDetails.assignee_names && itemDetails.assignee_names.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Assignees</h3>
                <p className="text-gray-600">{itemDetails.assignee_names.join(', ')}</p>
              </div>
            )}

            {itemDetails.sub_items && itemDetails.sub_items.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Sub-items ({itemDetails.sub_items.length})</h3>
                <div className="space-y-2">
                  {itemDetails.sub_items.map((subItem) => (
                    <div key={subItem.id} className="p-3 bg-gray-50 rounded">
                      <div className="flex justify-between">
                        <span className="font-medium">{subItem.title}</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          {subItem.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-semibold mb-2">Activity Log</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {itemDetails.activity_logs && itemDetails.activity_logs.length > 0 ? (
                  itemDetails.activity_logs.map((log) => (
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
                ) : (
                  <p className="text-gray-400">No activity yet</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowItemModal(false);
                  setSelectedItem(null);
                  setItemDetails(null);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyWork;

