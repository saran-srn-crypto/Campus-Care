import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationCard from './NotificationCard';

export default function NotificationPanel() {
  const { notifications, panelOpen, setPanelOpen } = useNotifications();
  if (!panelOpen) return null;

  return (
    <section className="absolute top-[78px] right-7 w-[min(380px,calc(100vw-32px))] p-3.5 grid gap-2.5 border border-line rounded-lg bg-white shadow-card z-20">
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 text-base font-bold">Notifications</h2>
        <button onClick={() => setPanelOpen(false)} className="w-8 min-h-8 p-0 grid place-items-center border border-line rounded-lg bg-white text-ink" aria-label="Close notifications">&times;</button>
      </div>
      {notifications.length ? notifications.map(n => <NotificationCard key={n.id} item={n} />) : (
        <div className="p-5.5 text-center text-muted border border-line rounded-lg bg-white">No notifications.</div>
      )}
    </section>
  );
}
