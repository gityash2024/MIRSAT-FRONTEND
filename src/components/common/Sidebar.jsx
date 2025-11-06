import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  ChevronLeft,
  ChevronRight,
  Home,
  User,
  ClipboardList,
  Users,
  Calendar,
  ListChecks,
  Database,
  FileText,
  Activity,
  Search,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';

const SidebarContainer = styled.div`
  background: var(--color-navy);
  color: white;
  height: 100vh;
  width: ${props => props.$collapsed ? '70px' : '280px'};
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: fixed;
  ${props => props.$isRTL ? 'right: 0;' : 'left: 0;'}
  top: 0;
  z-index: 100;
  box-shadow: ${props => props.$collapsed ? 'none' : '2px 0 8px rgba(0, 0, 0, 0.15)'};
  
  @media (max-width: 768px) {
    width: 280px;
    transform: translateX(${props => {
      if (props.$collapsed) {
        return props.$isRTL ? '100%' : '-100%';
      }
      return '0';
    }});
    box-shadow: ${props => props.$collapsed ? 'none' : '0 0 20px rgba(0, 0, 0, 0.3)'};
  }
`;

const Logo = styled.div`
  padding: 1.5rem ${props => props.$collapsed ? '0.75rem' : '1.5rem'};
  display: flex;
  align-items: center;
  justify-content: ${props => props.$collapsed ? 'center' : 'space-between'};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 64px;

  h1 {
    font-size: ${props => props.$collapsed ? '0' : '1.5rem'};
    font-weight: 700;
    opacity: ${props => props.$collapsed ? '0' : '1'};
    width: ${props => props.$collapsed ? '0' : 'auto'};
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    margin: 0;
    
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

const CollapseButton = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  min-width: 32px;
  height: 32px;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
  
  @media (max-width: 768px) {
    display: none;
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
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const SearchContainer = styled.div`
  padding: ${props => props.$collapsed ? '0.5rem' : '1rem'};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${props => props.$collapsed ? '0' : '1'};
  height: ${props => props.$collapsed ? '0' : 'auto'};
  overflow: hidden;
  
  @media (max-width: 768px) {
    opacity: 1;
    height: auto;
    padding: 1rem;
  }
`;

const SearchInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled(Search)`
  position: absolute;
  ${props => props.$isRTL ? 'right: 12px;' : 'left: 12px;'}
  color: rgba(255, 255, 255, 0.5);
  width: 18px;
  height: 18px;
  pointer-events: none;
  transition: color 0.2s ease;
`;

const ClearButton = styled.button`
  position: absolute;
  ${props => props.$isRTL ? 'left: 8px;' : 'right: 8px;'}
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  opacity: ${props => props.$visible ? '1' : '0'};
  pointer-events: ${props => props.$visible ? 'auto' : 'none'};

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.$isRTL ? '10px 36px 10px 12px' : '10px 12px 10px 36px'};
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  outline: none;

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  &:focus {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
  }

  &:focus + ${SearchIcon} {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const Nav = styled.nav`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.5rem 0;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
`;

const StyledLink = styled.div`
  display: flex;
  align-items: center;
  padding: 0.875rem ${props => props.$collapsed ? '0.75rem' : '1.5rem'};
  text-decoration: none;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  cursor: pointer;
  margin: 0.25rem 0;
  
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
      ${props => props.$isRTL ? 'right: 0;' : 'left: 0;'}
      top: 0;
      height: 100%;
      width: 4px;
      background: white;
      border-radius: 0 2px 2px 0;
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
  flex-shrink: 0;
  ${props => props.$isRTL && !props.$collapsed ? 'margin-left: 0.75rem; margin-right: 0;' : ''}
  ${props => !props.$isRTL && !props.$collapsed ? 'margin-right: 0.75rem; margin-left: 0;' : ''}
`;

const NavText = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  opacity: ${props => props.$collapsed ? '0' : '1'};
  width: ${props => props.$collapsed ? '0' : 'auto'};
  white-space: nowrap;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    opacity: 1;
    width: auto;
  }
`;

const EmptyState = styled.div`
  padding: 2rem 1.5rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
