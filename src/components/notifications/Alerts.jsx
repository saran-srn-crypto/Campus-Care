import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';

export default function Alerts() {
  const { toast } = useNotifications();
  return (
    <div className={`fixed left-1/2 top-6 z-[9999] -translate-x-1/2 max-w-[min(520px,calc(100vw-32px))] px-6 py-3.5 rounded-xl bg-sidebar text-white shadow-[0_12px_32px_rgba(0,0,0,0.25)] border border-white/10 transition-all duration-300 ${toast.visible ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'}`} role="status" aria-live="polite">
      {toast.message}
    </div>
  );
}
