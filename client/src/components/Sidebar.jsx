import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Search, Home, BarChart3, Calendar, Settings, Users } from 'lucide-react';
import { createBoard } from '../services/api';

const Sidebar = ({ boards, currentBoard, onBoardChange, onBoardCreated }) => {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreateBoard = async () => {
    const boardName = prompt('Enter board name:');
    if (!boardName || !boardName.trim()) return;
    
    try {
      const response = await createBoard({ name: boardName.trim() });
      if (response.data.success) {
        // Refresh boards list
        if (onBoardCreated) {
          await onBoardCreated();
        }
        // Switch to the new board
        if (response.data.data && onBoardChange) {
          onBoardChange({ id: response.data.data.id, name: response.data.data.name });
        }
      }
    } catch (error) {
      console.error('Error creating board:', error);
      alert('Failed to create board. Please try again.');
    }
  };

  const menuItems = [
    { icon: Home, label: 'Home', active: false },
    { icon: BarChart3, label: 'Dashboards', active: false },
    { icon: Calendar, label: 'My Calendar', active: false },
    { icon: Users, label: 'Team', active: false }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          </div>
          <span className="font-bold text-xl">EmarsPro</span>
        </div>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-2 py-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition-colors ${
              item.active ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="border-t border-gray-200 my-2"></div>

      {/* Workspace */}
      <div className="flex-1 overflow-y-auto px-2">
        <div>
          <button
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            <span>My Workspace</span>
            {isWorkspaceOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {isWorkspaceOpen && (
            <div className="mt-1 space-y-1">
              {boards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => onBoardChange(board)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors ${
                    currentBoard?.id === board.id ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: board.color }}></div>
                  <span className="truncate">{board.name}</span>
                </button>
              ))}
              {/* Add board button */}
              <button 
                onClick={handleCreateBoard}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add board</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="border-t border-gray-200 p-2">
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;