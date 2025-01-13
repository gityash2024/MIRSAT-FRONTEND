// src/routes/index.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';

// Auth Pages
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Notifications from '../pages/notifications';

// Main Pages
import Tasks from '../pages/tasks';
import TaskList from '../pages/tasks/TaskList';
import TaskCreate from '../pages/tasks/TaskCreate';
import TaskEdit from '../pages/tasks/TaskEdit';
import TaskView from '../pages/tasks/TaskView';

import Users from '../pages/users';
import UserList from '../pages/users/UserList';
import UserCreate from '../pages/users/UserCreate';
import UserEdit from '../pages/users/UserEdit';

import Calendar from '../pages/calendar';
import Reports from '../pages/reports';
import Settings from '../pages/settings';

import { useAuth } from '../hooks/useAuth';
import UserView from '../pages/users/UserView';

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Route>

      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<Notifications />} />
          
          {/* Tasks Routes */}
          <Route path="/tasks" element={<Tasks />}>
            <Route index element={<TaskList />} />
            <Route path="create" element={<TaskCreate />} />
            <Route path=":taskId" element={<TaskView />} />
            <Route path=":taskId/edit" element={<TaskEdit />} />
          </Route>

          {/* Users Routes - Flattened structure */}
          <Route path="/users" element={<UserList />} />
          <Route path="/users/create" element={<UserCreate />} />
          <Route path="/users/:userId" element={<UserView />} />
          <Route path="/users/:userId/edit" element={<UserEdit />} />

          {/* Calendar Route */}
          <Route path="/calendar" element={<Calendar />} />

          {/* Reports Route */}
          <Route path="/reports" element={<Reports />} />

          {/* Settings Route */}
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;