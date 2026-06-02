import React from 'react';
import TicketCard from './TicketCard';

export default function TicketTable({ tickets, selectedId, onSelect, layout = 'grid' }) {
  if (!tickets.length) return <div className="p-5.5 text-center text-muted border border-line rounded-lg bg-white">No tickets match the selected filters.</div>;

  if (layout === 'slide') {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 scroll-snap-x scrollbar-thin scrollbar-thumb-slate-300">
        {tickets.map(t => (
          <div key={t.id} className="min-w-[320px] md:min-w-[380px] scroll-snap-align-start flex-shrink-0">
            <TicketCard ticket={t} onClick={onSelect} selected={t.id === selectedId} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {tickets.map(t => <TicketCard key={t.id} ticket={t} onClick={onSelect} selected={t.id === selectedId} />)}
    </div>
  );
}
