import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import { hasModuleAccess, MODULE_PERMISSIONS } from '../../utils/permissions';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronRight,
  Package,
  HelpCircle,
  User
} from 'lucide-react';

const SidebarContainer = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: ${props => props.width}px;
  background: var(--color-navy);
  color: white;
  transition: width 0.3s ease;
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const LogoSection = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 ${props => props.isOpen ? '20px' : '16px'};
  background: rgba(255, 255, 255, 0.1);

  img {
    height: 32px;
    min-width: 32px;
  }

  span {
    margin-left: 12px;
    font-size: 20px;
    font-weight: 500;
    opacity: ${props => props.isOpen ? 1 : 0};
    transition: opacity 0.3s;
    white-space: nowrap;
  }
`;

const MenuSection = styled.div`
  flex: 1;
  padding: 20px 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
`;

const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px ${props => props.isOpen ? '20px' : '16px'};
  color: white;
  text-decoration: none;
  transition: all 0.3s;
  position: relative;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    background: rgba(255, 255, 255, 0.15);
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background: #fff;
    }
  }

  .icon {
    min-width: 24px;
  }

  span {
    margin-left: 12px;
    opacity: ${props => props.isOpen ? 1 : 0};
    transition: opacity 0.3s;
    white-space: nowrap;
  }
`;

const LogoutSection = styled.div`
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  transition: background 0.3s;
  border-radius: 4px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  span {
    margin-left: 12px;
    opacity: ${props => props.isOpen ? 1 : 0};
    transition: opacity 0.3s;
  }
`;

