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
  AlertTriangle,
  Package,
  X
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';
import { isCompactViewport } from '../../utils/layout';
import mirSatLogo from '../../assets/mirsat-logo-white.svg';
import takamolLogo from '../../assets/tms-logo-white.svg';
import { DARK_PALETTE } from '../../theme/darkPalette';
import { canBrowseMaintenance } from '../../pages/maintenance/shared';

const SidebarContainer = styled.div`
  background: var(--color-navy);
  color: white;
  --sidebar-header-height: ${props => props.$collapsed ? '86px' : 'clamp(128px, 18.5dvh, 328px)'};
  --sidebar-footer-height: ${props => props.$collapsed ? '84px' : 'clamp(64px, 7dvh, 112px)'};
  --sidebar-search-height: 0px;
  --sidebar-row-height: clamp(38px, calc((100dvh - var(--sidebar-header-height) - var(--sidebar-footer-height) - var(--sidebar-search-height) - 16px) / var(--sidebar-menu-count)), 78px);
  height: 100vh;
  height: 100dvh;
  width: ${props => props.$collapsed ? '70px' : '297px'};
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: fixed;
  ${props => props.$isRTL ? 'right: 0;' : 'left: 0;'}
  top: 0;
  z-index: 100;
  box-shadow: ${props => props.$collapsed ? 'none' : '2px 0 8px rgba(0, 0, 0, 0.15)'};
  
  @media (max-width: 1100px) {
    --sidebar-header-height: 112px;
    --sidebar-search-height: 76px;
    --sidebar-footer-height: 64px;
    width: 280px;
    transform: translateX(${props => {
      if (props.$collapsed) {
        return props.$isRTL ? '100%' : '-100%';
      }
      return '0';
    }});
    box-shadow: ${props => props.$collapsed ? 'none' : '0 0 20px rgba(0, 0, 0, 0.3)'};
  }

  /* Dark theme: near-black panel like the mobile app instead of navy. */
  html[data-theme='dark'] & {
    background: ${DARK_PALETTE.backgroundLight};
    border-inline-end: 1px solid ${DARK_PALETTE.border};
  }
`;

const Logo = styled.div`
  position: relative;
  padding: ${props => props.$collapsed ? '1.25rem 0.75rem' : '117px 3.5rem 97px'};
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  height: var(--sidebar-header-height);
  min-height: var(--sidebar-header-height);
  box-sizing: border-box;
  flex-shrink: 0;
  
  @media (min-width: 1101px) and (max-height: 1399px) {
    padding: ${props => props.$collapsed ? '1.25rem 0.75rem' : '64px 1.5rem 12px'};
  }
  @media (max-width: 1100px) {
    padding: 0.75rem 3.5rem;
  }
`;

const BrandLockup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;

  img {
    display: block;
    height: 114px;
    width: auto;
    flex-shrink: 0;
  }

  @media (min-width: 1101px) and (max-height: 1399px) {
    img { height: clamp(52px, calc(var(--sidebar-header-height) - 76px), 114px); }
  }
  @media (max-width: 1100px) {
    img {
      height: 72px;
    }
  }
`;

const SidebarHeaderActions = styled.div`
  position: absolute;
  top: 50%;
  ${props => props.$collapsed
    ? (props.$isRTL ? 'left: -1.75rem;' : 'right: -1.75rem;')
    : (props.$isRTL ? 'left: 0.75rem;' : 'right: 0.75rem;')}
  display: flex;
  align-items: center;
  transform: translateY(-50%);
  z-index: 1;
  @media (max-width: 1100px) { left: auto; right: auto; inset-inline-end: 0.75rem; }
