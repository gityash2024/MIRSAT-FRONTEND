// src/hooks/usePermissions.js

import { useSelector } from 'react-redux';
import { PERMISSIONS, ROLE_PERMISSIONS, ROLES } from '../utils/permissions';

export const usePermissions = () => {
  const user = useSelector(state => state.auth.user);

  const hasPermission = (permission) => {
    if (!user) return false;

    // Admin has all permissions
    if (user.role === ROLES.ADMIN) return true;

    // For other roles, check if they have the specific permission
    if (Array.isArray(user.permissions)) {
      return user.permissions.includes(permission);
    }

    // If no permissions array, check role-based permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role];
    return Array.isArray(rolePermissions) && rolePermissions.includes(permission);
  };

  const hasAnyPermission = (permissions) => {
    if (!Array.isArray(permissions)) {
      return false;
    }
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions) => {
    if (!Array.isArray(permissions)) {
      return false;
    }
    return permissions.every(permission => hasPermission(permission));
  };

  const getAvailableRoles = () => {
    if (!user) return [];
    
    if (user.role === ROLES.ADMIN) {
      // Admin can create all roles except admin
      return Object.values(ROLES).filter(role => role !== ROLES.ADMIN);
    }

    // Other roles can create roles lower in hierarchy
    const roleHierarchy = {
      [ROLES.MANAGER]: [ROLES.INSPECTOR, ROLES.USER],
      [ROLES.INSPECTOR]: [ROLES.USER],
      [ROLES.USER]: []
    };

    return roleHierarchy[user.role] || [];
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getAvailableRoles,
    userRole: user?.role
  };
};

export default usePermissions;