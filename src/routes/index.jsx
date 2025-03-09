import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import Login from '../pages/Login';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

import Dashboard from '../pages/Dashboard';
import Notifications from '../pages/notifications';

import Tasks from '../pages/tasks';
import TaskList from '../pages/tasks/TaskList';
import TaskCreate from '../pages/tasks/TaskCreate';
import TaskEdit from '../pages/tasks/TaskEdit';
import TaskView from '../pages/tasks/TaskView';

import UserList from '../pages/users/UserList';
import UserCreate from '../pages/users/UserCreate';
import UserEdit from '../pages/users/UserEdit';
import UserView from '../pages/users/UserView';

import InspectionLevel from '../pages/inspection';
import InspectionLevelList from '../pages/inspection/InspectionLevelList';
import InspectionLevelTree from '../pages/inspection/InspectionLevelTree';
import InspectionLevelForm from '../pages/inspection/InspectionLevelForm';
import InspectionLevelView from '../pages/inspection/InspectionLevelView';

import Calendar from '../pages/calendar';
import Settings from '../pages/settings';
import Reports from '../pages/reports';
import CalendarView from '../pages/calendar/CalendarView';

import UserDashboard from '../pages/UserDashboard';
import UserTasks from '../pages/UserTasks';
import UserTaskDetail from '../pages/UserTasks/UserTaskDetail';
import UserProfile from '../pages/profile';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/permissions';

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            user?.role === ROLES.USER ? (
              <Navigate to="/user-dashboard" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthLayout>
              <Login />
            </AuthLayout>
          </PublicRoute>
        }
      />

      {/* Admin and Management Routes */}
      <Route element={<PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.INSPECTOR]} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<Notifications />} />
          
          {/* Tasks Routes */}
          <Route path="/tasks" element={<Tasks />}>
            <Route index element={<TaskList />} />
          </Route>
          <Route path="/tasks/create" element={<TaskCreate />} />
          <Route path="/tasks/:taskId" element={<TaskView />} />
          <Route path="/tasks/:taskId/edit" element={<TaskEdit />} />
          
          {/* Users Routes */}
          <Route path="/users" element={<UserList />} />
          <Route path="/users/create" element={<UserCreate />} />
          <Route path="/users/:userId" element={<UserView />} />
          <Route path="/users/:userId/edit" element={<UserEdit />} />
          
          {/* Inspection Levels Routes */}
          <Route path="/inspection" element={<InspectionLevel />}>
            <Route index element={<InspectionLevelList />} />
            <Route path="tree" element={<InspectionLevelTree />} />
          </Route>
          <Route path="/inspection/create" element={<InspectionLevelForm />} />
          <Route path="/inspection/:id" element={<InspectionLevelView />} />
          <Route path="/inspection/:id/edit" element={<InspectionLevelForm />} />
          
          {/* Calendar Route */}
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/calendar-view" element={<CalendarView />} />
          
          {/* Reports Route */}
          <Route path="/reports/*" element={<Reports />} />
          
          {/* Settings Route */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/*" element={<Settings />} />
        </Route>
      </Route>
      
      {/* User Routes */}
      <Route element={<PrivateRoute allowedRoles={[ROLES.USER]} />}>
        <Route element={<MainLayout />}>
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/user-tasks" element={<UserTasks />} />
          <Route path="/user-tasks/:taskId" element={<UserTaskDetail />} />
        </Route>
      </Route>
      
      {/* Common Routes (accessible to all authenticated users) */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/profile" element={<UserProfile />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;