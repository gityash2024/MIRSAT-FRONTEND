// src/pages/notifications/index.jsx
import React, { useState } from 'react';
import { Bell, Check, AlertTriangle, Info, Calendar, Clock, ArrowRight, X, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const mockNotifications = [
  {
    id: 1,
    type: 'task',
    title: 'New Task Assigned',
    message: 'Beach Safety Inspection - Zone A has been assigned to you',
    timestamp: '2024-01-15T09:30:00',
    status: 'unread',
    priority: 'high',
    link: '/tasks/1'
  },
  {
    id: 2,
    type: 'alert',
    title: 'Inspection Deadline Approaching',
    message: 'Marina Equipment Verification due in 24 hours',
    timestamp: '2024-01-14T14:20:00',
    status: 'unread',
    priority: 'high',
    link: '/tasks/2'
  },
  {
    id: 3,
    type: 'info',
    title: 'Task Status Updated',
    message: 'Safety Training Documentation Review marked as completed',
    timestamp: '2024-01-14T11:15:00',
    status: 'read',
    priority: 'medium',
    link: '/tasks/3'
  },
  {
    id: 4,
    type: 'calendar',
    title: 'Upcoming Meeting',
    message: 'Team coordination meeting scheduled for tomorrow at 10:00 AM',
    timestamp: '2024-01-13T16:45:00',
    status: 'read',
    priority: 'medium',
    link: '/calendar'
  },
  {
    id: 5,
    type: 'task',
    title: 'Task Review Required',
    message: 'Please review and approve Beach Cleanliness Inspection report',
    timestamp: '2024-01-13T13:20:00',
    status: 'unread',
    priority: 'high',
    link: '/tasks/5'
  }
];

const DropdownContainer = styled.div`
  position: absolute;
  right: 0;
  top: 100%;
  width: 380px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transform-origin: top right;
  transition: all 0.2s ease-in-out;
  opacity: ${props => props.isOpen ? 1 : 0};
  transform: ${props => props.isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(-10px)'};
  pointer-events: ${props => props.isOpen ? 'auto' : 'none'};
  z-index: 1000;
`;

const DropdownHeader = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const DropdownTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a237e;
`;

const Badge = styled.span`
  padding: 4px 12px;
  background: ${props => props.color || '#e3f2fd'};
  color: ${props => props.textColor || '#1a237e'};
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
`;

const NotificationList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
`;

const NotificationItem = styled(Link)`
  display: block;
  padding: 12px 16px;
  text-decoration: none;
  background: ${props => props.isUnread ? '#f1f5f9' : 'white'};
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const NotificationContent = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const IconWrapper = styled.div`
  padding: 8px;
  border-radius: 50%;
  background: ${props => props.bg || '#e3f2fd'};
  color: ${props => props.color || '#1a237e'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TextContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  color: #1a237e;
  margin-bottom: 4px;
`;

const NotificationMessage = styled.p`
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
`;

const Timestamp = styled.span`
  font-size: 12px;
  color: #94a3b8;
`;

const ViewAllButton = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: #f8fafc;
  color: #1a237e;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border-top: 1px solid #e5e7eb;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
  }
`;

export const NotificationDropdown = ({ isOpen }) => {
  const unreadCount = mockNotifications.filter(n => n.status === 'unread').length;

  return (
    <DropdownContainer isOpen={isOpen}>
      <DropdownHeader>
        <DropdownTitle>Notifications</DropdownTitle>
        <Badge>{unreadCount} New</Badge>
      </DropdownHeader>

      <NotificationList>
        {mockNotifications.slice(0, 3).map((notification) => (
          <NotificationItem 
            key={notification.id}
            to={notification.link}
            isUnread={notification.status === 'unread'}
          >
            <NotificationContent>
              <NotificationIcon type={notification.type} priority={notification.priority} />
              <TextContent>
                <NotificationTitle>{notification.title}</NotificationTitle>
                <NotificationMessage>{notification.message}</NotificationMessage>
                <Timestamp>{formatTimestamp(notification.timestamp)}</Timestamp>
              </TextContent>
            </NotificationContent>
          </NotificationItem>
        ))}
      </NotificationList>

      <ViewAllButton to="/notifications">
        View All Notifications
        <ArrowRight size={16} />
      </ViewAllButton>
    </DropdownContainer>
  );
};

const NotificationContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const TitleSection = styled.div``;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 4px;
`;

const PageDescription = styled.p`
  color: #64748b;
  font-size: 14px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const FilterSelect = styled.select`
  padding: 8px 36px 8px 40px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #1a237e;
  background: white;
  appearance: none;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: #1a237e;
    box-shadow: 0 0 0 2px rgba(26, 35, 126, 0.1);
  }
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  background: none;
  color: #1a237e;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #151b4f;
  }
`;

const NotificationsGrid = styled.div`
  display: grid;
  gap: 12px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const NotificationCard = styled.div`
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const CardContent = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActionIcon = styled.button`
  padding: 8px;
  border: none;
  background: none;
  border-radius: 50%;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: #1a237e;
  }
`;

const NotificationIcon = ({ type, priority }) => {
  const getIconConfig = () => {
    switch (type) {
      case 'task':
        return {
          Icon: Check,
          bg: priority === 'high' ? '#fef2f2' : '#f0fdf4',
          color: priority === 'high' ? '#dc2626' : '#16a34a'
        };
      case 'alert':
        return {
          Icon: AlertTriangle,
          bg: '#fff7ed',
          color: '#ea580c'
        };
      case 'info':
        return {
          Icon: Info,
          bg: '#f0f9ff',
          color: '#0284c7'
        };
      case 'calendar':
        return {
          Icon: Calendar,
          bg: '#faf5ff',
          color: '#9333ea'
        };
      default:
        return {
          Icon: Bell,
          bg: '#f1f5f9',
          color: '#64748b'
        };
    }
  };

  const { Icon, bg, color } = getIconConfig();

  return (
    <IconWrapper bg={bg} color={color}>
      <Icon size={16} />
    </IconWrapper>
  );
};

const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

const NotificationsPage = () => {
  const [filter, setFilter] = useState('all');

  return (
    <NotificationContainer>
      <Header>
        <TitleSection>
          <PageTitle>Notifications</PageTitle>
          <PageDescription>Stay updated with your latest activities</PageDescription>
        </TitleSection>

        <Actions>
          <div style={{ position: 'relative' }}>
            <Filter size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <FilterSelect value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Notifications</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </FilterSelect>
          </div>
          <ActionButton>Mark all as read</ActionButton>
        </Actions>
      </Header>

      <NotificationsGrid>
        {mockNotifications.map((notification) => (
          <NotificationCard key={notification.id}>
            <CardContent>
              <NotificationIcon type={notification.type} priority={notification.priority} />
              <TextContent>
                <NotificationTitle>{notification.title}</NotificationTitle>
                <NotificationMessage>{notification.message}</NotificationMessage>
                <Timestamp>{formatTimestamp(notification.timestamp)}</Timestamp>
              </TextContent>
              <CardActions>
                <ActionIcon as={Link} to={notification.link}>
                  <ArrowRight size={18} />
                </ActionIcon>
                <ActionIcon onClick={(e) => e.preventDefault()}>
                  <X size={18} />
                </ActionIcon>
              </CardActions>
            </CardContent>
          </NotificationCard>
        ))}
      </NotificationsGrid>
    </NotificationContainer>
  );
};

export default NotificationsPage;