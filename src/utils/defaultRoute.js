import { MODULE_PERMISSIONS, ROLES } from './permissions';

const MANAGER_MODULE_ROUTES = [
  { permission: MODULE_PERMISSIONS.DASHBOARD, path: '/dashboard' },
  { permission: MODULE_PERMISSIONS.TASKS, path: '/tasks' },
  { permission: MODULE_PERMISSIONS.USERS, path: '/users' },
  { permission: MODULE_PERMISSIONS.TEMPLATE, path: '/inspection' },
  { permission: MODULE_PERMISSIONS.ASSETS, path: '/assets' },
  { permission: MODULE_PERMISSIONS.QUESTIONNAIRES, path: '/questionnaire' },
  { permission: MODULE_PERMISSIONS.CALENDAR, path: '/calendar' },
];

export const getDefaultRouteForUser = (user) => {
  if (!user) return '/login';

  if (user.role === ROLES.INSPECTOR) {
    return '/user-dashboard';
  }

  if (user.role === ROLES.MANAGER) {
    const permissions = new Set(user.permissions || []);
    const firstPermittedModule = MANAGER_MODULE_ROUTES.find(({ permission }) => permissions.has(permission));
    return firstPermittedModule?.path || '/profile';
  }

  return '/dashboard';
};

// Administrators and supervisors have Dashboard by role. Managers have it
// only when the corresponding module permission is assigned.
export const canAccessDashboard = (user) => (
  Boolean(user) && [
    ROLES.SUPERADMIN,
    ROLES.ADMIN,
    ROLES.SUPERVISOR,
  ].includes(user.role)
  || Boolean(user?.role === ROLES.MANAGER
    && user.permissions?.includes(MODULE_PERMISSIONS.DASHBOARD))
);
