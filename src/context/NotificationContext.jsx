import React, { createContext, useContext } from 'react';
import { useDashboardContext } from './DashboardContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const dashboard = useDashboardContext();

  const notifications = dashboard?.notifications || [];
  const panelOpen = dashboard?.panelOpen || false;
  const toast = dashboard?.toast || { message: '', visible: false };
  const unreadCount = dashboard?.unreadCount || 0;

  const addNotification = dashboard?.addNotification;
  const markAllRead = dashboard?.markAllRead;
  const togglePanel = dashboard?.togglePanel;
  const setPanelOpen = dashboard?.setPanelOpen;
  const showToast = dashboard?.showToast;

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
