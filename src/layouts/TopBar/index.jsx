import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import { 
  Menu, 
  Bell, 
  User,
  ChevronDown
} from 'lucide-react';

const TopbarWrapper = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: ${props => props.isSidebarOpen ? '240px' : '64px'};
  height: 64px;
  background: white;
  display: flex;
  align-items: center;
  padding: 0 24px;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: left 0.3s;
  z-index: 900;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;

  .menu-button {
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    transition: background 0.3s;

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const NotificationBadge = styled.div`
  position: relative;
  cursor: pointer;

  .badge {
    position: absolute;
    top: -4px;
    right: -4px;
    background: #f44336;
    color: white;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
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

const Topbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user } = useAuth();

  return (
    <TopbarWrapper isSidebarOpen={isSidebarOpen}>
      <LeftSection>
        <div className="menu-button" onClick={toggleSidebar}>
          <Menu size={20} />
        </div>
      </LeftSection>

      <RightSection>
        <NotificationBadge>
          <Bell size={20} />
          <div className="badge">3</div>
        </NotificationBadge>

        <UserMenu>
          <div className="user-info">
            <div className="name">{user?.name}</div>
            <div className="role">{user?.role}</div>
          </div>
          <User size={20} />
          <ChevronDown size={16} />
        </UserMenu>
      </RightSection>
    </TopbarWrapper>
  );
};

export default Topbar;