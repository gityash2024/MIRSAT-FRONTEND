export const ROLES = {
    ADMIN: 'admin',
    MANAGEMENT: 'management',
    INSPECTOR: 'inspector'
  };
  
  export const PERMISSIONS = {
    CREATE_USER: 'create_user',
    EDIT_USER: 'edit_user',
    DELETE_USER: 'delete_user',
    CREATE_TASK: 'create_task',
    ASSIGN_TASK: 'assign_task',
    VIEW_REPORTS: 'view_reports',
    // ... other permissions
  };
  
  export const ROLE_PERMISSIONS = {
    [ROLES.ADMIN]: [
      ...Object.values(PERMISSIONS)
    ],
    [ROLES.MANAGEMENT]: [
      PERMISSIONS.CREATE_TASK,
      PERMISSIONS.ASSIGN_TASK,
      PERMISSIONS.VIEW_REPORTS
    ],
    [ROLES.INSPECTOR]: [
      PERMISSIONS.VIEW_REPORTS
    ]
  };