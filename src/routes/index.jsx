import React from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import LegalPage from '../pages/legal/LegalPage';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

import Dashboard from '../pages/Dashboard';
import FlaggedItems from '../pages/flaggedItems/FlaggedItems';
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
import Documents, { UploadDocument } from '../pages/maintenance/Documents';
import FaultReports, { CreateFaultReport, FaultDetail, FaultWorkOrder } from '../pages/maintenance/FaultReports';
import StockMovement from '../pages/maintenance/StockMovement';
import PartEditor from '../pages/maintenance/PartEditor';
import WarehousePage, { SparePartDetail } from '../pages/maintenance/Warehouse';
import AssetProfile from '../pages/maintenance/AssetProfile';
import PlansIndex from '../pages/maintenance/plans/PlansIndex';
import PlanEditor from '../pages/maintenance/plans/PlanEditor';
import PlanDetails from '../pages/maintenance/plans/PlanDetails';
import { PlanGate } from '../pages/maintenance/plans/PlanUI';
import AssetRegister, { CreateAsset, EditAsset } from '../pages/maintenance/AssetRegister';

import UserDashboard from '../pages/UserDashboard';
import UserTasks from '../pages/UserTasks/index';
import UserTaskDetail from '../pages/UserTasks/UserTaskDetail';

// `/inspection` was historically used for the template UI. Keep old bookmarks
// working while every visible navigation path uses the unambiguous `/templates`.
const LegacyTemplateRedirect = () => {
  const { '*': legacyPath = '' } = useParams();
  const location = useLocation();
  const suffix = legacyPath ? `/${legacyPath}` : '';
  return <Navigate replace to={`/templates${suffix}${location.search}${location.hash}`} />;
};
import PreInspectionQuestionnaire from '../pages/UserTasks/PreInspectionQuestionnaire';
import UserProfile from '../pages/profile';
// import AgentAdmin from '../pages/agentAdmin';
import LogsList from '@/pages/logs/LogsList.jsx';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/permissions';
import { canAccessDashboard, getDefaultRouteForUser } from '../utils/defaultRoute';

// Wrapper component to ensure proper re-mounting on route changes
const UserTaskDetailWrapper = () => {
  const { taskId } = useParams();
  const location = useLocation();
  
  // Use both taskId and pathname to ensure component remounts on navigation
  return <UserTaskDetail key={`${taskId}-${location.pathname}`} />;
};

const DashboardRoute = () => {
  const { user } = useAuth();

  if (!canAccessDashboard(user)) {
    return <Navigate to={getDefaultRouteForUser(user)} replace />;
  }

  return <Dashboard />;
};

const PlansRoute = () => {
  const { search } = useLocation();
  return <PlansIndex key={search} initialTable={new URLSearchParams(search).get("view") === "table"} />;
};

const AppRoutes = () => {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to={getDefaultRouteForUser(user)} replace />
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
      <Route path="/privacy-policy" element={<LegalPage documentType="privacy" />} />
      <Route path="/terms-and-conditions" element={<LegalPage documentType="terms" />} />

      {/* Admin, Manager, and Supervisor Routes - Shared Access */}
      <Route element={<PrivateRoute allowedRoles={[ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPERVISOR]} />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardRoute />} />
          <Route path="/flagged-items" element={<FlaggedItems />} />
          
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
      <Route element={<PrivateRoute allowedRoles={[ROLES.SUPERADMIN, ROLES.ADMIN, ROLES.MANAGER]} />}>
        <Route element={<MainLayout />}>
          <Route path="/users" element={<UserList />} />
          <Route path="/users/create" element={<UserCreate />} />
          <Route path="/users/:userId" element={<UserView />} />
          <Route path="/users/:userId/edit" element={<UserEdit />} />
          
          <Route path="/templates" element={<InspectionLevel />}>
            <Route index element={<InspectionLevelList />} />
            <Route path="tree" element={<InspectionLevelTree />} />
          </Route>
          <Route path="/templates/create/*">
            <Route index element={<Navigate to="build" replace />} />
            <Route path="build" element={<InspectionLevelForm />} />
            <Route path="report" element={<InspectionReportView isCreating={true} />} />
          </Route>
          <Route path="/templates/:id">
            <Route index element={<Navigate to="build" replace />} />
            <Route path="build" element={<InspectionLevelView />} />
            <Route path="report" element={<InspectionReportView />} />
            <Route path="edit/*">
              <Route index element={<Navigate to="build" replace />} />
              <Route path="build" element={<InspectionLevelForm />} />
              <Route path="report" element={<InspectionReportView isEditing={true} />} />
            </Route>
          </Route>
          <Route path="/inspection/*" element={<LegacyTemplateRedirect />} />
          
          <Route path="/questionnaire" element={<QuestionnaireList />} />
          <Route path="/questionnaire/create" element={<QuestionCreate />} />
          <Route path="/questionnaire/edit/:id" element={<QuestionCreate />} />
          
          <Route path="/maintenance-plans" element={<PlanGate><PlansRoute /></PlanGate>} />
          <Route path="/maintenance-plans/create" element={<PlanGate><PlanEditor /></PlanGate>} />
          <Route path="/maintenance-plans/:id/edit" element={<PlanGate><PlanEditor /></PlanGate>} />
          <Route path="/maintenance-plans/:id" element={<PlanGate><PlanDetails /></PlanGate>} />
          <Route path="/maintenance-plans/:id/tasks" element={<PlanGate><PlanDetails mode="orders" /></PlanGate>} />
          <Route path="/maintenance-plans/:id/tasks/:occurrenceId" element={<PlanGate><PlanDetails mode="order" /></PlanGate>} />
          <Route path="/assets" element={<AssetRegister />} />
          <Route path="/assets/create" element={<CreateAsset />} />
          <Route path="/assets/manage" element={<AssetList />} />
          <Route path="/assets/:id/edit" element={<EditAsset />} />
          <Route path="/assets/:id" element={<AssetProfile />} />
          <Route path="/assets/:id/equipment/:equipmentId" element={<AssetProfile />} />

          <Route path="/reports/*" element={<Reports />} />

          {/* v4: AI agent governance (permissions matrix + usage); admin-only, additive route */}
          {/* <Route path="/agent-admin" element={<AgentAdmin />} /> */}
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
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/upload" element={<UploadDocument />} />
          <Route path="/fault-reports" element={<FaultReports />} />
          <Route path="/fault-reports/create" element={<CreateFaultReport />} />
          <Route path="/fault-reports/:id" element={<FaultDetail />} />
          <Route path="/fault-reports/:id/work-order" element={<FaultWorkOrder />} />
          <Route path="/spare-parts" element={<WarehousePage />} />
          <Route path="/spare-parts/create" element={<PartEditor />} />
          <Route path="/spare-parts/:id/movements/:operation" element={<StockMovement />} />
          <Route path="/spare-parts/:id/edit" element={<PartEditor />} />
          <Route path="/spare-parts/:id" element={<SparePartDetail />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/logs/*" element={<LogsList />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
