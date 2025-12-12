import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Board } from '../components/Board';
import { TaskDetailsPage } from '../pages/TaskDetailsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Board />} />
      <Route path="/task/:taskId" element={<TaskDetailsPage />} />
    </Routes>
  );
};

