import React, { useState } from 'react';

const GroupHeader = ({ group, onRename, onDelete, onCreateItem }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editName.trim() && editName !== group.name) {
      onRename(group.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleBlur = () => {
    if (editName.trim() && editName !== group.name) {
      onRename(group.id, editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="flex justify-between items-center mb-4">
      {isEditing ? (
        <input
          type="text"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit(e);
            if (e.key === 'Escape') {
              setEditName(group.name);
              setIsEditing(false);
            }
          }}
          className="font-semibold text-gray-900 px-2 py-1 border-2 border-indigo-500 rounded focus:outline-none"
          autoFocus
        />
      ) : (
        <h2
          onClick={() => setIsEditing(true)}
          className="font-semibold text-gray-900 cursor-pointer hover:text-indigo-600"
          title="Click to rename"
        >
          {group.name}
        </h2>
      )}
      <div className="flex space-x-2">
        <button
          onClick={() => onCreateItem(group)}
          className="text-indigo-600 hover:text-indigo-800 text-sm"
        >
          + Item
        </button>
        <button
          onClick={() => onDelete(group.id)}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default GroupHeader;


