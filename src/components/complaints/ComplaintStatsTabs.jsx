import React from 'react';

const tabs = ['All', 'Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

export default function ComplaintStatsTabs({ counts = {}, activeStatus, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Complaint status filters">
      {tabs.map(tab => {
        const active = activeStatus === tab || (!activeStatus && tab === 'All');
        const count = counts[tab] ?? (tab === 'All' ? counts.total : 0) ?? 0;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab)}
            className={[
              'min-h-[40px] whitespace-nowrap rounded-lg border px-3.5 py-2 text-sm font-extrabold transition-colors',
              active ? 'border-primary bg-[#e9f0ff] text-primary-dark' : 'border-line bg-white text-[#344054] hover:bg-surface-soft',
            ].join(' ')}
          >
            {tab}
            <span className="ml-2 inline-flex min-w-[24px] h-6 items-center justify-center rounded-full bg-white px-2 text-xs text-muted">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
