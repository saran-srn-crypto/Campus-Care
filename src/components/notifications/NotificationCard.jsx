import React from 'react';

export default function NotificationCard({ item }) {
  return (
    <div className="grid gap-1 p-2.5 rounded-lg bg-surface-soft">
      <strong className="break-words">{item.title}</strong>
      <span className="break-words text-muted text-sm">{item.body}</span>
    </div>
  );
}
