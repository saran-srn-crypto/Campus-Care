import React from 'react';
import TicketTable from '../tickets/TicketTable';

export default function TicketHistory({ tickets, selectedId, onSelect }) {
  return (
    <section className="grid gap-4">
      <div><h2 className="m-0">Complaint History</h2><p className="mt-1 mb-0 text-muted">Open, assigned, in-progress, resolved, and closed tickets.</p></div>
      <TicketTable tickets={tickets} selectedId={selectedId} onSelect={onSelect} />
    </section>
  );
}
