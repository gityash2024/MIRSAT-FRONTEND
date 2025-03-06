import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import { Menu, Bell, User, ChevronDown, Settings, LogOut } from 'lucide-react';
import { NotificationDropdown } from '../../pages/notifications';

const TopbarContainer = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: ${props => props.sidebarWidth}px;
  height: 64px;
  background: white;
  display: flex;
  align-items: center;
  padding: 0 24px;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: left 0.3s ease;
  z-index: 900;
`;

const MenuButton = styled.button`
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

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const NotificationContainer = styled.div`
  position: relative;
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

  &:hover {
    background: ${props => props.variant === 'danger' ? '#fee2e2' : '#f3f4f6'};
  }

  .icon {
    opacity: 0.7;
  }
`;

const Topbar = ({ toggleSidebar, isSidebarOpen }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { user, logout } = useAuth();
  const sidebarWidth = isSidebarOpen ? 240 : 64;
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

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
    <TopbarContainer sidebarWidth={sidebarWidth}>
      <MenuButton onClick={toggleSidebar}>
        <Menu size={20} />
      </MenuButton>

      <RightSection>
        <NotificationContainer ref={notificationRef}>
          <NotificationButton onClick={() => setIsNotificationOpen(!isNotificationOpen)}>
            <Bell size={20} />
            <NotificationBadge>3</NotificationBadge>
          </NotificationButton>
          <NotificationDropdown isOpen={isNotificationOpen} />
        </NotificationContainer>

        <UserMenuContainer ref={userMenuRef}>
          <UserMenuTrigger onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
            <div className="user-info">
              <div className="name">{user?.name || 'Super Admin'}</div>
              <div className="role">{user?.role || 'Administrator'}</div>
            </div>
            <User size={20} />
            <ChevronDown size={16} />
          </UserMenuTrigger>

          <UserMenuDropdown isOpen={isUserMenuOpen}>
            <MenuItem onClick={() => {}}>
              <User size={18} className="icon" />
              Profile
            </MenuItem>
            <MenuItem onClick={() => {}}>
              <Settings size={18} className="icon" />
              Settings
            </MenuItem>
            <MenuItem onClick={logout} variant="danger">
              <LogOut size={18} className="icon" />
              Logout
            </MenuItem>
          </UserMenuDropdown>
        </UserMenuContainer>
      </RightSection>
    </TopbarContainer>
  );
};

export default Topbar;