import { PERMISSIONS } from '../utils/permissions';

export const navigation = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: DashboardIcon
  },
  {
    title: 'Users',
    path: '/users',
    icon: PeopleIcon,
    permission: PERMISSIONS.VIEW_USERS
  },
  {
    title: 'Tasks',
    path: '/tasks',
    icon: TaskIcon,
    permission: PERMISSIONS.VIEW_TASKS
  },
  {
    title: 'Reports',
    path: '/reports',
    icon: ReportIcon,
    permission: PERMISSIONS.VIEW_REPORTS
  },
  // ... other navigation items
];