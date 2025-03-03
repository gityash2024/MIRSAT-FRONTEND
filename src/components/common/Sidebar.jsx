import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { 
  BarChart, 
  Users, 
  ClipboardList, 
  Layers, 
  Calendar, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Home
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/permissions';

const SidebarContainer = styled.div`
  background: #1a237e;
  color: white;
  height: 100vh;
  width: ${props => props.collapsed ? '70px' : '260px'};
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
`;

const Logo = styled.div`
  padding: 1.5rem ${props => props.collapsed ? '0.75rem' : '1.5rem'};
  display: flex;
  align-items: center;
  justify-content: ${props => props.collapsed ? 'center' : 'space-between'};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h1 {
    font-size: ${props => props.collapsed ? '0' : '1.5rem'};
    font-weight: 700;
    opacity: ${props => props.collapsed ? '0' : '1'};
    width: ${props => props.collapsed ? '0' : 'auto'};
    overflow: hidden;
    transition: all 0.3s ease;
  }
`;

const ToggleButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 50%;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Nav = styled.nav`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.875rem ${props => props.collapsed ? '0.75rem' : '1.5rem'};
  text-decoration: none;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &.active {
    color: white;
    background: rgba(255, 255, 255, 0.15);
    
    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background: white;
    }
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const NavText = styled.span`
  margin-left: 1rem;
  font-size: 0.95rem;
  opacity: ${props => props.collapsed ? '0' : '1'};
  width: ${props => props.collapsed ? '0' : 'auto'};
  white-space: nowrap;
  overflow: hidden;
  transition: all 0.3s ease;
`;

const UserInfo = styled.div`
  margin-top: auto;
  padding: 1rem ${props => props.collapsed ? '0.5rem' : '1.5rem'};
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
`;

const UserDetails = styled.div`
  display: ${props => props.collapsed ? 'none' : 'flex'};
  flex-direction: column;
  opacity: ${props => props.collapsed ? '0' : '1'};
  transition: all 0.3s ease;
  overflow: hidden;
  
  span:first-child {
    font-weight: 500;
    font-size: 0.875rem;
  }
  
  span:last-child {
    font-size: 0.75rem;
    opacity: 0.7;
    text-transform: capitalize;
  }
`;

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  
  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Common items for all user types (except regular users)
  const commonItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: Home,
      permissions: ['view_dashboard']
    },
    {
      title: 'Tasks',
      path: '/tasks',
      icon: ClipboardList,
      permissions: ['view_tasks']
    }
  ];

  // Admin, manager, inspector items
  const privilegedItems = [
    {
      title: 'Inspection Levels',
      path: '/inspection',
      icon: Layers,
      permissions: ['view_inspections'],
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.INSPECTOR]
    },
    {
      title: 'Users',
      path: '/users',
      icon: Users,
      permissions: ['view_users'],
      roles: [ROLES.ADMIN, ROLES.MANAGER]
    },
    {
      title: 'Reports',
      path: '/reports',
      icon: BarChart,
      permissions: ['view_reports'],
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.INSPECTOR]
    },
    {
      title: 'Calendar',
      path: '/calendar',
      icon: Calendar,
      permissions: ['view_calendar'],
      roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.INSPECTOR]
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: Settings,
      permissions: ['view_settings'],
      roles: [ROLES.ADMIN, ROLES.MANAGER]
    }
  ];
  
  // For regular users, we only show dashboard and tasks
  const userItems = [
    {
      title: 'My Dashboard',
      path: '/user-dashboard',
      icon: Home,
      permissions: ['view_dashboard']
    },
    {
      title: 'My Tasks',
      path: '/user-tasks',
      icon: ClipboardList,
      permissions: ['view_tasks']
    }
  ];

  // Determine which menu items to show based on user role
  const displayItems = user?.role === ROLES.USER 
    ? userItems 
    : [...commonItems, ...privilegedItems.filter(item => 
        item.roles && item.roles.includes(user?.role)
      )];
  
  return (
    <SidebarContainer collapsed={collapsed}>
      <Logo collapsed={collapsed}>
        {!collapsed && <h1>MIRSAT</h1>}
        <ToggleButton onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </ToggleButton>
      </Logo>
      
      <Nav>
        {displayItems.map((item) => (
          <NavItem 
            key={item.path}
            to={item.path}
            className={isActiveRoute(item.path) ? 'active' : ''}
            collapsed={collapsed}
          >
            <IconWrapper>
              <item.icon size={20} />
            </IconWrapper>
            <NavText collapsed={collapsed}>{item.title}</NavText>
          </NavItem>
        ))}
      </Nav>
      
      <UserInfo collapsed={collapsed}>
        <Avatar>
          {user?.name?.charAt(0) || 'U'}
        </Avatar>
        <UserDetails collapsed={collapsed}>
          <span>{user?.name || 'User'}</span>
          <span>{user?.role || 'Role'}</span>
        </UserDetails>
      </UserInfo>
    </SidebarContainer>
  );
};

export default Sidebar;