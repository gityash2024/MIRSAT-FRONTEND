import { MODULE_PERMISSIONS, ROLES } from './permissions';

// Keep this order aligned with the manager sidebar. The first module the manager
// can access is their landing page after login.
const MANAGER_MODULE_ROUTES = [
  { permission: MODULE_PERMISSIONS.DASHBOARD, path: '/dashboard' },
  { permission: MODULE_PERMISSIONS.TASKS, path: '/tasks' },
  { permission: MODULE_PERMISSIONS.USERS, path: '/users' },
  { permission: MODULE_PERMISSIONS.TEMPLATE, path: '/inspection' },
  { permission: MODULE_PERMISSIONS.ASSETS, path: '/assets' },
  { permission: MODULE_PERMISSIONS.QUESTIONNAIRES, path: '/questionnaire' },
  { permission: MODULE_PERMISSIONS.CALENDAR, path: '/calendar' },
  { permission: MODULE_PERMISSIONS.PROFILE, path: '/profile' },
];

export const getDefaultRouteForUser = (user) => {
  if (!user) return '/login';

  if (user.role === ROLES.INSPECTOR) {
    return '/user-dashboard';
  }

  if (user.role === ROLES.MANAGER) {
    const permissions = new Set(user.permissions || []);
    const firstPermittedModule = MANAGER_MODULE_ROUTES.find(({ permission }) => permissions.has(permission));

    // Calendar and Profile are mandatory manager modules. Profile remains a
    // safe route for older manager records that predate those permissions.
    return firstPermittedModule?.path || '/profile';
  }

  return '/dashboard';
};

export const canAccessDashboard = (user) => (
  user?.role !== ROLES.MANAGER || user.permissions?.includes(MODULE_PERMISSIONS.DASHBOARD)
);
