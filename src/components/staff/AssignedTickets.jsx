import React from 'react';
import TicketFilters from '../tickets/TicketFilters';
import TicketTable from '../tickets/TicketTable';

export default function AssignedTickets({ tickets, filters, categories, onFilterChange, selectedId, onSelect }) {
  return (
    <article className="p-4.5 border border-line rounded-lg bg-white shadow-card grid gap-4">
      <div><h2 className="m-0">Assigned Tickets</h2><p className="mt-1 mb-0 text-muted">Filter by priority, category, and current workflow status.</p></div>
      <TicketFilters filters={filters} categories={categories} onChange={onFilterChange} />
      <TicketTable tickets={tickets} selectedId={selectedId} onSelect={onSelect} />
    </article>
  );
}
