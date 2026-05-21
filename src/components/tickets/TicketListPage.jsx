import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import { useAuth } from '../../hooks/useAuth';
import { getStats } from '../../utils/helpers';
import StatusBadge from '../common/StatusBadge';
import StatsGrid from '../common/StatsGrid';
import Timeline from '../common/Timeline';
import StaffAssignment from '../warden/StaffAssignment';
import ClosureApproval from '../warden/ClosureApproval';
import ResolutionNotes from '../staff/ResolutionNotes';
import EscalationPanel from '../staff/EscalationPanel';
import {
  ArrowLeft, Search, X, ChevronLeft, ChevronRight,
  Ticket, Clock, CheckCircle, AlertTriangle,
  FileText, MapPin, User, Calendar, MessageSquare, ImagePlus,
} from 'lucide-react';

const PAGE_SIZE = 8;

const filterMeta = {
  all:      { title: 'All Tickets',      icon: Ticket,        color: '#1f57c3', bg: '#e9f0ff' },
  pending:  { title: 'Pending Tickets',  icon: Clock,         color: '#b98900', bg: '#fff3dc' },
  resolved: { title: 'Resolved Tickets', icon: CheckCircle,   color: '#0d9668', bg: '#e4f8f2' },
  urgent:   { title: 'Urgent Tickets',   icon: AlertTriangle, color: '#d9534f', bg: '#fff0ee' },
};

function applyFilter(tickets, filterKey) {
  if (filterKey === 'all') return tickets;
  if (filterKey === 'pending') return tickets.filter(t => ['Open', 'Assigned', 'In Progress'].includes(t.status));
  if (filterKey === 'resolved') return tickets.filter(t => t.status === 'Resolved');
  if (filterKey === 'urgent') return tickets.filter(t => t.priority === 'Urgent');
  return tickets;
}

