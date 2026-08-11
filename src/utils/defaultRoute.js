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

// Dashboard is the landing page for all non-inspector roles in the shared
// admin workspace. Managers have it as a fixed module; administrators and
// supervisors must not be redirected back to this same route when their
// persisted permissions omit the manager-only module flag.
export const canAccessDashboard = (user) => (
  Boolean(user) && [
    ROLES.SUPERADMIN,
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.SUPERVISOR,
  ].includes(user.role)
);
