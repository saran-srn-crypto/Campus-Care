import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTickets } from '../hooks/useTickets';
import { useAuth } from '../hooks/useAuth';
import StatusBadge from '../components/common/StatusBadge';
import StaffAssignment from '../components/warden/StaffAssignment';
import ClosureApproval from '../components/warden/ClosureApproval';
import ResolutionNotes from '../components/staff/ResolutionNotes';
import EscalationPanel from '../components/staff/EscalationPanel';
import Timeline from '../components/common/Timeline';
import {
  Search,
  ShieldCheck,
  Ticket,
  ChevronRight,
  Users,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ImagePlus,
  FileText,
} from 'lucide-react';

export default function AdminControlsPage() {
  const { state } = useTickets();
  const { role } = useAuth();
  const [searchParams] = useSearchParams();
  const tickets = state.tickets || [];

  const [selectedId, setSelectedId] = useState(searchParams.get('ticket') || null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = useMemo(() => {
    return tickets.filter(t => {
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          (t.title || '').toLowerCase().includes(q) ||
          (t.id || '').toLowerCase().includes(q) ||
          (t.owner || '').toLowerCase().includes(q) ||
          (t.category || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tickets, search, statusFilter]);

  const selectedTicket = useMemo(() => {
    if (!selectedId) return filtered[0] || null;
    return tickets.find(t => t.id === selectedId) || filtered[0] || null;
  }, [selectedId, tickets, filtered]);

  const statusOptions = ['All', 'Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

  const statusIcon = (s) => {
    if (s === 'Resolved' || s === 'Closed') return <CheckCircle2 size={14} className="text-[#16a34a]" />;
    if (s === 'In Progress' || s === 'Assigned') return <Wrench size={14} className="text-[#2563eb]" />;
    return <AlertTriangle size={14} className="text-[#f59e0b]" />;
  };

  return (
    <div className="grid gap-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1f57c3] to-[#6366f1] text-white grid place-items-center shadow-md">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h2 className="m-0 text-xl font-bold text-ink">Administrative Controls</h2>
          <p className="m-0 text-muted text-sm">Assign staff, update resolution, approve closure &amp; manage ticket lifecycle</p>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-5 items-start">

        {/* Left: Ticket selector */}
        <div className="border border-line rounded-xl bg-white shadow-card overflow-hidden">
          {/* Search + filter bar */}
          <div className="p-3.5 border-b border-line bg-surface-soft grid gap-2.5">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search tickets…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-[#cbd5e1] rounded-lg bg-white text-ink text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.12)]"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {statusOptions.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={[
                    'px-3 py-1.5 rounded-full text-xs font-bold border transition-colors',
                    statusFilter === s
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-muted border-[#e2e8f0] hover:bg-surface-soft',
                  ].join(' ')}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket list */}
          <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
            {filtered.length === 0 && (
              <div className="p-8 text-center text-muted text-sm">No tickets match your filters.</div>
            )}
            {filtered.map(t => {
              const isActive = selectedTicket?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={[
                    'w-full text-left px-4 py-3.5 border-b border-line flex items-start gap-3 transition-colors group',
                    isActive
                      ? 'bg-[#eef3ff] border-l-[3px] border-l-primary'
                      : 'hover:bg-surface-soft border-l-[3px] border-l-transparent',
                  ].join(' ')}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Ticket size={16} className={isActive ? 'text-primary' : 'text-muted'} />
                  </div>
                  <div className="min-w-0 flex-grow grid gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-sm truncate">{t.title}</strong>
                      <ChevronRight size={14} className={`flex-shrink-0 transition-transform ${isActive ? 'text-primary rotate-90' : 'text-muted'}`} />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted">
                      <span className="font-mono">{t.id}</span>
                      <span>·</span>
                      <span>{t.category}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {statusIcon(t.status)}
                      <StatusBadge value={t.status} />
                      <StatusBadge type="priority" value={t.priority} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Ticket details + Admin controls */}
        {selectedTicket ? (
          <div className="grid gap-5">
            {/* Ticket summary card */}
            <div className="border border-line rounded-xl bg-white shadow-card p-5 grid gap-4">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <h3 className="m-0 text-lg font-bold">{selectedTicket.title}</h3>
                  <p className="mt-1 mb-0 text-muted text-sm">{selectedTicket.id} — {selectedTicket.category} — {selectedTicket.location}</p>
                </div>
                <StatusBadge value={selectedTicket.status} />
              </div>

              <p className="m-0 text-sm leading-relaxed">{selectedTicket.description}</p>

              <div className="flex flex-wrap gap-2 items-center">
                <StatusBadge type="priority" value={selectedTicket.priority} />
                <StatusBadge value={`Assigned: ${selectedTicket.assignee || 'Not assigned'}`} />
                <StatusBadge value={selectedTicket.department} />
                <StatusBadge value={`Owner: ${selectedTicket.owner}`} />
              </div>

              {/* Student uploaded attachments */}
              {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                <div className="border-t border-line pt-4">
                  <h4 className="m-0 mb-2 text-xs font-bold uppercase text-muted flex items-center gap-1.5"><ImagePlus size={13} /> Student Attachments</h4>
                  <div className="flex flex-wrap gap-3">
                    {selectedTicket.attachments.map((att, idx) => {
                      const isBase64 = att && att.startsWith('data:');
                      return (
                        <div key={idx} className="p-2 rounded-xl bg-surface-soft border border-line">
                          {isBase64 ? (
                            <img src={att} alt={`Attachment ${idx + 1}`} className="rounded-lg max-h-36 max-w-[200px] object-cover border border-line shadow-sm hover:scale-[1.02] transition-transform duration-200" />
                          ) : (
                            <div className="flex flex-col gap-1.5 items-center justify-center w-36 h-28 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] text-xs font-bold text-muted text-center p-3 shadow-sm">
                              <div className="w-10 h-10 rounded-full bg-[#e2e8f0] text-[#475569] grid place-items-center mb-1">📁</div>
                              <span className="truncate w-full text-[#475569]">{att}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Admin action panels in a clean grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Staff Assignment */}
              <div className="border border-line rounded-xl bg-white shadow-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#eff6ff] text-[#2563eb] grid place-items-center">
                    <Users size={16} />
                  </div>
                  <h4 className="m-0 text-sm font-bold text-ink">Staff Assignment</h4>
                </div>
                <StaffAssignment ticket={selectedTicket} />
              </div>

              {/* Escalation */}
              <div className="border border-line rounded-xl bg-white shadow-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#fef3c7] text-[#d97706] grid place-items-center">
                    <AlertTriangle size={16} />
                  </div>
                  <h4 className="m-0 text-sm font-bold text-ink">Escalation</h4>
                </div>
                <EscalationPanel ticket={selectedTicket} />
              </div>

              {/* Resolution Notes (full width) */}
              <div className="lg:col-span-2 border border-line rounded-xl bg-white shadow-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#f0fdf4] text-[#16a34a] grid place-items-center">
                    <Wrench size={16} />
                  </div>
                  <h4 className="m-0 text-sm font-bold text-ink">Resolution &amp; Proof Upload</h4>
                </div>
                <ResolutionNotes ticket={selectedTicket} />
              </div>

              {/* Closure Approval (full width) */}
              <div className="lg:col-span-2 border border-line rounded-xl bg-white shadow-card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-[#faf5ff] text-[#7c3aed] grid place-items-center">
                    <CheckCircle2 size={16} />
                  </div>
                  <h4 className="m-0 text-sm font-bold text-ink">Closure Verification &amp; Approval</h4>
                </div>
                <ClosureApproval ticket={selectedTicket} />
              </div>
            </div>

            {/* Timeline + Audit */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Timeline */}
              <div className="border border-line rounded-xl bg-white shadow-card p-5">
                <h4 className="m-0 mb-3 text-sm font-bold text-ink flex items-center gap-2">
                  <FileText size={15} className="text-muted" /> Ticket Timeline
                </h4>
                {selectedTicket.timeline && selectedTicket.timeline.length > 0 ? (
                  <Timeline items={selectedTicket.timeline} />
                ) : (
                  <p className="text-muted text-sm m-0">No timeline entries yet.</p>
                )}
              </div>

              {/* Comments */}
              <div className="border border-line rounded-xl bg-white shadow-card p-5">
                <h4 className="m-0 mb-3 text-sm font-bold text-ink">Comments &amp; Notes</h4>
                <div className="grid gap-2.5 max-h-80 overflow-y-auto">
                  {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                    selectedTicket.comments.map((c, i) => (
                      <div key={i} className="p-3 rounded-lg bg-surface-soft">
                        <strong className="block text-sm">{c.by}</strong>
                        <span className="block text-muted text-xs">{c.role}</span>
                        <p className="mt-1.5 mb-0 text-sm">{c.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted text-sm m-0">No comments yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-line rounded-xl bg-white shadow-card p-12 text-center grid gap-3 place-items-center">
            <div className="w-16 h-16 rounded-full bg-surface-soft text-muted grid place-items-center">
              <ShieldCheck size={28} />
            </div>
            <h3 className="m-0 text-ink">Select a Ticket</h3>
            <p className="m-0 text-muted text-sm max-w-xs">Choose a ticket from the list to view details and apply administrative actions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
