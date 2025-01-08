import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';

const SidebarWrapper = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background: #1a237e;
  width: ${props => props.isOpen ? '240px' : '64px'};
  transition: width 0.3s;
  color: white;
  z-index: 1000;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  background: rgba(255, 255, 255, 0.1);

  img {
    height: 32px;
  }

  span {
    margin-left: 12px;
    font-size: 20px;
    font-weight: 500;
    opacity: ${props => props.isOpen ? 1 : 0};
    transition: opacity 0.3s;
  }
`;

const MenuItems = styled.div`
  padding: 20px 0;
`;

const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: white;
  text-decoration: none;
  transition: background 0.3s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    background: rgba(255, 255, 255, 0.15);
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

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ClipboardList, label: 'Tasks', path: '/tasks' },
    { icon: Users, label: 'Users', path: '/users', adminOnly: true },
    { icon: Calendar, label: 'Calendar', path: '/calendar' },
    { icon: FileText, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  return (
    <SidebarWrapper isOpen={isOpen}>
      <Logo isOpen={isOpen}>
        <img src="/mirsat-logo.svg" alt="Mirsat" />
        <span>MIRSAT</span>
      </Logo>
      
      <MenuItems>
        {menuItems.map((item) => (
          (item.adminOnly && !isAdmin) ? null : (
            <MenuItem 
              key={item.path}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
              isOpen={isOpen}
            >
              <item.icon className="icon" size={20} />
              <span>{item.label}</span>
            </MenuItem>
          )
        ))}
      </MenuItems>
    </SidebarWrapper>
  );
};

export default Sidebar;