import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronRight
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

  // For users, create a restricted menu based on their permissions
  const getUserMenuItems = () => {
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
        path: '/user-task',
        permissions: ['view_tasks']
      }
    ];

    return userMenuItems.filter(item => 
      item.permissions.some(perm => user?.permissions?.includes(perm))
    );
  };

  // For admin and other roles, create a full menu
  const getAdminMenuItems = () => [
    {
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/dashboard',
      permissions: []
    },
    {
      icon: ClipboardList, 
      label: 'Tasks', 
      path: '/tasks',
      permissions: ['view_tasks', 'create_tasks', 'edit_tasks', 'delete_tasks']
    },
    {
      icon: Users, 
      label: 'Users', 
      path: '/users',
      permissions: ['view_users', 'create_users', 'edit_users', 'delete_users']
    },
    {
      icon: Calendar, 
      label: 'Calendar', 
      path: '/calendar',
      permissions: ['view_calendar', 'manage_calendar', 'schedule_events']
    },
    {
      icon: FileText, 
      label: 'Template', 
      path: '/inspection',
      permissions: ['view_inspections', 'create_inspections', 'edit_inspections', 'delete_inspections']
    },
    {
      icon: Settings, 
      label: 'Settings', 
      path: '/settings',
      permissions: ['view_settings', 'manage_settings', 'system_config']
    }
  ].filter(item => 
    item.permissions.length === 0 || 
    item.permissions.some(perm => user?.permissions?.includes(perm))
  );

  // Function to get menu items based on user role
  const getMenuItems = () => {
    return user?.role === 'inspector' 
      ? getUserMenuItems() 
      : getAdminMenuItems();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get menu items based on user role and permissions
  const menuItems = getMenuItems();

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