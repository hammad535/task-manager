import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BoardView from './components/BoardView';
import { Toaster } from './components/ui/toaster';
import { getBoards, getBoardById } from './services/api';
import { transformBoard } from './utils/dataTransform';

function App() {
  const [boards, setBoards] = useState([]);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchBoards = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBoards();
      if (response.data.success) {
        const transformedBoards = response.data.data.map(transformBoard);
        setBoards(transformedBoards);
        if (transformedBoards.length > 0) {
          // Fetch full board data for first board
          await fetchFullBoardData(transformedBoards[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
      setBoards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const fetchFullBoardData = async (boardId) => {
    try {
      const response = await getBoardById(boardId);
      if (response.data.success) {
        const transformedBoard = transformBoard(response.data.data);
        setCurrentBoard(transformedBoard);
      }
    } catch (error) {
      console.error('Error fetching board data:', error);
    }
  };

  const handleUpdateBoard = async (updatedBoard) => {
    // After any update, refetch the board to get latest data
    await fetchFullBoardData(updatedBoard.id);
  };

  const handleBoardChange = async (board) => {
    // Fetch full board data when switching boards
    await fetchFullBoardData(board.id);
  };

  const handleBoardCreated = async () => {
    // Refresh boards list after creating a new board
    await fetchBoards();
    // The board selection will be handled by Sidebar's onBoardChange callback
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-gray-600">Loading boards...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-hidden">
      <Toaster />

      {/* Mobile sidebar (drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85vw]">
            <Sidebar
              boards={boards}
              currentBoard={currentBoard}
              onBoardChange={handleBoardChange}
              onBoardCreated={handleBoardCreated}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block h-screen">
        <Sidebar 
          boards={boards} 
          currentBoard={currentBoard} 
          onBoardChange={handleBoardChange}
          onBoardCreated={handleBoardCreated}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {currentBoard ? (
          <>
            <Header currentBoard={currentBoard} onOpenSidebar={() => setSidebarOpen(true)} />
            <BoardView 
              board={currentBoard} 
              onUpdateBoard={handleUpdateBoard}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-gray-600 text-lg mb-2">No boards available</div>
              <div className="text-gray-500 text-sm">Use the sidebar to create a new board</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
