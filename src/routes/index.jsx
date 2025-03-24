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
import AssetList from '../pages/assets';

import UserDashboard from '../pages/UserDashboard';
import UserTasks from '../pages/UserTasks/index';
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
            user?.role === ROLES.INSPECTOR ? (
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

              <Login />
            
        }
      />

      <Route path="/admin">
        <Route element={<PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.INSPECTOR]} />}>
          <Route element={<MainLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="notifications" element={<Notifications />} />
            
            <Route path="tasks" element={<Tasks />}>
              <Route index element={<TaskList />} />
            </Route>
            <Route path="tasks/create" element={<TaskCreate />} />
            <Route path="tasks/:taskId" element={<TaskView />} />
            <Route path="tasks/:taskId/edit" element={<TaskEdit />} />
            
            <Route path="users" element={<UserList />} />
            <Route path="users/create" element={<UserCreate />} />
            <Route path="users/:userId" element={<UserView />} />
            <Route path="users/:userId/edit" element={<UserEdit />} />
            
            <Route path="inspection" element={<InspectionLevel />}>
              <Route index element={<InspectionLevelList />} />
              <Route path="tree" element={<InspectionLevelTree />} />
            </Route>
            <Route path="inspection/create" element={<InspectionLevelForm />} />
            <Route path="inspection/:id" element={<InspectionLevelView />} />
            <Route path="inspection/:id/edit" element={<InspectionLevelForm />} />
            
            <Route path="assets" element={<AssetList />} />
            
            <Route path="calendar" element={<Calendar />} />
            <Route path="calendar-view" element={<CalendarView />} />
            
            <Route path="reports/*" element={<Reports />} />
            
            <Route path="settings" element={<UserProfile />} />
            {/* <Route path="settings" element={<Settings />} /> */}
            {/* <Route path="settings/*" element={<Settings />} /> */}
          </Route>
        </Route>
      </Route>
      
      <Route element={<PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.INSPECTOR]} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<Notifications />} />
          
          <Route path="/tasks" element={<Tasks />}>
            <Route index element={<TaskList />} />
          </Route>
          <Route path="/tasks/create" element={<TaskCreate />} />
          <Route path="/tasks/:taskId" element={<TaskView />} />
          <Route path="/tasks/:taskId/edit" element={<TaskEdit />} />
          
          <Route path="/users" element={<UserList />} />
          <Route path="/users/create" element={<UserCreate />} />
          <Route path="/users/:userId" element={<UserView />} />
          <Route path="/users/:userId/edit" element={<UserEdit />} />
          
          <Route path="/inspection" element={<InspectionLevel />}>
            <Route index element={<InspectionLevelList />} />
            <Route path="tree" element={<InspectionLevelTree />} />
          </Route>
          <Route path="/inspection/create" element={<InspectionLevelForm />} />
          <Route path="/inspection/:id" element={<InspectionLevelView />} />
          <Route path="/inspection/:id/edit" element={<InspectionLevelForm />} />
          
          <Route path="/assets" element={<AssetList />} />
          
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/calendar-view" element={<CalendarView />} />
          
          <Route path="/reports/*" element={<Reports />} />
          
          <Route path="/settings" element={<UserProfile />} />
          {/* <Route path="/settings" element={<Settings />} />
          <Route path="/settings/*" element={<Settings />} /> */}
        </Route>
      </Route>
      
      <Route element={<PrivateRoute allowedRoles={[ROLES.INSPECTOR]} />}>
        <Route element={<MainLayout />}>
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/user-tasks" element={<UserTasks />} />
          <Route path="/user-tasks/:taskId" element={<UserTaskDetail />} />
        </Route>
      </Route>
      
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/profile" element={<UserProfile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;