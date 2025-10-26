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
  ListChecks,
  Database,
  FileText,
  HelpCircle,
  Activity
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/permissions';
import { useTranslation } from 'react-i18next';

const SidebarContainer = styled.div`
  background: var(--color-navy);
  color: white;
  height: 100vh;
  width: ${props => props.$collapsed ? '70px' : '260px'};
  transition: width 0.3s ease, transform 0.3s ease;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  
  @media (max-width: 768px) {
    width: 260px;
    transform: translateX(${props => props.$collapsed ? '-100%' : '0'});
    box-shadow: ${props => props.$collapsed ? 'none' : '0 0 15px rgba(0, 0, 0, 0.2)'};
  }
`;

const Logo = styled.div`
  padding: 1.5rem ${props => props.$collapsed ? '0.75rem' : '1.5rem'};
  display: flex;
  align-items: center;
  justify-content: ${props => props.$collapsed ? 'center' : 'space-between'};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h1 {
    font-size: ${props => props.$collapsed ? '0' : '1.5rem'};
    font-weight: 700;
    opacity: ${props => props.$collapsed ? '0' : '1'};
    width: ${props => props.$collapsed ? '0' : 'auto'};
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
  padding: 0.875rem ${props => props.$collapsed ? '0.75rem' : '1.5rem'};
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
  opacity: ${props => props.$collapsed ? '0' : '1'};
  width: ${props => props.$collapsed ? '0' : 'auto'};
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
  const { t } = useTranslation();
  
  // ADD OBVIOUS DEBUGGING
  console.log('🚨🚨🚨 REAL SIDEBAR COMPONENT RENDERING!!!');
  console.log('🚨🚨🚨 User:', user);
  console.log('🚨🚨🚨 User Role:', user?.role);
  console.log('🚨🚨🚨 User Permissions:', user?.permissions);
  
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
  const getNavigationItems = () => [
    {
      title: t('navigation.dashboard'),
      path: userRole === 'inspector' ? '/user-dashboard' : '/dashboard',
      icon: Home,
      permission: 'view_dashboard', // Old system
      modulePermission: 'access_dashboard', // New module system for managers
      roles: ['admin', 'manager', 'supervisor', 'inspector']
    },
    {
      title: t('navigation.tasks'),
      path: '/tasks',
      icon: ClipboardList,
      permission: 'view_tasks',
      modulePermission: 'access_tasks',
      roles: ['admin', 'manager', 'supervisor']
    },
    {
      title: t('tasks.myTasks'),
      path: '/user-tasks',
      icon: ClipboardList,
      permission: 'view_tasks',
      modulePermission: 'access_tasks',
      roles: ['inspector']
    },
    {
      title: t('navigation.users'),
      path: '/users',
      icon: Users,
      permission: 'view_users',
      modulePermission: 'access_users',
      roles: ['admin', 'manager']  // Remove supervisor - no user management
    },
    {
      title: t('inspections.title'),
      path: '/inspection',
      icon: ListChecks,
      permission: 'view_inspections',
      modulePermission: 'access_template',
      roles: ['admin', 'manager']  // Remove supervisor - no template creation
    },
    {
      title: t('navigation.assets'),
      path: '/assets',
      icon: Database,
      permission: 'view_assets',
      modulePermission: 'access_assets',
      roles: ['admin', 'manager']  // Remove supervisor - no asset management
    },
    {
      title: t('navigation.questionnaires'),
      path: '/questionnaire',
      icon: FileText,
      permission: 'view_questionnaires',
      modulePermission: 'access_questionnaires',
      roles: ['admin', 'manager']  // Remove supervisor - no questionnaire management
    },
    {
      title: t('navigation.calendar'),
      path: '/calendar',
      icon: Calendar,
      permission: 'view_calendar',
      modulePermission: 'access_calendar',
      roles: ['admin', 'manager', 'supervisor']  // Keep supervisor - can set schedules
    },
    {
      title: t('navigation.logs'),
      path: '/logs',
      icon: Activity,
      permission: null, // No permission required for logs
      modulePermission: null,
      roles: ['admin', 'manager', 'supervisor']  // Exclude inspector role
    },
    {
      title: t('navigation.profile'),
      path: '/profile',
      icon: User,
      permission: null, // No permission required for profile
      modulePermission: null,
      roles: ['admin', 'manager', 'supervisor', 'inspector']  // All roles use /profile
    }
  ];


  // Get menu items based on role and permissions
  const getMenuItems = () => {
    console.log('🔍 getMenuItems called for role:', userRole);
    const navigationItems = getNavigationItems();
    
    return navigationItems.filter(item => {
      console.log(`🔍 Checking item: ${item.title} for role: ${userRole}`);
      
      // Check if the user's role is allowed for this item
      if (!item.roles.includes(userRole)) {
        console.log(`❌ Role ${userRole} not allowed for ${item.title}`);
        return false;
      }

      // For admin role, show all items designated for admin (no permission check needed)
      if (userRole === 'admin') {
        console.log(`✅ Admin access granted for ${item.title}`);
        return true;
      }

      // For inspector role, show all items designated for inspector (no permission check needed) 
      if (userRole === 'inspector') {
        console.log(`✅ Inspector access granted for ${item.title}`);
        return true;
      }

      // For supervisor role, hardcode the 4 specific tabs
      if (userRole === 'supervisor') {
        // Supervisor always sees these 4 tabs regardless of permissions
        const supervisorTabs = [t('navigation.dashboard'), t('navigation.tasks'), t('navigation.calendar'), t('navigation.profile')];
        if (supervisorTabs.includes(item.title)) {
          console.log(`✅ Supervisor access granted for ${item.title} (hardcoded)`);
          return true;
        }
        console.log(`❌ Supervisor tab ${item.title} not in allowed list`);
        return false;
      }

      // For manager role, use NEW MODULE PERMISSIONS
      if (userRole === 'manager') {
        // If no permission is required (like Profile), include the item
        if (item.permission === null && item.modulePermission === null) {
          console.log(`✅ No permission required for ${item.title}`);
          return true;
        }
        
        // Use modulePermission for managers and supervisors
        if (item.modulePermission) {
          const hasAccess = user?.permissions?.includes(item.modulePermission);
          console.log(`🔍 ${userRole} ${item.title}: needs "${item.modulePermission}", has access: ${hasAccess}`);
          return hasAccess;
        }
        
        // Fallback to old permission system if no modulePermission
        console.log(`🔍 ${userRole} ${item.title}: using old permission "${item.permission}"`);
        return hasPermission(item.permission);
      }

      // Default: exclude the item
      console.log(`❌ Default exclusion for ${item.title}`);
      return false;
    });
  };

  const menuItems = getMenuItems();
  console.log('🚨 FINAL MENU ITEMS:', menuItems.map(item => item.title));

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
    <SidebarContainer $collapsed={effectiveCollapsed}>
      <Logo $collapsed={effectiveCollapsed}>
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
            $collapsed={effectiveCollapsed}
            onClick={() => handleNavigation(item.path)}
          >
            <IconWrapper>
              <item.icon size={20} />
            </IconWrapper>
            <NavText $collapsed={effectiveCollapsed}>{item.title}</NavText>
          </StyledLink>
        ))}
      </Nav>
    </SidebarContainer>
  );
};

export default Sidebar;