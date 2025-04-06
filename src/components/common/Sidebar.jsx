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
  ListChecks,
  Database
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/permissions';

const SidebarContainer = styled.div`
  background: #1a237e;
  color: white;
  height: 100vh;
  width: ${props => props.collapsed ? '70px' : '260px'};
  transition: width 0.3s ease, transform 0.3s ease;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  
  @media (max-width: 768px) {
    width: 260px;
    transform: translateX(${props => props.collapsed ? '-100%' : '0'});
    box-shadow: ${props => props.collapsed ? 'none' : '0 0 15px rgba(0, 0, 0, 0.2)'};
  }
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
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
      opacity: 1;
      width: auto;
    }
  }
  
  @media (max-width: 768px) {
    justify-content: space-between;
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
    @media (min-width: 768px) {
    display: none;
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
  
  @media (max-width: 768px) {
    padding: 0.875rem 1.5rem;
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
  
  @media (max-width: 768px) {
    opacity: 1;
    width: auto;
  }
`;

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isMobile = window.innerWidth <= 768;
  const effectiveCollapsed = isMobile 
    ? (typeof isOpen !== 'undefined' ? !isOpen : false) 
    : collapsed;
  
  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  };
  const userRole = user?.role?.toLowerCase() || 'inspector';

  // Define navigation items with required permissions
  const navigationItems = [
    {
      title: 'Dashboard',
      path: userRole === 'inspector' ? '/user-dashboard' : '/dashboard',
      icon: Home,
      permission: 'view_dashboard',
      roles: ['admin', 'manager', 'inspector']
    },
    {
      title: 'Tasks',
      path: '/tasks',
      icon: ClipboardList,
      permission: 'view_tasks',
      roles: ['admin', 'manager']
    },
    {
      title: 'My Tasks',
      path: '/user-tasks',
      icon: ClipboardList,
      permission: 'view_tasks',
      roles: ['inspector']
    },
    {
      title: 'Users',
      path: '/users',
      icon: Users,
      permission: 'view_users',
      roles: ['admin']
    },
    {
      title: 'Template',
      path: '/inspection',
      icon: ListChecks,
      permission: 'view_inspections',
      roles: ['admin', 'manager']
    },
    {
      title: 'Assets',
      path: '/assets',
      icon: Database,
      permission: 'view_assets',
      roles: ['admin']
    },
    {
      title: 'Calendar',
      path: '/calendar',
      icon: Calendar,
      permission: 'view_calendar',
      roles: ['admin', 'manager']
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: Settings,
      permission: 'view_settings',
      roles: ['admin']
    },
    {
      title: 'Profile',
      path: '/profile',
      icon: User,
      permission: null, // No permission required for profile
      roles: ['manager', 'inspector']
    }
  ];


  // Get menu items based on role and permissions
  const getMenuItems = () => {
    // For admin and inspector, show all items designated for their role
    if (userRole === 'admin' || userRole === 'inspector') {
      return navigationItems.filter(item => item.roles.includes(userRole));
    }
    
    // For manager, check permissions
    if (userRole === 'manager') {
      return navigationItems.filter(item => {
        // Include the item if it's for manager role and either has no permission requirement
        // or the user has the required permission
        return (
          item.roles.includes('manager') && 
          (item.permission === null || hasPermission(item.permission))
        );
      });
    }
    
    // Default: show nothing if role doesn't match
    return [];
  };

  const menuItems = getMenuItems();

  const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);
    navigate(path);
    
    if (isMobile && setIsOpen) {
      setIsOpen(false);
    }
  };

  const handleToggle = () => {
    if (isMobile && setIsOpen) {
      setIsOpen(!isOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <SidebarContainer collapsed={effectiveCollapsed}>
      <Logo collapsed={effectiveCollapsed}>
        {!effectiveCollapsed && <h1>MIRSAT</h1>}
        <ToggleButton onClick={handleToggle}>
          {effectiveCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </ToggleButton>
      </Logo>
      
      <Nav>
        {menuItems.map((item) => (
          <StyledLink 
            key={item.path}
            className={isActiveRoute(item.path) ? 'active' : ''}
            collapsed={effectiveCollapsed}
            onClick={() => handleNavigation(item.path)}
          >
            <IconWrapper>
              <item.icon size={20} />
            </IconWrapper>
            <NavText collapsed={effectiveCollapsed}>{item.title}</NavText>
          </StyledLink>
        ))}
      </Nav>
    </SidebarContainer>
  );
};

export default Sidebar;