import { MODULE_PERMISSIONS, ROLES } from './permissions';

export const getDefaultRouteForUser = (user) => {
  if (!user) return '/login';

  if (user.role === ROLES.INSPECTOR) {
    return '/user-dashboard';
  }

  if (user.role === ROLES.MANAGER) {
    return '/dashboard';
  }

  return '/dashboard';
};

export const canAccessDashboard = (user) => (
  Boolean(user) && (user.role === ROLES.MANAGER || user.permissions?.includes(MODULE_PERMISSIONS.DASHBOARD))
);
