import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import { Bell, User, ChevronDown, LogOut, Menu } from 'lucide-react';
import { NotificationDropdown } from '../../pages/notifications';
import { useNavigate } from 'react-router-dom';
import useNotification from '../../hooks/useNotification';
import TimezoneDropdown from '../../components/ui/TimezoneDropdown';
import LanguageToggle from '../../components/ui/LanguageToggle';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../context/LanguageContext';

const TopbarContainer = styled.div`
  position: fixed;
  top: 0;
  ${props => props.$isRTL 
    ? `
      right: ${props.sidebarWidth}px;
      left: 0;
      transition: right 0.3s ease;
    `
    : `
      left: ${props.sidebarWidth}px;
      right: 0;
      transition: left 0.3s ease;
    `
  }
  height: 64px;
  background: white;
  display: flex;
  align-items: center;
  padding: 0 24px;
  justify-content: flex-end;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  z-index: 50;
  
  @media (max-width: 768px) {
    left: 0;
    right: 0;
    padding: 0 12px;
    justify-content: space-between;
  }

  @media (max-width: 480px) {
    padding: 0 8px;
  }
`;

const LeftSection = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
  }
`;

const HamburgerButton = styled.button`
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
  flex-shrink: 1;
  position: relative;
  overflow: visible;

  @media (max-width: 768px) {
    gap: 8px;
  }

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const NotificationContainer = styled.div`
  position: relative;
  overflow: visible;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NotificationButton = styled.button`
  position: relative;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: background 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background: #f44336;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserMenuContainer = styled.div`
  position: relative;
  overflow: visible;
`;

const UserMenuTrigger = styled.button`
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
  flex-shrink: 0;

  @media (max-width: 768px) {
    gap: 6px;
    padding: 4px 8px;
  }

  @media (max-width: 480px) {
    gap: 4px;
    padding: 4px 6px;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }

  .user-info {
    text-align: right;
    
    .name {
      font-weight: 500;
      color: #333;
    }
    
    .role {
      font-size: 12px;
      color: #666;
    }
    
    @media (max-width: 768px) {
      display: none;
    }
  }

  svg {
    flex-shrink: 0;

    @media (max-width: 768px) {
      width: 18px;
      height: 18px;
    }

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
`;

const UserMenuDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  padding: 8px 0;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: translateY(${props => props.isOpen ? '0' : '-10px'});
  transition: all 0.3s;
  z-index: 1000;
  overflow: visible;
  width: max-content;
  min-width: 200px;
  max-width: 300px;

  @media (max-width: 768px) {
    right: 0;
    min-width: 180px;
    max-width: 280px;
  }

  @media (max-width: 480px) {
    min-width: 160px;
    max-width: calc(100vw - 16px);
    width: auto;
  }

  [dir="rtl"] & {
    right: auto;
    left: 0;
  }
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.3s;
  color: ${props => props.variant === 'danger' ? '#dc2626' : '#333'};
  white-space: nowrap;
  overflow: visible;
  min-width: 0;
  text-align: ${props => props.dir === 'rtl' ? 'right' : 'left'};
  direction: ${props => props.dir || 'ltr'};
  flex-wrap: nowrap;

  @media (max-width: 480px) {
    padding: 10px 12px;
    gap: 10px;
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  &:hover {
    background: ${props => props.variant === 'danger' ? '#fee2e2' : '#f3f4f6'};
  }

  .icon {
    opacity: 0.7;
    flex-shrink: 0;
    order: ${props => props.dir === 'rtl' ? 2 : 0};
  }

  span {
    flex: 1;
    min-width: 0;
    overflow: visible;
    word-wrap: break-word;
    overflow-wrap: break-word;
    text-align: ${props => props.dir === 'rtl' ? 'right' : 'left'};
    order: ${props => props.dir === 'rtl' ? 1 : 1};
  }
`;

const Topbar = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isTimezoneOpen, setIsTimezoneOpen] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount, fetchNotifications } = useNotification();
  const { t, i18n } = useTranslation();
  const { isRTL } = useLanguage();
  const isMobile = window.innerWidth <= 768;
  const sidebarWidth = isMobile ? 0 : (isSidebarOpen ? 280 : 70);
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // Helper function to translate role names
  const translateRole = (role) => {
    if (!role) return t('common.inspector');
    const roleLower = role.toLowerCase();
    if (roleLower === 'admin') return t('common.admin');
    if (roleLower === 'inspector') return t('common.inspector');
    if (roleLower === 'super admin' || roleLower === 'superadmin') return t('common.superAdmin');
    return role; // Return original if no translation found
  };

  useEffect(() => {
    // Fetch notifications when the component mounts
    fetchNotifications();
  }, [fetchNotifications]);

  // Close all dropdowns except the one being opened
  const closeAllDropdowns = (except = null) => {
    if (except !== 'user') setIsUserMenuOpen(false);
    if (except !== 'notification') setIsNotificationOpen(false);
    if (except !== 'language') setIsLanguageOpen(false);
    if (except !== 'timezone') setIsTimezoneOpen(false);
  };

  const handleUserMenuToggle = () => {
    const newState = !isUserMenuOpen;
    if (newState) {
      closeAllDropdowns('user');
    }
    setIsUserMenuOpen(newState);
  };

  const handleNotificationToggle = () => {
    const newState = !isNotificationOpen;
    if (newState) {
      closeAllDropdowns('notification');
    }
    setIsNotificationOpen(newState);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <TopbarContainer sidebarWidth={sidebarWidth} $isRTL={isRTL}>
      <LeftSection>
        <HamburgerButton onClick={toggleSidebar}>
          <Menu size={24} />
        </HamburgerButton>
      </LeftSection>
      
      <RightSection>
        <LanguageToggle 
          isOpen={isLanguageOpen}
          onOpen={() => {
            closeAllDropdowns('language');
            setIsLanguageOpen(true);
          }}
          onClose={() => setIsLanguageOpen(false)}
        />
        
        <TimezoneDropdown 
          isOpen={isTimezoneOpen}
          onOpen={() => {
            closeAllDropdowns('timezone');
            setIsTimezoneOpen(true);
          }}
          onClose={() => setIsTimezoneOpen(false)}
        />
        
        <NotificationContainer ref={notificationRef}>
          <NotificationButton onClick={handleNotificationToggle}>
            <Bell size={20} />
            {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
          </NotificationButton>
          <NotificationDropdown isOpen={isNotificationOpen} />
        </NotificationContainer>

        <UserMenuContainer ref={userMenuRef}>
          <UserMenuTrigger onClick={handleUserMenuToggle}>
            <div className="user-info">
              <div className="name">{user?.name || t('common.inspector')}</div>
              <div className="role">{translateRole(user?.role)}</div>
            </div>
            <User size={20} />
            <ChevronDown size={16} />
          </UserMenuTrigger>

          <UserMenuDropdown isOpen={isUserMenuOpen} dir={isRTL ? 'rtl' : 'ltr'}>
            <MenuItem onClick={logout} variant="danger" dir={isRTL ? 'rtl' : 'ltr'}>
              <LogOut size={18} className="icon" />
              <span>{t('common.logout')}</span>
            </MenuItem>
          </UserMenuDropdown>
        </UserMenuContainer>
      </RightSection>
    </TopbarContainer>
  );
};

export default Topbar;