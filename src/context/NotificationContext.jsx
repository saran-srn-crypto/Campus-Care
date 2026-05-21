import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../services/apiHelper';
import { useAuth } from '../hooks/useAuth';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const data = await api.get('/api/notifications');
      setNotifications(data || []);
    } catch (e) {
      console.error('Error fetching notifications', e);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      const timer = setInterval(fetchNotifications, 5000);
      return () => clearInterval(timer);
    } else {
      setNotifications([]);
    }
  }, [isLoggedIn, fetchNotifications]);

  const addNotification = useCallback(async (title, body) => {
    // Also save to backend
    try {
      await api.post('/api/notifications', { title, body, recipient: 'all' });
      await fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    try {
      await api.post('/api/notifications/read-all');
      await fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  }, [fetchNotifications]);

  const togglePanel = useCallback(async () => {
    setPanelOpen(prev => {
      const next = !prev;
      if (next) {
        // When opening the panel, mark all read on backend
        markAllRead();
      }
      return next;
    });
  }, [markAllRead]);

  const showToast = useCallback((message) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 2200);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <NotificationContext.Provider value={{
      notifications, panelOpen, toast, unreadCount,
      addNotification, markAllRead, togglePanel, setPanelOpen, showToast,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotificationContext = () => useContext(NotificationContext);
