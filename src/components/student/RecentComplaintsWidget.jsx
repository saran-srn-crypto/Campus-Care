import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/helpers';

export default function RecentComplaintsWidget({ tickets = [] }) {
  const navigate = useNavigate();
  const recent = tickets.slice(0, 3);

  return (
    <section className="p-5 border border-line rounded-lg bg-white shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="m-0">Recent Complaints</h2>
          <p className="mt-1 mb-0 text-muted">Latest activity from your submitted tickets.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/student/complaints')}
          className="min-h-[38px] rounded-lg border border-[#b8c5d6] bg-white text-primary-dark px-3 py-2 font-extrabold hover:bg-surface-soft transition-colors flex items-center gap-1.5"
        >
          View All <ArrowRight size={15} />
        </button>
      </div>

      {recent.length ? (
        <div className="grid gap-3">
          {recent.map(ticket => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => navigate('/student/complaints?search=' + encodeURIComponent(ticket.id))}
              className="w-full p-3.5 rounded-lg border border-line bg-white text-left transition-all duration-200 hover:border-[#9ab1d5] hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-[#d6e4ff]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-extrabold uppercase text-muted">{ticket.id}</span>
                  <h3 className="m-0 mt-1 text-base font-bold">{ticket.title}</h3>
                  <p className="m-0 mt-1 text-sm text-muted">{formatDate(ticket.created)} - {ticket.location || 'Campus'}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <StatusBadge value={ticket.status} />
                  <StatusBadge type="priority" value={ticket.priority} />
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-muted border border-dashed border-line rounded-lg bg-surface-soft">
          No complaints raised yet.
        </div>
      )}
    </section>
  );
}
