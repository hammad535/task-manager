import React from 'react';
import { Menu, Search, Bell, HelpCircle, Star, Filter, ChevronDown, MoreHorizontal } from 'lucide-react';

const Header = ({ currentBoard, onOpenSidebar }) => {
  return (
    <div className="bg-white border-b border-gray-200">
      {/* Top Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-3 sm:px-6 py-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mobile sidebar toggle */}
          {onOpenSidebar && (
            <button
              type="button"
              onClick={onOpenSidebar}
              className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          )}

          <div className="flex items-center gap-2 min-w-0">
            {currentBoard && (
              <>
                <div className="w-3 h-3 rounded" style={{ backgroundColor: currentBoard.color }}></div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{currentBoard.name}</h1>
                <Star className="hidden sm:block w-5 h-5 text-gray-400 cursor-pointer hover:text-yellow-400 transition-colors" />
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search everything"
              className="w-full sm:w-64 pl-9 pr-3 py-2 bg-gray-100 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="hidden sm:inline-flex p-2 hover:bg-gray-100 rounded-md transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
          <button className="hidden sm:inline-flex p-2 hover:bg-gray-100 rounded-md transition-colors">
            <HelpCircle className="w-5 h-5 text-gray-600" />
          </button>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
            ME
          </div>
        </div>
      </div>

      {/* Board Actions */}
      <div className="flex flex-wrap items-center gap-2 px-3 sm:px-6 py-2 border-t border-gray-200">
        <button className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors">
          Main Table
        </button>
        <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
          Kanban
        </button>
        <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
          Calendar
        </button>
        <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
          Timeline
        </button>
        <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
          + Add view
        </button>
        
        <div className="flex-1"></div>
        
        <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
          <Filter className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
        </button>
        <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
          <ChevronDown className="w-4 h-4" />
          <span className="hidden sm:inline">Sort</span>
        </button>
        <button className="hidden sm:inline-flex px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
          Hide
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
          <MoreHorizontal className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default Header;