// src/pages/notifications/index.jsx
import React, { useState, useEffect } from 'react';
import { Bell, Check, AlertTriangle, Info, Calendar, Clock, ArrowRight, X, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import useNotification from '../../hooks/useNotification';

// Mock data for fallback
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
  color: var(--color-navy);
`;

const Badge = styled.span`
  padding: 4px 12px;
  background: ${props => props.color || '#e3f2fd'};
  color: ${props => props.textColor || 'var(--color-navy)'};
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
  color: ${props => props.color || 'var(--color-navy)'};
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
  color: var(--color-navy);
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
  color: var(--color-navy);
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
  const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotification();
  
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, 3); // Fetch only the latest 3 for the dropdown
    }
  }, [isOpen, fetchNotifications]);

  const handleNotificationClick = (notificationId) => {
    markAsRead(notificationId);
  };

  return (
    <DropdownContainer isOpen={isOpen}>
      <DropdownHeader>
        <DropdownTitle>Notifications</DropdownTitle>
        <Badge>{unreadCount || 0} New</Badge>
      </DropdownHeader>

      <NotificationList>
        {notifications.slice(0, 3).map((notification) => (
          <NotificationItem 
            key={notification._id}
            to={notification.data?.link || '/notifications'}
            isUnread={!notification.read}
            onClick={() => handleNotificationClick(notification._id)}
          >
            <NotificationContent>
              <NotificationIcon 
                type={notification.type?.toLowerCase() || 'info'} 
                priority={notification.data?.priority || 'medium'} 
              />
              <TextContent>
                <NotificationTitle>{notification.title}</NotificationTitle>
                <NotificationMessage>{notification.message}</NotificationMessage>
                <Timestamp>{formatTimestamp(notification.createdAt)}</Timestamp>
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
  color: var(--color-navy);
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

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${props => props.isActive ? 'var(--color-navy)' : '#e5e7eb'};
  background: ${props => props.isActive ? 'var(--color-navy)' : 'white'};
  color: ${props => props.isActive ? 'white' : 'var(--color-navy)'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.isActive ? '#151b4f' : '#f8fafc'};
    border-color: ${props => props.isActive ? '#151b4f' : 'var(--color-navy)'};
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 24px;
  color: #64748b;
  font-size: 14px;
`;

const NotificationGrid = styled.div`
  display: grid;
  gap: 12px;
`;

const NotificationCardContent = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

const CardIconWrapper = styled.div`
  flex-shrink: 0;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: var(--color-navy);
  margin-bottom: 4px;
`;

const CardMessage = styled.p`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
`;

const CardTimestamp = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
`;

const ActionIconButton = styled.button`
  padding: 8px;
  border: none;
  background: none;
  border-radius: 50%;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f1f5f9;
    color: var(--color-navy);
  }
`;

const CardLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  color: var(--color-navy);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border-top: 1px solid #e5e7eb;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
  }
`;

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
`;

const PaginationButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  color: var(--color-navy);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f8fafc;
    border-color: var(--color-navy);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
`;

const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: var(--color-navy);
  margin: 16px 0 8px;
`;

const EmptyMessage = styled.p`
  font-size: 14px;
  color: #64748b;
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
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) {
    return 'Just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  } else if (diffHr < 24) {
    return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
};

const NotificationCard = styled.div`
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  color: var(--color-navy);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #f8fafc;
    border-color: var(--color-navy);
  }
`;

const NotificationsPage = () => {
  const { 
    notifications, 
    loading, 
    unreadCount,
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotification();
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const result = await fetchNotifications(currentPage, 10);
        if (result?.pagination) {
          setTotalPages(result.pagination.total);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };
    
    loadNotifications();
  }, [fetchNotifications, currentPage]);

  const handleMarkAsRead = (id) => {
    markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleDeleteNotification = (id) => {
    deleteNotification(id);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  // Filter notifications based on selected filter
  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
      ? notifications.filter(n => !n.read) 
      : notifications.filter(n => n.read);

  return (
    <NotificationContainer>
      <Header>
        <TitleSection>
          <PageTitle>Notifications</PageTitle>
          <PageDescription>View and manage your notifications</PageDescription>
        </TitleSection>
        <ActionButtons>
          <FilterButton isActive={filter === 'all'} onClick={() => handleFilterChange('all')}>
            All
          </FilterButton>
          <FilterButton isActive={filter === 'unread'} onClick={() => handleFilterChange('unread')}>
            Unread
          </FilterButton>
          <FilterButton isActive={filter === 'read'} onClick={() => handleFilterChange('read')}>
            Read
          </FilterButton>
          <ActionButton onClick={handleMarkAllAsRead}>
            <Check size={16} />
            Mark All Read
          </ActionButton>
        </ActionButtons>
      </Header>

      {loading ? (
        <LoadingMessage>Loading notifications...</LoadingMessage>
      ) : filteredNotifications.length > 0 ? (
        <>
          <NotificationGrid>
            {filteredNotifications.map((notification) => (
              <NotificationCard key={notification._id}>
                <NotificationCardContent>
                  <CardIconWrapper>
                    <NotificationIcon 
                      type={notification.type?.toLowerCase() || 'info'} 
                      priority={notification.data?.priority || 'medium'} 
                    />
                  </CardIconWrapper>
                  <CardContent>
                    <CardTitle>{notification.title}</CardTitle>
                    <CardMessage>{notification.message}</CardMessage>
                    <CardTimestamp>
                      <Clock size={14} />
                      {formatTimestamp(notification.createdAt)}
                    </CardTimestamp>
                  </CardContent>
                  <CardActions>
                    {!notification.read && (
                      <ActionIconButton 
                        onClick={() => handleMarkAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </ActionIconButton>
                    )}
                    <ActionIconButton 
                      onClick={() => handleDeleteNotification(notification._id)}
                      title="Delete notification"
                    >
                      <X size={16} />
                    </ActionIconButton>
                  </CardActions>
                </NotificationCardContent>
                {notification.data?.link && (
                  <CardLink to={notification.data.link}>
                    View Details <ArrowRight size={14} />
                  </CardLink>
                )}
              </NotificationCard>
            ))}
          </NotificationGrid>

          {totalPages > 1 && (
            <Pagination>
              <PaginationButton 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </PaginationButton>
              <PageInfo>Page {currentPage} of {totalPages}</PageInfo>
              <PaginationButton 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
              </PaginationButton>
            </Pagination>
          )}
        </>
      ) : (
        <EmptyState>
          <Bell size={48} color="#94a3b8" />
          <EmptyTitle>No notifications</EmptyTitle>
          <EmptyMessage>You don't have any notifications at the moment</EmptyMessage>
        </EmptyState>
      )}
    </NotificationContainer>
  );
};

export default NotificationsPage;