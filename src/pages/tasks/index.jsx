import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TaskList from './TaskList';

const Tasks = () => {
  const location = useLocation();
  const isListView = location.pathname === '/tasks';

  return (
    <div>
      {isListView ? (
        <TaskList />
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default Tasks;