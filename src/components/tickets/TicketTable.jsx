import React from 'react';
import TicketCard from './TicketCard';

export default function TicketTable({ tickets, selectedId, onSelect }) {
  if (!tickets.length) return <div className="p-5.5 text-center text-muted border border-line rounded-lg bg-white">No tickets match the selected filters.</div>;
  return (
    <div className="grid gap-3">
      {tickets.map(t => <TicketCard key={t.id} ticket={t} onClick={onSelect} selected={t.id === selectedId} />)}
    </div>
  );
}
