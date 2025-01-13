// src/pages/tasks/index.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TaskList from './TaskList';

const Tasks = () => {
  const location = useLocation();
  const isListView = location.pathname === '/tasks';

  return (
    <div>
      {isListView ? (
        // Show TaskList component directly when on the main tasks route
        <TaskList />
      ) : (
        // Show nested routes (create, edit, view) using Outlet
        <Outlet />
      )}
    </div>
  );
};

export default Tasks;