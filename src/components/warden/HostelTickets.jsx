import React from 'react';
import TicketTable from '../tickets/TicketTable';

export default function HostelTickets({ tickets, selectedId, onSelect }) {
  return (
    <div className="grid gap-4">
      <article className="p-4.5 border border-line rounded-lg bg-white shadow-card">
        <h2 className="m-0">Hostel Complaints</h2>
        <p className="mt-1 mb-0 text-muted">Monitor hostel tickets, assign maintenance, and approve closures.</p>
      </article>
      <TicketTable tickets={tickets} selectedId={selectedId} onSelect={onSelect} />
    </div>
  );
}
