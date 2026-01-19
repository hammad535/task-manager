import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBoardById, createGroup, updateGroup, deleteGroup } from '../services/api';
import { getItems, createItem, updateItem, deleteItem } from '../services/api';
import ItemCard from '../components/ItemCard';
import ItemModal from '../components/ItemModal';
import SubItemModal from '../components/SubItemModal';
import GroupHeader from '../components/GroupHeader';

const BoardDetail = () => {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [groups, setGroups] = useState([]);
  const [items, setItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showSubItemModal, setShowSubItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchBoardData();
  }, [id]);

  const fetchBoardData = async () => {
    try {
      const response = await getBoardById(id);
      if (response.data.success) {
        setBoard(response.data.data);
        setGroups(response.data.data.groups || []);
        fetchItemsForGroups(response.data.data.groups || []);
      }
    } catch (error) {
      console.error('Error fetching board:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemsForGroups = async (groupsList) => {
    const itemsMap = {};
    for (const group of groupsList) {
      try {
        const response = await getItems({ group_id: group.id });
        if (response.data.success) {
          itemsMap[group.id] = response.data.data;
        }
      } catch (error) {
        console.error(`Error fetching items for group ${group.id}:`, error);
        itemsMap[group.id] = [];
      }
    }
    setItems(itemsMap);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    try {
      const response = await createGroup({ name: newGroupName, board_id: id });
      if (response.data.success) {
        setGroups([...groups, response.data.data]);
        setItems({ ...items, [response.data.data.id]: [] });
        setNewGroupName('');
        setShowGroupModal(false);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      alert('Failed to create group');
    }
  };

  const handleRenameGroup = async (groupId, newName) => {
    try {
      const response = await updateGroup(groupId, { name: newName });
      if (response.data.success) {
        setGroups(groups.map(g => g.id === groupId ? response.data.data : g));
      }
    } catch (error) {
      console.error('Error renaming group:', error);
      alert('Failed to rename group');
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;

    try {
      const response = await deleteGroup(groupId);
      if (response.data.success) {
        setGroups(groups.filter(g => g.id !== groupId));
        const newItems = { ...items };
        delete newItems[groupId];
        setItems(newItems);
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group');
    }
  };

  const handleCreateItem = (group) => {
    setSelectedGroup(group);
    setEditingItem(null);
    setShowItemModal(true);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setSelectedGroup(groups.find(g => g.id === item.group_id));
    setShowItemModal(true);
  };

  const handleSaveItem = async (itemData) => {
    try {
      if (editingItem) {
        const response = await updateItem(editingItem.id, itemData);
        if (response.data.success) {
          const updatedItems = { ...items };
          const groupItems = updatedItems[editingItem.group_id] || [];
          const index = groupItems.findIndex(i => i.id === editingItem.id);
          if (index !== -1) {
            groupItems[index] = response.data.data;
            updatedItems[editingItem.group_id] = groupItems;
            setItems(updatedItems);
          }
        }
      } else {
        const response = await createItem({
          ...itemData,
          group_id: selectedGroup.id,
          board_id: id
        });
        if (response.data.success) {
          const updatedItems = { ...items };
          if (!updatedItems[selectedGroup.id]) {
            updatedItems[selectedGroup.id] = [];
          }
          updatedItems[selectedGroup.id].push(response.data.data);
          setItems(updatedItems);
        }
      }
      setShowItemModal(false);
      setEditingItem(null);
      setSelectedGroup(null);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save item');
    }
  };

  const handleDeleteItem = async (itemId, groupId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await deleteItem(itemId);
      if (response.data.success) {
        const updatedItems = { ...items };
        updatedItems[groupId] = updatedItems[groupId].filter(i => i.id !== itemId);
        setItems(updatedItems);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const handleAddSubItem = (item) => {
    setSelectedItem(item);
    setShowSubItemModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading board...</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl text-red-500">Board not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
        <button
          onClick={() => setShowGroupModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          + Add Group
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="flex space-x-4 min-w-max pb-4">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-gray-100 rounded-lg p-4 min-w-[300px] flex-shrink-0"
            >
              <GroupHeader
                group={group}
                onRename={handleRenameGroup}
                onDelete={handleDeleteGroup}
                onCreateItem={handleCreateItem}
              />

              <div className="space-y-3">
                {(items[group.id] || []).map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onEdit={() => handleEditItem(item)}
                    onDelete={() => handleDeleteItem(item.id, group.id)}
                    onAddSubItem={() => handleAddSubItem(item)}
                    onUpdate={(updatedItem) => {
                      const updatedItems = { ...items };
                      if (!updatedItems[group.id]) {
                        updatedItems[group.id] = [];
                      }
                      const index = updatedItems[group.id].findIndex(i => i.id === updatedItem.id);
                      if (index !== -1) {
                        updatedItems[group.id][index] = updatedItem;
                        setItems(updatedItems);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-2xl font-bold mb-4">Create New Group</h2>
            <form onSubmit={handleCreateGroup}>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowGroupModal(false);
                    setNewGroupName('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showItemModal && selectedGroup && (
        <ItemModal
          item={editingItem}
          group={selectedGroup}
          boardId={id}
          onSave={handleSaveItem}
          onClose={() => {
            setShowItemModal(false);
            setEditingItem(null);
            setSelectedGroup(null);
          }}
        />
      )}

      {showSubItemModal && selectedItem && (
        <SubItemModal
          parentItem={selectedItem}
          onClose={() => {
            setShowSubItemModal(false);
            setSelectedItem(null);
          }}
          onRefresh={() => fetchBoardData()}
        />
      )}
    </div>
  );
};

export default BoardDetail;

