import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import { SOCKET_EVENTS } from '../utils/constants';
import { SOCKET_CONFIG } from '../config/api';
import api from '../services/api';

const useNotification = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const { user, token } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (user && token) {
        const socketInstance = io(SOCKET_CONFIG.URL, {
        auth: { token },
        ...SOCKET_CONFIG.OPTIONS
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected for notifications');
        // Fetch notifications when socket connects
        fetchNotifications();
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socketInstance.on(SOCKET_EVENTS.NOTIFICATION.NEW, (notification) => {
        console.log('New notification received:', notification);
        setNotifications(prev => [notification, ...(prev || [])]);
        setUnreadCount(prev => prev + 1);
      });

      setSocket(socketInstance);

      return () => {
        if (socketInstance) {
          socketInstance.disconnect();
        }
      };
    }
  }, [user, token]);

  // Fetch notifications
  const fetchNotifications = useCallback(async (page = 1, limit = 10) => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/notifications`, {
        params: { page, limit }
      });
      
      const fetchedNotifications = response.data.notifications || [];
      console.log('Fetched notifications:', fetchedNotifications);
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter(n => !n.read).length);
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Mark a notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!token || !notificationId) return Promise.resolve();

    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return Promise.resolve(response.data);
      }
      return Promise.resolve(response.data);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return Promise.reject(error);
    }
  }, [token]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!token) return Promise.resolve();

    try {
      const response = await api.put('/notifications/read-all');
      
      if (response.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        return Promise.resolve(response.data);
      }
      return Promise.resolve(response.data);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return Promise.reject(error);
    }
  }, [token]);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!token || !notificationId) return Promise.resolve();

    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      
      // Update unread count properly by checking if deleted notification was unread
      setNotifications(prev => {
        const deleted = prev.find(n => n._id === notificationId);
        if (deleted && !deleted.read) {
          setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n._id !== notificationId);
      });
      return Promise.resolve(response.data);
    } catch (error) {
      console.error('Error deleting notification:', error);
      return Promise.reject(error);
    }
  }, [token]);

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  };
};

export default useNotification;