export default function TicketListPage() {
  const { filter } = useParams();
  const filterKey = filter || 'all';
  const meta = filterMeta[filterKey] || filterMeta.all;
  const FilterIcon = meta.icon;

  const navigate = useNavigate();
  const { state, setSelectedTicket } = useTickets();
  const { role, getProfile } = useAuth();
  const profile = getProfile();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [detailTicketId, setDetailTicketId] = useState(null);

  const detailTicket = useMemo(() => {
    return state.tickets.find(t => t.id === detailTicketId) || null;
  }, [state.tickets, detailTicketId]);

  // Role-aware base tickets
  const roleTickets = useMemo(() => {
    if (role === 'student') return state.tickets.filter(t => t.owner === profile.name || t.owner === profile.userId);
    return state.tickets;
  }, [state.tickets, role, profile.name, profile.userId]);

  const stats = getStats(roleTickets);

  // Apply primary filter from route
  const primaryFiltered = useMemo(() => applyFilter(roleTickets, filterKey), [roleTickets, filterKey]);

  // Apply secondary filters + search
  const filtered = useMemo(() => {
    return primaryFiltered.filter(t => {
      if (statusFilter !== 'All' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
      if (categoryFilter !== 'All' && t.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.id.toLowerCase().includes(q) &&
          !(t.owner || '').toLowerCase().includes(q) &&
          !(t.description || '').toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [primaryFiltered, statusFilter, priorityFilter, categoryFilter, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  // Available categories
  const categories = useMemo(() => {
    const set = new Set(roleTickets.map(t => t.category));
    return ['All', ...Array.from(set).sort()];
  }, [roleTickets]);

  const isLoading = state.tickets.length === 0 && !state.selectedTicketId;

  const inputCls = 'border border-[#cbd5e1] rounded-lg bg-white text-ink px-3 py-2 text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)] transition-shadow';

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPriorityFilter('All');
    setCategoryFilter('All');
    setPage(1);
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All';

  const openDetail = useCallback((ticket) => {
    setDetailTicketId(ticket.id);
    setSelectedTicket(ticket.id);
  }, [setSelectedTicket]);

  const closeDetail = useCallback(() => setDetailTicketId(null), []);

  return (
    <>
      {/* Stats cards at the top */}
      <StatsGrid stats={stats} />

      <section className="mt-5 grid gap-0">
        {/* Page header */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(role === 'student' ? '/student/dashboard' : `/dashboard/${role}`)}
              className="w-10 h-10 rounded-xl border border-line bg-white grid place-items-center hover:bg-surface-soft hover:border-primary transition-all duration-200"
              title="Back to Dashboard"
              aria-label="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-xl grid place-items-center" style={{ backgroundColor: meta.bg, color: meta.color }}>
                <FilterIcon size={20} />
              </span>
              <div>
                <h2 className="m-0 text-xl font-bold">{meta.title}</h2>
                <p className="m-0 text-muted text-sm">{filtered.length} ticket{filtered.length !== 1 ? 's' : ''} found</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters bar */}
        <div className="p-4 border border-line rounded-xl bg-white shadow-card mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative flex-grow min-w-[220px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="ticket-search"
                placeholder="Search by ID, title, owner, or description..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
                className={`${inputCls} pl-9 w-full`}
                aria-label="Search tickets"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Status dropdown (only for 'all' filter view) */}
            {filterKey === 'all' && (
              <select id="filter-status" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className={inputCls} aria-label="Filter by status">
                <option value="All">All Status</option>
                <option value="Open">Open</option>
                <option value="Assigned">Assigned</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            )}

            {/* Priority dropdown (only for non-urgent) */}
            {filterKey !== 'urgent' && (
              <select id="filter-priority" value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }} className={inputCls} aria-label="Filter by priority">
                <option value="All">All Priority</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            )}

            {/* Category dropdown */}
            <select id="filter-category" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} className={inputCls} aria-label="Filter by category">
              {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>

            {/* Clear all */}
            {hasActiveFilters && (
              <button onClick={clearFilters} className="text-xs font-semibold text-danger hover:underline flex items-center gap-1 whitespace-nowrap">
                <X size={12} /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ─── Loading state ─── */}
        {isLoading && (
          <div className="p-16 text-center border border-line rounded-xl bg-white shadow-card">
            <div className="inline-block w-8 h-8 border-3 border-line border-t-primary rounded-full animate-spin mb-3" />
            <p className="text-muted">Loading tickets...</p>
          </div>
        )}

        {/* ─── Empty state ─── */}
        {!isLoading && filtered.length === 0 && (
          <div className="p-16 text-center border border-line rounded-xl bg-white shadow-card">
            <div className="w-16 h-16 rounded-2xl grid place-items-center mx-auto mb-4" style={{ backgroundColor: meta.bg, color: meta.color }}>
              <FilterIcon size={32} />
            </div>
            <h3 className="m-0 text-lg font-bold">No tickets found</h3>
            <p className="mt-2 mb-4 text-muted max-w-sm mx-auto">
              {hasActiveFilters
                ? 'Try adjusting your search or filter criteria.'
                : `There are no ${filterKey === 'all' ? '' : filterKey + ' '}tickets at the moment.`}
            </p>
            {hasActiveFilters && (
              <button onClick={clearFilters}
                className="min-h-[40px] px-4 py-2 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-colors">
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* ─── Ticket table ─── */}
        {!isLoading && filtered.length > 0 && (
          <div className="border border-line rounded-xl bg-white shadow-card overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[0.55fr_1.6fr_0.65fr_0.6fr_0.7fr_0.75fr] gap-2 px-5 py-3 bg-surface-soft text-xs font-bold text-muted uppercase border-b border-line">
              <span>Ticket ID</span><span>Title</span><span>Status</span><span>Priority</span><span>Category</span><span>Owner</span>
            </div>

            {/* Rows */}
            {paged.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => openDetail(t)}
                className={`ticket-row w-full grid grid-cols-[0.55fr_1.6fr_0.65fr_0.6fr_0.7fr_0.75fr] gap-2 items-center px-5 py-3.5 text-left text-sm border-b border-line/50 transition-all duration-150
                  ${detailTicket?.id === t.id
                    ? 'bg-[#f0f5ff] border-l-3 border-l-primary'
                    : 'bg-white hover:bg-surface-soft'}`}
                style={{ animationDelay: `${idx * 30}ms` }}
                aria-label={`View ticket ${t.id}`}
              >
                <code className="text-xs font-bold" style={{ color: meta.color }}>{t.id}</code>
                <div className="truncate">
                  <span className="font-medium">{t.title}</span>
                  {t.location && <span className="block text-xs text-muted truncate mt-0.5">{t.location}</span>}
                </div>
                <StatusBadge value={t.status} />
                <StatusBadge type="priority" value={t.priority} />
                <span className="text-muted text-xs truncate">{t.category}</span>
                <span className="text-xs truncate">{t.owner}</span>
              </button>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 bg-surface-soft border-t border-line">
                <span className="text-xs text-muted">
                  Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={safePage <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="w-8 h-8 rounded-lg border border-line bg-white grid place-items-center hover:bg-surface-soft disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold grid place-items-center transition-colors
                        ${p === safePage
                          ? 'bg-primary text-white border border-primary'
                          : 'border border-line bg-white hover:bg-surface-soft'}`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    disabled={safePage >= totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="w-8 h-8 rounded-lg border border-line bg-white grid place-items-center hover:bg-surface-soft disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ─── Ticket Detail Modal ─── */}
      {detailTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={closeDetail}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />

          {/* Modal */}
          <article
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-line animate-[modalIn_0.25s_ease-out]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 p-5 pb-4 bg-white/95 backdrop-blur-sm border-b border-line">
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <code className="text-sm font-bold" style={{ color: meta.color }}>{detailTicket.id}</code>
                  <StatusBadge value={detailTicket.status} />
                  <StatusBadge type="priority" value={detailTicket.priority} />
                </div>
                <h2 className="m-0 text-lg font-bold leading-snug">{detailTicket.title}</h2>
              </div>
              <button onClick={closeDetail} className="w-9 h-9 rounded-lg border border-line bg-white grid place-items-center hover:bg-surface-soft flex-shrink-0 transition-colors" aria-label="Close detail">
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 grid gap-5">
              {/* Description */}
              <div>
                <h4 className="m-0 mb-1.5 text-xs font-bold uppercase text-muted flex items-center gap-1.5"><FileText size={13} /> Description</h4>
                <p className="m-0 leading-relaxed">{detailTicket.description}</p>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-surface-soft">
                  <span className="text-xs text-muted flex items-center gap-1"><User size={11} /> Owner</span>
                  <strong className="block mt-1 text-sm">{detailTicket.owner}</strong>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft">
                  <span className="text-xs text-muted flex items-center gap-1"><User size={11} /> Assignee</span>
                  <strong className="block mt-1 text-sm">{detailTicket.assignee || 'Not assigned'}</strong>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft">
                  <span className="text-xs text-muted flex items-center gap-1"><MapPin size={11} /> Location</span>
                  <strong className="block mt-1 text-sm">{detailTicket.location}</strong>
                </div>
                <div className="p-3 rounded-lg bg-surface-soft">
                  <span className="text-xs text-muted flex items-center gap-1"><Calendar size={11} /> Created</span>
                  <strong className="block mt-1 text-sm">{detailTicket.created}</strong>
                </div>
              </div>

              {/* Student Uploaded Attachments */}
              {detailTicket.attachments && detailTicket.attachments.length > 0 && (
                <div>
                  <h4 className="m-0 mb-2 text-xs font-bold uppercase text-muted flex items-center gap-1.5"><ImagePlus size={13} /> Student Attachments</h4>
                  <div className="flex flex-wrap gap-3">
                    {detailTicket.attachments.map((att, idx) => {
                      const isBase64 = att && att.startsWith('data:');
                      return (
                        <div key={idx} className="p-2 rounded-xl bg-surface-soft border border-line flex-shrink-0">
                          {isBase64 ? (
                            <img src={att} alt={`Attachment ${idx + 1}`} className="rounded-lg max-h-36 max-w-[200px] object-cover border border-line shadow-sm hover:scale-[1.02] transition-transform duration-200" />
                          ) : (
                            <div className="flex flex-col gap-1.5 items-center justify-center w-36 h-28 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] text-xs font-bold text-muted text-center p-3 shadow-sm">
                              <div className="w-10 h-10 rounded-full bg-[#e2e8f0] text-[#475569] grid place-items-center mb-1">
                                📁
                              </div>
                              <span className="truncate w-full text-[#475569]">{att}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {detailTicket.timeline && detailTicket.timeline.length > 0 && (
                <div>
                  <h4 className="m-0 mb-2 text-xs font-bold uppercase text-muted">Timeline</h4>
                  <Timeline items={detailTicket.timeline} />
                </div>
              )}

              {/* Comments */}
              <div>
                <h4 className="m-0 mb-2 text-xs font-bold uppercase text-muted flex items-center gap-1.5">
                  <MessageSquare size={13} /> Comments ({detailTicket.comments?.length || 0})
                </h4>
                {detailTicket.comments && detailTicket.comments.length > 0 ? (
                  <div className="grid gap-2">
                    {detailTicket.comments.map((c, i) => (
                      <div key={i} className="p-3 rounded-lg bg-surface-soft">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm">{c.by}</strong>
                          <span className="text-xs text-muted">{c.role}</span>
                        </div>
                        <p className="mt-1 mb-0 text-sm">{c.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="m-0 text-sm text-muted">No comments yet.</p>
                )}
              </div>

              {/* Role-based actions inside modal */}
              {role === 'warden' && (
                <div className="grid gap-4 border-t border-line pt-4 mt-2">
                  <h4 className="m-0 text-xs font-bold uppercase text-muted">Warden Management Controls</h4>
                  <StaffAssignment ticket={detailTicket} />
                  <ClosureApproval ticket={detailTicket} />
                </div>
              )}
              {role === 'staff' && (
                <div className="grid gap-4 border-t border-line pt-4 mt-2">
                  <h4 className="m-0 text-xs font-bold uppercase text-muted">Technician Controls</h4>
                  <ResolutionNotes ticket={detailTicket} />
                  <EscalationPanel ticket={detailTicket} />
                </div>
              )}
            </div>
          </article>
        </div>
      )}
    </>
  );
}
