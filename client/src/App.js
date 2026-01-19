import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BoardView from './components/BoardView';
import { getBoards, getBoardById } from './services/api';
import { transformBoard } from './utils/dataTransform';

function App() {
  const [boards, setBoards] = useState([]);
  const [currentBoard, setCurrentBoard] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        boards={boards} 
        currentBoard={currentBoard} 
        onBoardChange={handleBoardChange}
        onBoardCreated={handleBoardCreated}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {currentBoard ? (
          <>
            <Header currentBoard={currentBoard} />
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
