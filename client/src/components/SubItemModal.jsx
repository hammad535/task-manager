import React, { useState, useEffect } from 'react';
import { getSubItemsByParent, createSubItem, updateSubItem, deleteSubItem } from '../services/api';

const SubItemModal = ({ parentItem, onClose, onRefresh }) => {
  const [subItems, setSubItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubItem, setEditingSubItem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'to_do',
    priority: 'medium',
    timeline_start: '',
    timeline_end: ''
  });

  useEffect(() => {
    fetchSubItems();
  }, [parentItem.id]);

  const fetchSubItems = async () => {
    try {
      const response = await getSubItemsByParent(parentItem.id);
      if (response.data.success) {
        setSubItems(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sub-items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubItem) {
        await updateSubItem(editingSubItem.id, formData);
      } else {
        await createSubItem({
          ...formData,
          parent_item_id: parentItem.id
        });
      }
      await fetchSubItems();
      setShowForm(false);
      setEditingSubItem(null);
      setFormData({
        title: '',
        description: '',
        status: 'to_do',
        priority: 'medium',
        timeline_start: '',
        timeline_end: ''
      });
      onRefresh();
    } catch (error) {
      console.error('Error saving sub-item:', error);
      alert('Failed to save sub-item');
    }
  };

  const handleEdit = (subItem) => {
    setEditingSubItem(subItem);
    setFormData({
      title: subItem.title,
      description: subItem.description || '',
      status: subItem.status,
      priority: subItem.priority,
      timeline_start: subItem.timeline_start || '',
      timeline_end: subItem.timeline_end || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sub-item?')) return;

    try {
      await deleteSubItem(id);
      await fetchSubItems();
      onRefresh();
    } catch (error) {
      console.error('Error deleting sub-item:', error);
      alert('Failed to delete sub-item');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Sub-items: {parentItem.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <button
          onClick={() => {
            setShowForm(true);
            setEditingSubItem(null);
            setFormData({
              title: '',
              description: '',
              status: 'to_do',
              priority: 'Medium',
              timeline_start: '',
              timeline_end: ''
            });
          }}
          className="mb-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + Add Sub-item
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="to_do">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingSubItem(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                {editingSubItem ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div>Loading sub-items...</div>
        ) : subItems.length === 0 ? (
          <p className="text-gray-500">No sub-items yet. Add one to get started!</p>
        ) : (
          <div className="space-y-2">
            {subItems.map((subItem) => (
              <div
                key={subItem.id}
                className="p-4 bg-gray-50 rounded-lg flex justify-between items-start"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{subItem.title}</h3>
                  {subItem.description && (
                    <p className="text-sm text-gray-600 mt-1">{subItem.description}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {subItem.status}
                    </span>
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                      {subItem.priority}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(subItem)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(subItem.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SubItemModal;

