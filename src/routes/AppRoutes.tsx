import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Board } from '../components/Board';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Board />} />
      <Route path="/task/:taskId" element={<Board />} />
    </Routes>
  );
};

