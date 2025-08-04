// src/utils/permissions.js

export const PERMISSIONS = {
  DASHBOARD: {
    VIEW_DASHBOARD: 'view_dashboard',
    MANAGE_DASHBOARD: 'manage_dashboard'
  },
  USERS: {
    VIEW_USERS: 'view_users',
    CREATE_USERS: 'create_users',
    EDIT_USERS: 'edit_users',
    DELETE_USERS: 'delete_users',
    EXPORT_USERS: 'export_users',
    MANAGE_ROLES: 'manage_roles',
    MANAGE_PERMISSIONS: 'manage_permissions'
  },
  TASKS: {
    VIEW_TASKS: 'view_tasks',
    CREATE_TASKS: 'create_tasks',
    EDIT_TASKS: 'edit_tasks',
    DELETE_TASKS: 'delete_tasks',
    ASSIGN_TASKS: 'assign_tasks',
    REVIEW_TASKS: 'review_tasks'
  },
  INSPECTIONS: {
    VIEW_INSPECTIONS: 'view_inspections',
    CREATE_INSPECTIONS: 'create_inspections',
    EDIT_INSPECTIONS: 'edit_inspections',
    DELETE_INSPECTIONS: 'delete_inspections',
    APPROVE_INSPECTIONS: 'approve_inspections'
  },
  CALENDAR: {
    VIEW_CALENDAR: 'view_calendar',
    MANAGE_CALENDAR: 'manage_calendar',
    SCHEDULE_EVENTS: 'schedule_events'
  },
  SETTINGS: {
    VIEW_SETTINGS: 'view_settings',
    MANAGE_SETTINGS: 'manage_settings',
    SYSTEM_CONFIG: 'system_config'
  }
};

// Module-level permissions for managers (simplified)
export const MODULE_PERMISSIONS = {
  DASHBOARD: 'access_dashboard',
  TASKS: 'access_tasks', 
  USERS: 'access_users',
  TEMPLATE: 'access_template',
  ASSETS: 'access_assets',
  QUESTIONNAIRES: 'access_questionnaires',
  CALENDAR: 'access_calendar',
  PROFILE: 'access_profile'
};

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  INSPECTOR: 'inspector',
};

// Define ALL permissions for admin
const ALL_PERMISSIONS = Object.values(PERMISSIONS).reduce((acc, group) => {
  return [...acc, ...Object.values(group)];
}, []);

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ALL_PERMISSIONS,
  [ROLES.MANAGER]: [
    PERMISSIONS.DASHBOARD.VIEW_DASHBOARD,
    PERMISSIONS.USERS.VIEW_USERS,
    PERMISSIONS.USERS.CREATE_USERS,
    PERMISSIONS.USERS.EDIT_USERS,
    ...Object.values(PERMISSIONS.TASKS),
    ...Object.values(PERMISSIONS.INSPECTIONS),
    ...Object.values(PERMISSIONS.CALENDAR),
    PERMISSIONS.SETTINGS.VIEW_SETTINGS
  ],
  [ROLES.INSPECTOR]: [
    PERMISSIONS.DASHBOARD.VIEW_DASHBOARD,
    PERMISSIONS.USERS.VIEW_USERS,
    PERMISSIONS.TASKS.VIEW_TASKS,
    PERMISSIONS.TASKS.EDIT_TASKS,
    PERMISSIONS.INSPECTIONS.VIEW_INSPECTIONS,
    PERMISSIONS.INSPECTIONS.CREATE_INSPECTIONS,
    PERMISSIONS.INSPECTIONS.EDIT_INSPECTIONS,
    PERMISSIONS.CALENDAR.VIEW_CALENDAR
  ]
};

// Helper function to check if user has permission
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;
  
  // Admin has all permissions
  if (user.role === ROLES.ADMIN) return true;
  
  // For managers, check both module permissions and granular permissions
  if (user.role === ROLES.MANAGER) {
    // Check if it's a module permission
    if (Object.values(MODULE_PERMISSIONS).includes(permission)) {
      return user.permissions && user.permissions.includes(permission);
    }
    // Fall back to granular permissions for existing functionality
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  }
  
  // Other roles - check specific permissions
  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return rolePermissions.includes(permission);
};

// Helper function to check if manager has access to a module
export const hasModuleAccess = (user, module) => {
  console.log('hasModuleAccess called with:', { user: user?.email, role: user?.role, module });
  
  if (!user || !user.role) {
    console.log('No user or role, returning false');
    return false;
  }
  
  // Admin and Inspector have access to all modules
  if (user.role === ROLES.ADMIN || user.role === ROLES.INSPECTOR) {
    console.log('Admin or Inspector, returning true');
    return true;
  }
  
  // For managers, check module permissions
  if (user.role === ROLES.MANAGER) {
    const modulePermission = MODULE_PERMISSIONS[module];
    console.log('Manager check:', { 
      module, 
      modulePermission, 
      userPermissions: user.permissions,
      hasPermission: user.permissions && user.permissions.includes(modulePermission)
    });
    const hasAccess = user.permissions && user.permissions.includes(modulePermission);
    return hasAccess;
  }
  
  console.log('No matching role, returning false');
  return false;
};

// Helper function to get all available permissions for a role
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

// Helper function to check if a user can manage other users
export const canManageUsers = (user) => {
  return user.role === ROLES.ADMIN || user.role === ROLES.MANAGER;
};

// Helper function to get available roles for user creation
export const getAvailableRoles = (userRole) => {
  const roleHierarchy = {
    [ROLES.ADMIN]: [ROLES.MANAGER, ROLES.INSPECTOR],
    [ROLES.MANAGER]: [ROLES.INSPECTOR],
    [ROLES.INSPECTOR]: [],
  };
  
  return roleHierarchy[userRole] || [];
};

export const DEFAULT_PERMISSIONS = {
  [ROLES.ADMIN]: ROLE_PERMISSIONS[ROLES.ADMIN],
  [ROLES.MANAGER]: ROLE_PERMISSIONS[ROLES.MANAGER],
  [ROLES.INSPECTOR]: ROLE_PERMISSIONS[ROLES.INSPECTOR],
};