import React from 'react';
import StatusBadge from '../common/StatusBadge';

export default function TicketCard({ ticket, onClick, selected }) {
  return (
    <article
      onClick={() => onClick?.(ticket.id)}
      className={`p-4 grid gap-3 border rounded-lg bg-white shadow-card cursor-pointer transition-colors hover:border-[#9ab1d5] ${selected ? 'border-primary' : 'border-line'}`}
    >
      <div className="flex justify-between items-start gap-3">
        <div>
          <h3 className="m-0 text-base font-bold">{ticket.title}</h3>
          <div className="flex flex-wrap gap-2 items-center text-muted text-sm mt-1">
            <span>{ticket.id}</span>
            <span>{ticket.category}</span>
            <span>{ticket.location}</span>
          </div>
        </div>
        <StatusBadge value={ticket.status} />
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <StatusBadge type="priority" value={ticket.priority} />
        <StatusBadge value={ticket.assignee || 'Unassigned'} />
      </div>
      <div className="flex flex-wrap gap-2 items-center text-muted text-sm">
        <span>Created {ticket.created}</span>
        <span>Due {ticket.due}</span>
      </div>
    </article>
  );
}
