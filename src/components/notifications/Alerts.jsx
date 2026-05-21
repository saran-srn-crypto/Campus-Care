import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';

export default function Alerts() {
  const { toast } = useNotifications();
  return (
    <div className={`fixed left-1/2 bottom-6 z-30 -translate-x-1/2 max-w-[min(520px,calc(100vw-32px))] px-4 py-3 rounded-lg bg-sidebar text-white shadow-card transition-all duration-200 ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-[100px] opacity-0'}`} role="status" aria-live="polite">
      {toast.message}
    </div>
  );
}