const Sidebar = ({ isOpen, width }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // FORCE CONSOLE LOG AT THE VERY TOP
  console.log('🚨🚨🚨 SIDEBAR RENDERING - CANNOT MISS THIS LOG');
  console.log('🚨🚨🚨 USER:', user);
  console.log('🚨🚨🚨 USER ROLE:', user?.role);
  console.log('🚨🚨🚨 USER PERMISSIONS:', user?.permissions);

  console.log('🟢 SIDEBAR COMPONENT RENDERED');
  console.log('🟢 Current user from useAuth:', user);
  console.log('🟢 User role:', user?.role);
  console.log('🟢 User permissions:', user?.permissions);
  console.log('🟢 User email:', user?.email);

  // For users, create a restricted menu based on their permissions
  const getUserMenuItems = () => {
    console.log('🔵 getUserMenuItems called (for inspector)');
    const userMenuItems = [
      {
        icon: LayoutDashboard, 
        label: 'Dashboard', 
        path: '/user-dashboard',
        permissions: ['view_tasks']
      },
      {
        icon: ClipboardList, 
        label: 'Tasks', 
        path: '/user-tasks',
        permissions: ['view_tasks']
      }
    ];

    return userMenuItems.filter(item => 
      item.permissions.some(perm => user?.permissions?.includes(perm))
    );
  };

  // For admin and other roles, create a full menu
  const getAdminMenuItems = () => {
    console.log('🔥🔥 getAdminMenuItems called');
    console.log('🔥🔥 Current user:', user);
    
    const allMenuItems = [
      {
        icon: LayoutDashboard, 
        label: 'Dashboard', 
        path: '/dashboard',
        module: 'DASHBOARD',
        permissions: []
      },
      {
        icon: ClipboardList, 
        label: 'Tasks', 
        path: '/tasks',
        module: 'TASKS',
        permissions: ['view_tasks', 'create_tasks', 'edit_tasks', 'delete_tasks']
      },
      {
        icon: Users, 
        label: 'Users', 
        path: '/users',
        module: 'USERS',
        permissions: ['view_users', 'create_users', 'edit_users', 'delete_users']
      },
      {
        icon: FileText, 
        label: 'Templates', 
        path: '/inspection',
        module: 'TEMPLATE',
        permissions: ['view_inspections', 'create_inspections', 'edit_inspections', 'delete_inspections']
      },
      {
        icon: Package, 
        label: 'Assets', 
        path: '/assets',
        module: 'ASSETS',
        permissions: ['view_assets']
      },
      {
        icon: HelpCircle, 
        label: 'Questionnaires', 
        path: '/questionnaire',
        module: 'QUESTIONNAIRES',
        permissions: ['view_inspections', 'create_inspections', 'edit_inspections', 'delete_inspections']
      },
      {
        icon: Calendar, 
        label: 'Calendar', 
        path: '/calendar',
        module: 'CALENDAR',
        permissions: ['view_calendar', 'manage_calendar', 'schedule_events']
      },
      {
        icon: User, 
        label: 'Profile', 
        path: '/profile',
        module: 'PROFILE',
        permissions: []
      }
    ];

    console.log('🔥🔥 All menu items created:', allMenuItems.map(i => ({label: i.label, module: i.module})));
    console.log('🔥🔥 About to check user role:', user?.role);
    console.log('🔥🔥 Is user role === "manager"?', user?.role === 'manager');

    // For managers, filter by module permissions + always show Profile
    if (user?.role === 'manager') {
      console.log('🚨�� MANAGER DETECTED - SIMPLIFIED LOGIC');
      console.log('🚨 User permissions array:', user?.permissions);
      
      const managerMenuItems = [];
      
      // Always add Profile
      managerMenuItems.push({
        icon: User, 
        label: 'Profile', 
        path: '/profile',
        module: 'PROFILE',
        permissions: []
      });
      
      // Add Dashboard if user has access_dashboard permission
      if (user?.permissions?.includes('access_dashboard')) {
        console.log('✅ ADDING DASHBOARD - user has access_dashboard');
        managerMenuItems.push({
          icon: LayoutDashboard, 
          label: 'Dashboard', 
          path: '/dashboard',
          module: 'DASHBOARD',
          permissions: []
        });
      } else {
        console.log('❌ SKIPPING DASHBOARD - user does not have access_dashboard');
      }
      
      // Add Tasks if user has access_tasks permission
      if (user?.permissions?.includes('access_tasks')) {
        console.log('✅ ADDING TASKS - user has access_tasks');
        managerMenuItems.push({
          icon: ClipboardList, 
          label: 'Tasks', 
          path: '/tasks',
          module: 'TASKS',
          permissions: []
        });
      } else {
        console.log('❌ SKIPPING TASKS - user does not have access_tasks');
      }
      
      // Add Users if user has access_users permission
      if (user?.permissions?.includes('access_users')) {
        console.log('✅ ADDING USERS - user has access_users');
        managerMenuItems.push({
          icon: Users, 
          label: 'Users', 
          path: '/users',
          module: 'USERS',
          permissions: []
        });
      }
      
      // Add Template if user has access_template permission
      if (user?.permissions?.includes('access_template')) {
        console.log('✅ ADDING TEMPLATE - user has access_template');
        managerMenuItems.push({
          icon: FileText, 
          label: 'Templates', 
          path: '/inspection',
          module: 'TEMPLATE',
          permissions: []
        });
      }
      
      // Add Assets if user has access_assets permission
      if (user?.permissions?.includes('access_assets')) {
        console.log('✅ ADDING ASSETS - user has access_assets');
        managerMenuItems.push({
          icon: Package, 
          label: 'Assets', 
          path: '/assets',
          module: 'ASSETS',
          permissions: []
        });
      }
      
      // Add Questionnaires if user has access_questionnaires permission
      if (user?.permissions?.includes('access_questionnaires')) {
        console.log('✅ ADDING QUESTIONNAIRES - user has access_questionnaires');
        managerMenuItems.push({
          icon: HelpCircle, 
          label: 'Questionnaires', 
          path: '/questionnaire',
          module: 'QUESTIONNAIRES',
          permissions: []
        });
      }
      
      // Add Calendar if user has access_calendar permission
      if (user?.permissions?.includes('access_calendar')) {
        console.log('✅ ADDING CALENDAR - user has access_calendar');
        managerMenuItems.push({
          icon: Calendar, 
          label: 'Calendar', 
          path: '/calendar',
          module: 'CALENDAR',
          permissions: []
        });
      }
      
      console.log('🚨 FINAL MANAGER MENU ITEMS:', managerMenuItems.map(i => i.label));
      return managerMenuItems;
    }

    console.log('🔥🔥 Not a manager, using default filtering');
    // For admin and inspector, show all items (with permission check for inspector) + always show Profile
    const defaultItems = allMenuItems.filter(item => 
      item.module === 'PROFILE' || // Always show Profile
      item.permissions.length === 0 || 
      item.permissions.some(perm => user?.permissions?.includes(perm)) ||
      user?.role === 'admin'
    );
    console.log('🔥🔥 Default filtered items:', defaultItems.map(i => i.label));
    return defaultItems;
  };

  // Function to get menu items based on user role
  const getMenuItems = () => {
    console.log('🔥 getMenuItems called with user:', user);
    console.log('🔥 User role:', user?.role);
    
    if (user?.role === 'inspector') {
      console.log('🔥 Using inspector menu');
      return getUserMenuItems();
    } else {
      console.log('🔥 Using admin menu (includes manager filtering)');
      return getAdminMenuItems();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get menu items based on user role and permissions
  console.log('🟢 About to call getMenuItems()');
  const menuItems = getMenuItems();
  console.log('🟢 Final menuItems returned:', menuItems);
  console.log('🟢 Final menuItems labels:', menuItems?.map(i => i.label));

  return (
    <SidebarContainer width={width}>
      <LogoSection isOpen={isOpen}>
        <img src="/logo.png" alt="MIRSAT" />
        <span>MIRSAT</span>
      </LogoSection>
      
      <MenuSection>
        {menuItems.map((item) => (
          <MenuItem 
            key={item.path}
            to={item.path}
            className={location.pathname === item.path ? 'active' : ''}
            isOpen={isOpen}
          >
            <item.icon className="icon" size={20} />
            <span>{item.label}</span>
            {!isOpen && <ChevronRight size={16} style={{ marginLeft: 'auto' }} />}
          </MenuItem>
        ))}
      </MenuSection>

      <LogoutSection>
        <LogoutButton onClick={handleLogout} isOpen={isOpen}>
          <LogOut size={20} />
          <span>Logout</span>
        </LogoutButton>
      </LogoutSection>
    </SidebarContainer>
  );
};

export default Sidebar;