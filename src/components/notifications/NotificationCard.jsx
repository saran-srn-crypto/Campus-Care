import React from 'react';

export default function NotificationCard({ item }) {
  return (
    <article className="group relative grid gap-1.5 p-4 rounded-2xl bg-white/30 hover:bg-white/55 border border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(27,36,48,0.06)] cursor-pointer overflow-hidden">
      {/* Gloss reflection overlay line */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Unread indicator dot as glowing liquid drop */}
      {item.unread && (
        <span className="absolute top-4.5 right-4.5 w-2 h-2 rounded-full bg-[#1f57c3] shadow-[0_0_10px_#1f57c3] animate-[pulse_2s_infinite]" />
      )}

      <strong className="break-words text-sm text-slate-800 font-bold pr-4 group-hover:text-primary transition-colors">{item.title}</strong>
      <span className="break-words text-slate-500 text-xs leading-relaxed">{item.body}</span>
    </article>
  );
}
