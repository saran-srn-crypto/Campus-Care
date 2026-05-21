import React from 'react';

export default function TicketStatistics({ stats }) {
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5" aria-label="Ticket statistics">
      <article className="p-4 border border-line rounded-lg bg-white shadow-card"><span className="block text-muted text-sm">Total tickets</span><strong className="block mt-2.5 text-3xl">{stats.total}</strong></article>
      <article className="p-4 border border-line rounded-lg bg-white shadow-card"><span className="block text-muted text-sm">Pending tickets</span><strong className="block mt-2.5 text-3xl">{stats.pending}</strong></article>
      <article className="p-4 border border-line rounded-lg bg-white shadow-card"><span className="block text-muted text-sm">Resolved tickets</span><strong className="block mt-2.5 text-3xl">{stats.resolved}</strong></article>
      <article className="p-4 border border-line rounded-lg bg-white shadow-card"><span className="block text-muted text-sm">Urgent tickets</span><strong className="block mt-2.5 text-3xl">{stats.urgent}</strong></article>
    </section>
  );
}
