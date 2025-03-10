import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Home,
  User,
  FileBarChart,
  ListChecks
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

const StyledLink = styled.div`
  display: flex;
  align-items: center;
  padding: 0.875rem ${props => props.collapsed ? '0.75rem' : '1.5rem'};
  text-decoration: none;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  
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

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const navigationConfig = {
    admin: [
      {
        title: 'Dashboard',
        path: '/dashboard',
        icon: Home
      },
      {
        title: 'Tasks',
        path: '/tasks',
        icon: ClipboardList
      },
      {
        title: 'Users',
        path: '/users',
        icon: Users
      },
      {
        title: 'Inspection Levels',
        path: '/inspection',
        icon: ListChecks
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
        icon: Home
      },
      {
        title: 'Tasks',
        path: '/tasks',
        icon: ClipboardList
      },
      {
        title: 'Inspection Levels',
        path: '/inspection',
        icon: ListChecks
      },
      {
        title: 'Calendar',
        path: '/calendar',
        icon: Calendar
      },
      {
        title: 'Profile',
        path: '/profile',
        icon: User
      }
    ],
    inspector: [
      {
        title: 'Dashboard',
        path: '/dashboard',
        icon: Home
      },
      {
        title: 'Tasks',
        path: '/tasks',
        icon: ClipboardList
      },
      {
        title: 'Inspection Levels',
        path: '/inspection',
        icon: ListChecks
      },
      {
        title: 'Calendar',
        path: '/calendar',
        icon: Calendar
      },
      {
        title: 'Profile',
        path: '/profile',
        icon: User
      }
    ],
    user: [
      {
        title: 'Dashboard',
        path: '/user-dashboard',
        icon: Home
      },
      {
        title: 'My Tasks',
        path: '/user-tasks',
        icon: ClipboardList
      },
      {
        title: 'Profile',
        path: '/profile',
        icon: User
      }
    ]
  };

  const userRole = user?.role?.toLowerCase() || 'user';
  const menuItems = navigationConfig[userRole] || navigationConfig.user;

  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
  };

  return (
    <SidebarContainer collapsed={collapsed}>
      <Logo collapsed={collapsed}>
        {!collapsed && <h1>MIRSAT</h1>}
        <ToggleButton onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </ToggleButton>
      </Logo>
      
      <Nav>
        {menuItems.map((item) => (
          <StyledLink 
            key={item.path}
            className={isActiveRoute(item.path) ? 'active' : ''}
            collapsed={collapsed}
            onClick={() => handleNavigation(item.path)}
          >
            <IconWrapper>
              <item.icon size={20} />
            </IconWrapper>
            <NavText collapsed={collapsed}>{item.title}</NavText>
          </StyledLink>
        ))}
      </Nav>
    </SidebarContainer>
  );
};

export default Sidebar;