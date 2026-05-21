import React, { useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import { useAuth } from '../../hooks/useAuth';
import { getStats, statusClass, priorityClass } from '../../utils/helpers';
import StatusBadge from '../common/StatusBadge';
import StatsGrid from '../common/StatsGrid';
import TicketDetails from '../tickets/TicketDetails';
import ClosureApproval from '../warden/ClosureApproval';
import StaffAssignment from '../warden/StaffAssignment';
import ResolutionNotes from '../staff/ResolutionNotes';
import EscalationPanel from '../staff/EscalationPanel';
import { ArrowLeft, Search, Filter, SlidersHorizontal } from 'lucide-react';

export default function ComplaintsView() {
  const { state, getSelectedTicket, setSelectedTicket } = useTickets();
  const { role, getProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const filterParam = searchParams.get('filter') || null;

  const profile = getProfile();

  // Derive tickets for the current role
  const roleTickets = useMemo(() => {
    if (role === 'student') return state.tickets.filter(t => t.owner === profile.name || t.owner === profile.userId);
    return state.tickets;
  }, [state.tickets, role, profile.name, profile.userId]);

  const stats = getStats(roleTickets);

  // Filter state
  const [statusFilter, setStatusFilter] = useState(filterParam === 'pending' ? 'Active' : filterParam === 'resolved' ? 'Resolved' : filterParam === 'urgent' ? 'Urgent' : 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const filtered = useMemo(() => {
    return roleTickets.filter(t => {
      // Status grouping
      if (statusFilter === 'Active') {
        if (!['Open', 'Assigned', 'In Progress'].includes(t.status)) return false;
      } else if (statusFilter === 'Resolved') {
        if (t.status !== 'Resolved') return false;
      } else if (statusFilter === 'Urgent') {
        if (t.priority !== 'Urgent') return false;
      }
      // Priority
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !t.id.toLowerCase().includes(q) && !(t.owner || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [roleTickets, statusFilter, searchQuery, priorityFilter]);

  const selectedTicket = getSelectedTicket();

  const actions = useMemo(() => {
    if (!selectedTicket) return null;
    return (
      <>
        {role === 'warden' && (
          <div className="grid gap-4 border-t border-line pt-4 mt-2">
            <h4 className="m-0 text-xs font-bold uppercase text-muted">Warden Management Controls</h4>
            <StaffAssignment ticket={selectedTicket} />
            <ClosureApproval ticket={selectedTicket} />
          </div>
        )}
        {role === 'staff' && (
          <div className="grid gap-4 border-t border-line pt-4 mt-2">
            <h4 className="m-0 text-xs font-bold uppercase text-muted">Technician Controls</h4>
            <ResolutionNotes ticket={selectedTicket} />
            <EscalationPanel ticket={selectedTicket} />
          </div>
        )}
      </>
    );
  }, [role, selectedTicket]);

  const inputCls = 'border border-[#cbd5e1] rounded-lg bg-white text-ink px-3 py-2 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)] text-sm';

  return (
    <>
      <StatsGrid stats={stats} />

      <section className="mt-5 grid grid-cols-1 xl:grid-cols-[1.4fr_0.75fr] gap-5 items-start">
        {/* Left – Complaints List */}
        <article className="p-4.5 border border-line rounded-lg bg-white shadow-card grid gap-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate(`/dashboard/${role}`)}
                className="w-9 h-9 rounded-lg border border-line bg-white grid place-items-center hover:bg-surface-soft transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h2 className="m-0">All Complaints</h2>
                <p className="mt-0.5 mb-0 text-muted text-sm">{filtered.length} of {roleTickets.length} complaints displayed</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className={`${inputCls} pl-8 w-[200px]`}
                />
              </div>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={inputCls}>
                <option value="All">All Status</option>
                <option value="Active">Pending / Active</option>
                <option value="Resolved">Resolved</option>
                <option value="Urgent">Urgent</option>
              </select>
              <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className={inputCls}>
                <option value="All">All Priority</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[0.6fr_1.5fr_0.7fr_0.7fr_0.7fr_0.8fr] gap-2 px-3 py-2 bg-surface-soft rounded-lg text-xs font-bold text-muted uppercase">
            <span>ID</span><span>Title</span><span>Status</span><span>Priority</span><span>Category</span><span>Owner</span>
          </div>

          {/* Rows */}
          <div className="grid gap-1">
            {filtered.length === 0 && (
              <div className="p-6 text-center text-muted">No complaints match your filters.</div>
            )}
            {filtered.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTicket(t.id)}
                className={`w-full grid grid-cols-[0.6fr_1.5fr_0.7fr_0.7fr_0.7fr_0.8fr] gap-2 items-center px-3 py-3 rounded-lg border text-left text-sm transition-all duration-150
                  ${state.selectedTicketId === t.id
                    ? 'border-primary bg-[#f0f5ff] shadow-sm'
                    : 'border-transparent bg-white hover:bg-surface-soft'}`}
              >
                <code className="text-xs font-semibold text-primary-dark">{t.id}</code>
                <span className="truncate font-medium">{t.title}</span>
                <StatusBadge value={t.status} />
                <StatusBadge type="priority" value={t.priority} />
                <span className="text-muted truncate">{t.category}</span>
                <span className="truncate">{t.owner}</span>
              </button>
            ))}
          </div>
        </article>

        {/* Right – Ticket Details */}
        <div className="grid gap-4">
          <TicketDetails ticket={selectedTicket} actions={actions} />
        </div>
      </section>
    </>
  );
}
