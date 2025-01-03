import { createBrowserRouter } from 'react-router-dom';
import { ROLES } from '../utils/permissions';
import PrivateRoute from './PrivateRoute';

const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> }
    ]
  },
  {
    path: '/',
    element: <PrivateRoute><MainLayout /></PrivateRoute>,
    children: [
      { 
        path: 'dashboard', 
        element: <DashboardPage /> 
      },
      { 
        path: 'users', 
        element: (
          <PermissionGate permission="view_users">
            <UsersPage />
          </PermissionGate>
        ) 
      },
      { 
        path: 'tasks', 
        element: <TasksPage /> 
      },
      // ... other routes
    ]
  }
]);

export default router;