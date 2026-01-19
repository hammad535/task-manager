import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBoards, createBoard, deleteBoard } from '../services/api';

const BoardDashboard = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const response = await getBoards();
      if (response.data.success) {
        setBoards(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    try {
      const response = await createBoard({ name: newBoardName, created_by: 1 });
      if (response.data.success) {
        setBoards([response.data.data, ...boards]);
        setNewBoardName('');
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating board:', error);
      alert('Failed to create board');
    }
  };

  const handleDeleteBoard = async (id) => {
    if (!window.confirm('Are you sure you want to delete this board?')) return;

    try {
      const response = await deleteBoard(id);
      if (response.data.success) {
        setBoards(boards.filter(board => board.id !== id));
      }
    } catch (error) {
      console.error('Error deleting board:', error);
      alert('Failed to delete board');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading boards...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Boards</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          + Create Board
        </button>
      </div>

      {boards.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">No boards yet. Create your first board!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start mb-4">
                <Link
                  to={`/boards/${board.id}`}
                  className="text-xl font-semibold text-gray-900 hover:text-indigo-600"
                >
                  {board.name}
                </Link>
                <button
                  onClick={() => handleDeleteBoard(board.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
              <Link
                to={`/boards/${board.id}`}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                View Board →
              </Link>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-2xl font-bold mb-4">Create New Board</h2>
            <form onSubmit={handleCreateBoard}>
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Board name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewBoardName('');
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
    </div>
  );
};

export default BoardDashboard;

