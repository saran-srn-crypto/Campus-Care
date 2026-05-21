import React from 'react';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationsPage() {
  const { notifications } = useNotifications();
  return (
    <div className="grid gap-3">
      <h2 className="m-0">All Notifications</h2>
      {notifications.length ? notifications.map(n => (
        <div key={n.id} className="p-3 rounded-lg bg-surface-soft border border-line">
          <strong className="block">{n.title}</strong>
          <span className="text-muted text-sm">{n.body}</span>
        </div>
      )) : <p className="text-muted">No notifications.</p>}
    </div>
  );
}
