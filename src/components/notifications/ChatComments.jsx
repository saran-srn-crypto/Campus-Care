import React from 'react';

export default function ChatComments({ comments = [] }) {
  if (!comments.length) return <div className="p-5.5 text-center text-muted border border-line rounded-lg bg-white">No comments yet.</div>;
  return (
    <div className="grid gap-2.5">
      {comments.map((c, i) => (
        <div key={i} className="p-3 rounded-lg bg-surface-soft">
          <strong className="block">{c.by}</strong>
          <span className="block text-muted text-sm">{c.role}</span>
          <p className="mt-1.5 mb-0">{c.text}</p>
        </div>
      ))}
    </div>
  );
}
