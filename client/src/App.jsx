import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BoardDashboard from './pages/BoardDashboard';
import BoardDetail from './pages/BoardDetail';
import MyWork from './pages/MyWork';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/boards" replace />} />
          <Route path="/boards" element={<BoardDashboard />} />
          <Route path="/boards/:id" element={<BoardDetail />} />
          <Route path="/mywork" element={<MyWork />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

