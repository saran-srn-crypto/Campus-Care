import React, { useEffect } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationCard from './NotificationCard';
import { X, Bell } from 'lucide-react';

export default function NotificationPanel() {
  const { notifications, panelOpen, setPanelOpen } = useNotifications();

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (panelOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [panelOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setPanelOpen(false)}
        className={`fixed inset-0 bg-[#0f172a]/15 backdrop-blur-[8px] z-[999] transition-opacity duration-300 ${
          panelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <section
        className={`fixed top-4 right-4 h-[calc(100vh-32px)] w-[min(420px,calc(100vw-32px))] bg-white/70 backdrop-blur-3xl shadow-[0_32px_64px_-16px_rgba(15,23,42,0.18),0_0_0_1px_rgba(255,255,255,0.4)] rounded-2xl flex flex-col sliding-drawer z-[1000] ${
          panelOpen ? 'translate-x-0 visible' : 'translate-x-[calc(100%+24px)] invisible pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/20 flex items-center justify-between bg-white/30 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <span className="text-[#1f57c3]"><Bell size={20} /></span>
            <h2 className="m-0 text-base font-extrabold text-slate-800">Notifications</h2>
          </div>
          <button
            onClick={() => setPanelOpen(false)}
            className="w-8 h-8 rounded-full border border-white/40 bg-white/40 text-slate-700 hover:text-ink hover:bg-white/80 hover:scale-105 transition-all grid place-items-center cursor-pointer shadow-sm"
            aria-label="Close notifications"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-5 grid gap-3.5 align-content-start">
          {notifications.length ? (
            notifications.map(n => <NotificationCard key={n.id} item={n} />)
          ) : (
            <div className="p-8 text-center text-slate-600 border border-white/30 rounded-2xl bg-white/30 backdrop-blur-md shadow-sm flex flex-col items-center justify-center gap-3">
              <span className="text-3xl">📭</span>
              <strong className="block text-sm">No notifications</strong>
              <span className="text-xs text-slate-400">We'll alert you when updates occur.</span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
