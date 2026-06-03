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
        className={`fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[999] transition-opacity duration-300 ${
          panelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <section
        className={`fixed top-0 right-0 h-screen w-[min(400px,100vw)] bg-white shadow-[0_0_40px_rgba(0,0,0,0.15)] z-[1000] flex flex-col sliding-drawer border-l border-line ${
          panelOpen ? 'translate-x-0 visible' : 'translate-x-full invisible pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-line flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-primary"><Bell size={20} /></span>
            <h2 className="m-0 text-base font-extrabold text-ink">Notifications</h2>
          </div>
          <button
            onClick={() => setPanelOpen(false)}
            className="w-8 h-8 rounded-lg border border-line bg-white text-slate-500 hover:text-ink hover:bg-slate-50 transition-colors grid place-items-center cursor-pointer"
            aria-label="Close notifications"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-4 grid gap-3 align-content-start bg-slate-50/50">
          {notifications.length ? (
            notifications.map(n => <NotificationCard key={n.id} item={n} />)
          ) : (
            <div className="p-8 text-center text-muted border border-dashed border-[#e2e8f0] rounded-xl bg-white shadow-sm flex flex-col items-center justify-center gap-2">
              <span className="text-3xl">📭</span>
              <span className="font-bold text-sm">No notifications</span>
              <span className="text-xs text-slate-400">We'll alert you when updates occur.</span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
