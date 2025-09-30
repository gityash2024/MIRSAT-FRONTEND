import React from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

import Dashboard from '../pages/Dashboard';
import Notifications from '../pages/notifications';

import Tasks from '../pages/tasks';
import TaskList from '../pages/tasks/TaskList';
import TaskCreate from '../pages/tasks/TaskCreate';
import TaskEdit from '../pages/tasks/TaskEdit';
import TaskDetailsView from '../pages/tasks/TaskDetailsView';

import UserList from '../pages/users/UserList';
import UserCreate from '../pages/users/UserCreate';
import UserEdit from '../pages/users/UserEdit';
import UserView from '../pages/users/UserView';

import InspectionLevel from '../pages/inspection';
import InspectionLevelList from '../pages/inspection/InspectionLevelList';
import InspectionLevelTree from '../pages/inspection/InspectionLevelTree';
import InspectionLevelForm from '../pages/inspection/InspectionLevelForm';
import InspectionLevelView from '../pages/inspection/InspectionLevelView';
import InspectionReportView from '../pages/inspection/InspectionReportView';

// Questionnaire module imports (renamed to reflect that it's actually the Question Library)
import QuestionnaireList from '../pages/questionnaire/QuestionnaireList';
import QuestionCreate from '../pages/questionnaire/QuestionnaireCreate';

import Calendar from '../pages/calendar';
import Settings from '../pages/settings';
import Reports from '../pages/reports';
import CalendarView from '../pages/calendar/CalendarView';
import AssetList from '../pages/assets';

import UserDashboard from '../pages/UserDashboard';
import UserTasks from '../pages/UserTasks/index';
import UserTaskDetail from '../pages/UserTasks/UserTaskDetail';
import PreInspectionQuestionnaire from '../pages/UserTasks/PreInspectionQuestionnaire';
import UserProfile from '../pages/profile';
import LogsList from '@/pages/logs/LogsList.jsx';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/permissions';

// Wrapper component to ensure proper re-mounting on route changes
const UserTaskDetailWrapper = () => {
  const { taskId } = useParams();
  const location = useLocation();
  
  // Use both taskId and pathname to ensure component remounts on navigation
  return <UserTaskDetail key={`${taskId}-${location.pathname}`} />;
};

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

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin, Manager, and Supervisor Routes - Shared Access */}
      <Route element={<PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPERVISOR]} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/notifications" element={<Notifications />} />
          
          <Route path="/tasks" element={<Tasks />}>
            <Route index element={<TaskList />} />
          </Route>
          <Route path="/tasks/create" element={<TaskCreate />} />
          <Route path="/tasks/:taskId" element={<TaskDetailsView />} />
          <Route path="/tasks/:taskId/edit" element={<TaskEdit />} />
          
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/calendar-view" element={<CalendarView />} />
        </Route>
      </Route>

      {/* Admin and Manager Routes - Full Access Only */}
      <Route element={<PrivateRoute allowedRoles={[ROLES.ADMIN, ROLES.MANAGER]} />}>
        <Route element={<MainLayout />}>
          <Route path="/users" element={<UserList />} />
          <Route path="/users/create" element={<UserCreate />} />
          <Route path="/users/:userId" element={<UserView />} />
          <Route path="/users/:userId/edit" element={<UserEdit />} />
          
          <Route path="/inspection" element={<InspectionLevel />}>
            <Route index element={<InspectionLevelList />} />
            <Route path="tree" element={<InspectionLevelTree />} />
          </Route>
          <Route path="/inspection/create/*">
            <Route index element={<Navigate to="build" replace />} />
            <Route path="build" element={<InspectionLevelForm />} />
            <Route path="report" element={<InspectionReportView isCreating={true} />} />
          </Route>
          <Route path="/inspection/:id">
            <Route index element={<Navigate to="build" replace />} />
            <Route path="build" element={<InspectionLevelView />} />
            <Route path="report" element={<InspectionReportView />} />
            <Route path="edit/*">
              <Route index element={<Navigate to="build" replace />} />
              <Route path="build" element={<InspectionLevelForm />} />
              <Route path="report" element={<InspectionReportView isEditing={true} />} />
            </Route>
          </Route>
          
          <Route path="/questionnaire" element={<QuestionnaireList />} />
          <Route path="/questionnaire/create" element={<QuestionCreate />} />
          <Route path="/questionnaire/edit/:id" element={<QuestionCreate />} />
          
          <Route path="/assets" element={<AssetList />} />
          
          <Route path="/reports/*" element={<Reports />} />
        </Route>
      </Route>

      {/* Inspector Routes */}
      <Route element={<PrivateRoute allowedRoles={[ROLES.INSPECTOR]} />}>
        <Route element={<MainLayout />}>
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/user-tasks" element={<UserTasks />} />
          <Route path="/user-tasks/:taskId" element={<UserTaskDetailWrapper />} />
          <Route path="/user-tasks/:taskId/questionnaire" element={<PreInspectionQuestionnaire />} />
        </Route>
      </Route>
      
      {/* Common Routes for All Authenticated Users */}
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/logs/*" element={<LogsList />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;