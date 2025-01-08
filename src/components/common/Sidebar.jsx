import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CalendarIcon,
  Cog6ToothIcon,
  ArrowLeftCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isManagement = user?.role === 'management';

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    ...(isAdmin ? [
      { title: 'Users', path: '/users', icon: UserGroupIcon },
    ] : []),
    { title: 'Tasks', path: '/tasks', icon: ClipboardDocumentListIcon },
    { title: 'Reports', path: '/reports', icon: ChartBarIcon },
    { title: 'Calendar', path: '/calendar', icon: CalendarIcon },
    ...(isAdmin || isManagement ? [
      { title: 'Settings', path: '/settings', icon: Cog6ToothIcon },
    ] : []),
  ];

  return (
    <div className={`bg-gray-800 text-white min-h-screen transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="p-4 flex justify-between items-center">
        {!collapsed && <h1 className="text-xl font-bold">MIRSAT</h1>}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-gray-700">
          <ArrowLeftCircleIcon className={`h-6 w-6 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      <nav className="mt-8">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors
                ${location.pathname === item.path ? 'bg-gray-700 text-white' : ''}`}
            >
              <Icon className="h-6 w-6" />
              {!collapsed && <span className="ml-3">{item.title}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;