`;

const CollapseButton = styled.button`
  background: ${props => props.$collapsed ? 'var(--color-navy)' : 'none'};
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${props => props.$collapsed ? '0.625rem' : '0.5rem'};
  border-radius: ${props => props.$collapsed ? '0 8px 8px 0' : '8px'};
  transition: all 0.2s ease;
  min-width: ${props => props.$collapsed ? '40px' : '32px'};
  height: ${props => props.$collapsed ? '40px' : '32px'};
  box-shadow: ${props => props.$collapsed ? '0 2px 5px rgba(0, 0, 0, 0.2)' : 'none'};

  ${props => props.$collapsed && props.$isRTL ? 'border-radius: 8px 0 0 8px;' : ''}

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 1100px) {
    display: none;
  }

  html[data-theme='dark'] & {
    background: ${props => props.$collapsed ? DARK_PALETTE.backgroundLight : 'none'};
  }

  html[data-theme='dark'] &:hover {
    background: rgba(255, 255, 255, 0.15);
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
  
  @media (min-width: 1101px) {
    display: none;
  }
`;

const SearchContainer = styled.div`
  position: absolute; top: 12px; left: 0; right: 0;
  @media(max-width:1100px){position:static;}
  padding: ${props => props.$collapsed ? '0.5rem' : '1rem'};
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${props => props.$collapsed ? '0' : '1'};
  height: ${props => props.$collapsed ? '0' : 'auto'};
  overflow: hidden;
  
  @media (min-width: 1101px) and (max-height: 1399px) {
    top: 4px;
    padding: ${props => props.$collapsed ? '0' : '8px 16px'};
    border-bottom: 0;
  }
  @media (max-width: 1100px) {
    opacity: 1;
    height: var(--sidebar-search-height);
    box-sizing: border-box;
    flex-shrink: 0;
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
  min-height: 0;
  display: flex;
  flex-direction: column;
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

const StyledLink = styled.button.attrs({ type: "button" })`
  width: 100%; border: 0; background: transparent; text-align: start; font: inherit;
  &:focus-visible { outline: 2px solid white; outline-offset: -3px; }
  display: flex;
  align-items: center;
  height: var(--sidebar-row-height);
  min-height: var(--sidebar-row-height);
  flex-shrink: 0;
  box-sizing: border-box;
  padding: 0 ${props => props.$collapsed ? '0.75rem' : '1.5rem'};
  text-decoration: none;
  color: rgba(255, 255, 255, 0.94);
  transition: background-color 0.2s ease, color 0.2s ease;
  position: relative;
  cursor: pointer;
  margin: 0;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
  
  &.active {
    color: white;
    background: #292965;
    border-radius: 4px;
    width: calc(100% - 2px);
    margin-inline: 1px;

    &::after {
      content: '';
      position: absolute;
      inset-inline-end: ${props => props.$collapsed ? '8px' : '24px'};
      top: 50%;
      transform: translateY(-50%);
      width: ${props => props.$collapsed ? '6px' : '14px'};
      height: ${props => props.$collapsed ? '6px' : '14px'};
      border-radius: 50%;
      background: var(--color-navy);
      pointer-events: none;
    }
  }

  html[data-theme='dark'] &.active {
    color: ${DARK_PALETTE.gold};
    background: rgba(245, 196, 81, 0.12);

    &::after {
      background: ${DARK_PALETTE.gold};
    }
  }

  @media (max-width: 1100px) {
    padding: 0 1.5rem;
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
  font-size: clamp(16px, calc(var(--sidebar-row-height) * 0.282), 22px);
  line-height: 1.35;
  font-weight: 500;
  opacity: ${props => props.$collapsed ? '0' : '1'};
  width: ${props => props.$collapsed ? '0' : 'auto'};
  white-space: nowrap;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 1100px) {
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

const BrandFooter = styled.div`
  flex-shrink: 0;
  display: flex;
  justify-content: ${props => props.$collapsed ? 'center' : 'flex-start'};
  align-items: center;
  padding: ${props => props.$collapsed ? '0 0.5rem' : '0 1.35rem'};
  box-sizing: border-box;
  height: var(--sidebar-footer-height);
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  min-height: var(--sidebar-footer-height);

  .brand-wordmark {
    display: block;
    width: 224px;
    height: auto;
    max-width: 100%;
    object-fit: contain;
  }
`;

const CollapsedTakamolMark = styled.div`
  width: 50px;
  height: 50px;
  overflow: hidden;
  position: relative;

  img {
    position: absolute;
    top: 50%;
    right: -13px;
    display: block;
    width: auto;
    max-width: none;
    height: 79px;
    transform: translateY(-50%);
  }
`;

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  
  const isMobile = isCompactViewport(window.innerWidth);
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
  
  const storedRole = user?.role?.toLowerCase() || 'inspector';
  const userRole = storedRole === 'superadmin' ? 'admin' : storedRole;

  // Define navigation items with required permissions
  const getNavigationItems = () => [
    { title: t('Fault Reports', { ns: 'maintenance' }), path: '/fault-reports', icon: AlertTriangle, maintenanceModule: 'faults' },
    { title: t('Spare Parts', { ns: 'maintenance' }), path: '/spare-parts', icon: Package, maintenanceModule: 'warehouse' },
    { title: t('Documents', { ns: 'maintenance' }), path: '/documents', icon: FileText, maintenanceModule: 'documents' },
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
      path: '/templates',
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
    const navigationOrder = ['/dashboard', '/user-dashboard', '/tasks', '/user-tasks', '/fault-reports', '/templates', '/assets', '/spare-parts', '/calendar', '/documents', '/questionnaire', '/users', '/logs', '/profile'];
    const navigationItems = getNavigationItems().sort((a, b) => navigationOrder.indexOf(a.path) - navigationOrder.indexOf(b.path));
    
    return navigationItems.filter(item => {
      if (item.maintenanceModule) return canBrowseMaintenance(user, item.maintenanceModule);
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

        if (item.path === '/dashboard') {
          return user?.permissions?.includes('access_dashboard');
        }
        if (item.path === '/calendar') {
          return user?.permissions?.includes('access_tasks');
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
    <SidebarContainer inert={isMobile && effectiveCollapsed ? "" : undefined} aria-hidden={isMobile && effectiveCollapsed ? true : undefined} $collapsed={effectiveCollapsed} $isRTL={isRTL} style={{ '--sidebar-menu-count': Math.max(menuItems.length, 1) }}>
      <Logo $collapsed={effectiveCollapsed} $isRTL={isRTL}>
        {!effectiveCollapsed && (
          <BrandLockup>
            <img src={mirSatLogo} alt="MIRSAT Logo" />
          </BrandLockup>
        )}
        {effectiveCollapsed && (
          <img src={mirSatLogo} alt="MIRSAT" style={{ height: '42px', width: 'auto' }} />
        )}
        <SidebarHeaderActions $collapsed={effectiveCollapsed} $isRTL={isRTL}>
          {!isMobile && (
            <CollapseButton
              $collapsed={effectiveCollapsed}
              $isRTL={isRTL}
              onClick={handleToggle}
              aria-label={effectiveCollapsed ? t('common.expand') : t('common.collapse')}
            >
              {isRTL ? (
                effectiveCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />
              ) : (
                effectiveCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />
              )}
            </CollapseButton>
          )}
          <ToggleButton aria-label={t("common.close", { defaultValue: "Close navigation" })} onClick={handleToggle}>
            {effectiveCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </ToggleButton>
        </SidebarHeaderActions>
      </Logo>
      
      <SearchContainer inert={effectiveCollapsed ? "" : undefined} aria-hidden={effectiveCollapsed ? true : undefined} $collapsed={effectiveCollapsed}>
        <SearchInputWrapper>
          <SearchInput
            type="text"
            aria-label={t('common.search')}
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
              aria-label={item.title}
              title={effectiveCollapsed ? item.title : undefined}
              className={isActiveRoute(item.path) ? 'active' : ''}
              aria-current={isActiveRoute(item.path) ? 'page' : undefined}
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
      <BrandFooter $collapsed={effectiveCollapsed} aria-label="Takamol Mobility Services">
        {effectiveCollapsed ? (
          <CollapsedTakamolMark aria-hidden="true">
            <img src={takamolLogo} alt="" />
          </CollapsedTakamolMark>
        ) : (
          <img className="brand-wordmark" src={takamolLogo} alt="Takamol Mobility Services" />
        )}
      </BrandFooter>
    </SidebarContainer>
  );
};

export default Sidebar;
