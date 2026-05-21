import React from 'react';

export default function ComplaintSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-4 rounded-lg border border-line bg-white shadow-card animate-pulse">
          <div className="h-3 w-24 rounded bg-surface-soft" />
          <div className="mt-3 h-5 w-3/4 rounded bg-surface-soft" />
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-12 rounded bg-surface-soft" />
            <div className="h-12 rounded bg-surface-soft" />
            <div className="h-12 rounded bg-surface-soft" />
            <div className="h-12 rounded bg-surface-soft" />
          </div>
          <div className="mt-4 h-10 rounded bg-surface-soft" />
        </div>
      ))}
    </div>
  );
}