`;

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  
  const isMobile = window.innerWidth <= 768;
  // Sync with parent state on desktop, use local state for collapse toggle
  const effectiveCollapsed = isMobile 
    ? (typeof isOpen !== 'undefined' ? !isOpen : false) 
    : (typeof isOpen !== 'undefined' ? !isOpen : collapsed);
  
  const isActiveRoute = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

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
      permission: 'view_dashboard',
      modulePermission: 'access_dashboard',
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
      roles: ['admin', 'manager']
    },
    {
      title: t('inspections.title'),
      path: '/inspection',
      icon: ListChecks,
      permission: 'view_inspections',
      modulePermission: 'access_template',
      roles: ['admin', 'manager']
    },
    {
      title: t('navigation.assets'),
      path: '/assets',
      icon: Database,
      permission: 'view_assets',
      modulePermission: 'access_assets',
      roles: ['admin', 'manager']
    },
    {
      title: t('navigation.questionnaires'),
      path: '/questionnaire',
      icon: FileText,
      permission: 'view_questionnaires',
      modulePermission: 'access_questionnaires',
      roles: ['admin', 'manager']
    },
    {
      title: t('navigation.calendar'),
      path: '/calendar',
      icon: Calendar,
      permission: 'view_calendar',
      modulePermission: 'access_calendar',
      roles: ['admin', 'manager', 'supervisor']
    },
    {
      title: t('navigation.logs'),
      path: '/logs',
      icon: Activity,
      permission: null,
      modulePermission: null,
      roles: ['admin', 'manager', 'supervisor']
    },
    {
      title: t('navigation.profile'),
      path: '/profile',
      icon: User,
      permission: null,
      modulePermission: null,
      roles: ['admin', 'manager', 'supervisor', 'inspector']
    }
  ];

  // Get menu items based on role and permissions
  const allMenuItems = useMemo(() => {
    const navigationItems = getNavigationItems();
    
    return navigationItems.filter(item => {
      if (!item.roles.includes(userRole)) {
        return false;
      }

      if (userRole === 'admin') {
        return true;
      }

      if (userRole === 'inspector') {
        return true;
      }

      if (userRole === 'supervisor') {
        const supervisorTabs = [t('navigation.dashboard'), t('navigation.tasks'), t('navigation.calendar'), t('navigation.profile')];
        return supervisorTabs.includes(item.title);
      }

      if (userRole === 'manager') {
        if (item.permission === null && item.modulePermission === null) {
          return true;
        }
        
        if (item.modulePermission) {
          return user?.permissions?.includes(item.modulePermission);
        }
        
        return hasPermission(item.permission);
      }

      return false;
    });
  }, [user, userRole, t]);

  // Filter menu items based on search query
  const menuItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return allMenuItems;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return allMenuItems.filter(item => 
      item.title.toLowerCase().includes(query)
    );
  }, [allMenuItems, searchQuery]);

  const handleNavigation = (path) => {
    navigate(path);
    
    if (isMobile && setIsOpen) {
      setIsOpen(false);
    }
  };

  const handleToggle = () => {
    if (isMobile && setIsOpen) {
      setIsOpen(!isOpen);
    } else {
      const newCollapsed = !effectiveCollapsed;
      setCollapsed(newCollapsed);
      if (setIsOpen) {
        setIsOpen(!newCollapsed);
      }
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <SidebarContainer $collapsed={effectiveCollapsed} $isRTL={isRTL}>
      <Logo $collapsed={effectiveCollapsed}>
        {!effectiveCollapsed && <h1>MIRSAT</h1>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {!isMobile && (
            <CollapseButton onClick={handleToggle} title={effectiveCollapsed ? t('common.expand') : t('common.collapse')}>
              {isRTL ? (
                effectiveCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />
              ) : (
                effectiveCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />
              )}
            </CollapseButton>
          )}
          <ToggleButton onClick={handleToggle}>
            {effectiveCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </ToggleButton>
        </div>
      </Logo>
      
      <SearchContainer $collapsed={effectiveCollapsed}>
        <SearchInputWrapper>
          <SearchInput
            type="text"
            placeholder={t('common.search') || 'Search...'}
            value={searchQuery}
            onChange={handleSearchChange}
            $isRTL={isRTL}
          />
          <SearchIcon $isRTL={isRTL} size={18} />
          <ClearButton
            $isRTL={isRTL}
            $visible={searchQuery.length > 0}
            onClick={clearSearch}
            title={t('common.clear') || 'Clear'}
          >
            <X size={16} />
          </ClearButton>
        </SearchInputWrapper>
      </SearchContainer>
      
      <Nav>
        {menuItems.length > 0 ? (
          menuItems.map((item) => (
            <StyledLink 
              key={item.path}
              className={isActiveRoute(item.path) ? 'active' : ''}
              $collapsed={effectiveCollapsed}
              $isRTL={isRTL}
              onClick={() => handleNavigation(item.path)}
            >
              <IconWrapper $isRTL={isRTL} $collapsed={effectiveCollapsed}>
                <item.icon size={20} />
              </IconWrapper>
              <NavText $collapsed={effectiveCollapsed}>{item.title}</NavText>
            </StyledLink>
          ))
        ) : (
          <EmptyState>
            {t('common.noResults') || 'No results found'}
          </EmptyState>
        )}
      </Nav>
    </SidebarContainer>
  );
};

export default Sidebar;
