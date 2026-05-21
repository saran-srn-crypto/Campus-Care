import React, { useState } from 'react';
import { CalendarDays, ChevronDown, MapPin, UserRound } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import ComplaintDetailsPanel from './ComplaintDetailsPanel';
import { formatDate } from '../../utils/helpers';

export default function ComplaintCard({ ticket }) {
  const [open, setOpen] = useState(false);
  const assignedStaff = ticket.assignedStaff || ticket.assignee || 'Unassigned';

  return (
    <article className="border border-line rounded-lg bg-white shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9ab1d5] overflow-hidden">
      <div className="p-4 grid gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-xs font-extrabold uppercase text-muted">{ticket.id}</span>
            <h3 className="m-0 mt-1 text-lg font-extrabold leading-tight">{ticket.title}</h3>
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted">
              <span>{ticket.category}</span>
              <span>{ticket.department || ticket.category}</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <StatusBadge type="priority" value={ticket.priority} />
            <StatusBadge value={ticket.status} />
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <UserRound size={16} className="mt-0.5 text-muted" />
            <div>
              <dt className="font-extrabold text-[#344054]">Assigned staff</dt>
              <dd className="m-0 text-muted">{assignedStaff}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 text-muted" />
            <div>
              <dt className="font-extrabold text-[#344054]">Location</dt>
              <dd className="m-0 text-muted">{ticket.location || 'Campus'}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CalendarDays size={16} className="mt-0.5 text-muted" />
            <div>
              <dt className="font-extrabold text-[#344054]">Created</dt>
              <dd className="m-0 text-muted">{formatDate(ticket.created)}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CalendarDays size={16} className="mt-0.5 text-muted" />
            <div>
              <dt className="font-extrabold text-[#344054]">Due</dt>
              <dd className="m-0 text-muted">{formatDate(ticket.due)}</dd>
            </div>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => setOpen(value => !value)}
          aria-expanded={open}
          className="min-h-[40px] rounded-lg border border-[#b8c5d6] bg-white text-primary-dark px-3 py-2 font-extrabold hover:bg-surface-soft transition-colors flex items-center justify-center gap-1.5"
        >
          View Details
          <ChevronDown size={16} className={open ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
      </div>

      {open && (
        <div className="border-t border-line animate-[slideDown_220ms_ease-out]">
          <ComplaintDetailsPanel ticket={ticket} />
        </div>
      )}
    </article>
  );
}
