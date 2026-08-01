import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_EVENTS } from '../utils/constants';
import { SOCKET_CONFIG } from '../config/api';
import api from '../services/api';

export const NotificationContext = createContext(null);

const getNotificationId = (notification) => notification?._id || notification?.id;

const normalizeNotification = (notification) => {
  const notificationId = getNotificationId(notification);
  return notificationId
    ? { ...notification, _id: notificationId, id: notificationId }
    : notification;
};

const mergeNotifications = (current, incoming, replace = false) => {
  const merged = new Map();
  (replace ? [] : current).forEach((notification) => {
    const notificationId = getNotificationId(notification);
    if (notificationId) {
      merged.set(String(notificationId), normalizeNotification(notification));
    }
  });
  incoming.forEach((notification) => {
    const notificationId = getNotificationId(notification);
    if (!notificationId) return;
    merged.set(String(notificationId), {
      ...(merged.get(String(notificationId)) || {}),
      ...normalizeNotification(notification)
    });
  });
  return Array.from(merged.values()).sort(
    (left, right) => new Date(right.createdAt) - new Date(left.createdAt)
  );
};

export const NotificationProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const lastRequestRef = useRef({ page: 1, limit: 10 });

  const fetchNotifications = useCallback(async (page = 1, limit = 10) => {
    if (!token) return undefined;
    lastRequestRef.current = { page, limit };
    setLoading(true);

    try {
      const response = await api.get('/notifications', { params: { page, limit, _t: Date.now() } });
      const fetched = response.data.notifications || [];
      setNotifications((current) => mergeNotifications(current, fetched, true));
      setUnreadCount(
        Number.isFinite(response.data.unreadCount)
          ? response.data.unreadCount
          : fetched.filter((notification) => !notification.read).length
      );
      return response.data;
    } finally {
      setLoading(false);
    }
  }, [token]);

  const refreshNotifications = useCallback(() => {
    const { page, limit } = lastRequestRef.current;
    return fetchNotifications(page, limit);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!user || !token) {
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }

    const socket = io(SOCKET_CONFIG.URL, {
      auth: { token },
      ...SOCKET_CONFIG.OPTIONS
    });
    const handleConnected = () => {
      refreshNotifications().catch(() => undefined);
    };
    const handleNewNotification = (notification) => {
      setNotifications((current) => mergeNotifications(current, [notification]));
      if (!notification.read) setUnreadCount((count) => count + 1);
    };

    socket.on('connect', handleConnected);
    socket.on('reconnect', handleConnected);
    socket.on(SOCKET_EVENTS.NOTIFICATION.NEW, handleNewNotification);

    return () => {
      socket.off('connect', handleConnected);
      socket.off('reconnect', handleConnected);
      socket.off(SOCKET_EVENTS.NOTIFICATION.NEW, handleNewNotification);
      socket.disconnect();
    };
  }, [user, token, refreshNotifications]);

  useEffect(() => {
    if (!token) return undefined;

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') {
        refreshNotifications().catch(() => undefined);
      }
    };
    const interval = window.setInterval(refreshWhenVisible, 30000);
    window.addEventListener('focus', refreshWhenVisible);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshWhenVisible);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
    };
  }, [token, refreshNotifications]);

  const markAsRead = useCallback(async (notificationId) => {
    if (!token || !notificationId) return undefined;
    let wasUnread = false;
    setNotifications((current) => current.map((notification) => {
      if (String(getNotificationId(notification)) !== String(notificationId)) return notification;
      wasUnread = !notification.read;
      return { ...notification, read: true, readAt: new Date().toISOString() };
    }));
    if (wasUnread) setUnreadCount((count) => Math.max(0, count - 1));

    try {
      return (await api.put(`/notifications/${notificationId}/read`)).data;
    } catch (error) {
      refreshNotifications().catch(() => undefined);
      throw error;
    }
  }, [token, refreshNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!token) return undefined;
    setNotifications((current) => current.map((notification) => ({
      ...notification,
      read: true,
      readAt: notification.readAt || new Date().toISOString()
    })));
    setUnreadCount(0);

    try {
      return (await api.put('/notifications/read-all')).data;
    } catch (error) {
      refreshNotifications().catch(() => undefined);
      throw error;
    }
  }, [token, refreshNotifications]);

  const deleteNotification = useCallback(async (notificationId) => {
    if (!token || !notificationId) return undefined;
    const deleted = notifications.find(
      (notification) => String(getNotificationId(notification)) === String(notificationId)
    );
    setNotifications((current) => current.filter(
      (notification) => String(getNotificationId(notification)) !== String(notificationId)
    ));
    if (deleted && !deleted.read) setUnreadCount((count) => Math.max(0, count - 1));

    try {
      return (await api.delete(`/notifications/${notificationId}`)).data;
    } catch (error) {
      refreshNotifications().catch(() => undefined);
      throw error;
    }
  }, [token, notifications, refreshNotifications]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  }), [
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  ]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
