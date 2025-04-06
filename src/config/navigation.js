import {
  LayoutDashboard,
  Clipboard,
  Users,
  Settings,
  Calendar,
  ListChecks,
  FileBarChart,
  User
} from 'lucide-react';

const navigation = {
  admin: [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Tasks',
      path: '/tasks',
      icon: Clipboard
    },
    {
      title: 'Users',
      path: '/users',
      icon: Users
    },
    {
      title: 'Template',
      path: '/inspection-levels',
      icon: ListChecks
    },
    {
      title: 'Reports',
      path: '/reports',
      icon: FileBarChart
    },
    {
      title: 'Calendar',
      path: '/calendar',
      icon: Calendar
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: Settings
    }
  ],
  manager: [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Tasks',
      path: '/tasks',
      icon: Clipboard
    },
    {
      title: 'Template',
      path: '/inspection-levels',
      icon: ListChecks
    },
    {
      title: 'Reports',
      path: '/reports',
      icon: FileBarChart
    },
    {
      title: 'Calendar',
      path: '/calendar',
      icon: Calendar
    }
  ],
  inspector: [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'Tasks',
      path: '/tasks',
      icon: Clipboard
    },
    {
      title: 'Calendar',
      path: '/calendar',
      icon: Calendar
    }
  ],
  user: [
    {
      title: 'Dashboard',
      path: '/user-dashboard',
      icon: LayoutDashboard
    },
    {
      title: 'My Tasks',
      path: '/user-tasks',
      icon: Clipboard
    },
    {
      title: 'My Profile',
      path: '/profile',
      icon: User
    }
  ]
};

export default navigation;