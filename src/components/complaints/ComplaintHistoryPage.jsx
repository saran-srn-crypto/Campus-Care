import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { useTickets } from '../../hooks/useTickets';
import { useStudentComplaints } from '../../hooks/useStudentComplaints';
import ComplaintStatsTabs from './ComplaintStatsTabs';
import ComplaintFilterToolbar from './ComplaintFilterToolbar';
import ComplaintCard from './ComplaintCard';
import ComplaintSkeleton from './ComplaintSkeleton';
import ComplaintPagination from './ComplaintPagination';
import EmptyComplaintsState from './EmptyComplaintsState';
import StatusBadge from '../common/StatusBadge';
import ComplaintDetailsPanel from './ComplaintDetailsPanel';

const DEFAULT_FILTERS = {
  search: '',
  status: 'All',
  priority: 'All',
  category: 'All',
  dateFrom: '',
  dateTo: '',
  sort: 'Latest',
};

function filtersFromParams(params) {
  return {
    search: params.get('search') || '',
    status: params.get('status') || 'All',
    priority: params.get('priority') || 'All',
    category: params.get('category') || 'All',
    dateFrom: params.get('dateFrom') || '',
    dateTo: params.get('dateTo') || '',
    sort: params.get('sort') || 'Latest',
  };
}

export default function ComplaintHistoryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { state } = useTickets();
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_FILTERS, ...filtersFromParams(searchParams) }));
  const [page, setPage] = useState(0);
  const size = 10;

  useEffect(() => {
    setFilters(prev => ({ ...prev, ...filtersFromParams(searchParams) }));
    setPage(0);
  }, [searchParams]);

  const params = useMemo(() => ({
    page,
    size,
    search: filters.search,
    status: filters.status,
    priority: filters.priority,
    category: filters.category,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    sort: filters.sort,
  }), [filters, page]);

  const { complaints, meta, statusCounts, loading, error, refetch } = useStudentComplaints(params);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Sync selectedTicket with complaints updates (e.g. status changes inside the modal)
  const activeDetailTicket = useMemo(() => {
    if (!selectedTicket) return null;
    return complaints.find(t => t.id === selectedTicket.id) || selectedTicket;
  }, [complaints, selectedTicket]);

  // Handle auto-opening of the modal if search parameter matches exactly one ticket ID
  useEffect(() => {
    if (filters.search && complaints.length === 1) {
      const match = complaints[0];
      if (match.id.toLowerCase() === filters.search.trim().toLowerCase()) {
        setSelectedTicket(match);
      }
    }
  }, [filters.search, complaints]);

  const updateUrl = (next) => {
    const params = new URLSearchParams();
    Object.entries(next).forEach(([key, value]) => {
      if (value && value !== 'All' && value !== DEFAULT_FILTERS[key]) params.set(key, value);
    });
    setSearchParams(params, { replace: true });
  };

  const handleFiltersChange = (updates) => {
    const next = { ...filters, ...updates };
    setFilters(next);
    setPage(0);
    updateUrl(next);
  };

  const handleTabChange = (status) => {
    handleFiltersChange({ status });
  };

  return (
    <div className="grid gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="m-0 text-2xl font-extrabold">Complaint History</h2>
          <p className="mt-1 mb-0 text-muted">Track all complaints, statuses, timelines, and responses.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/student/raise-complaint')}
          className="hidden md:inline-flex min-h-[42px] rounded-lg bg-primary text-white px-4 py-2 font-extrabold items-center gap-2 hover:bg-primary-dark transition-colors"
        >
          <Plus size={17} /> Raise Complaint
        </button>
      </header>

      <ComplaintStatsTabs counts={statusCounts} activeStatus={filters.status} onChange={handleTabChange} />

      <ComplaintFilterToolbar
        filters={filters}
        categories={state.categories}
        onChange={handleFiltersChange}
        onClear={() => handleFiltersChange(DEFAULT_FILTERS)}
      />

      {error && (
        <div className="p-4 rounded-lg border border-[#f4c4be] bg-[#fff0ee] text-danger font-bold" role="alert">
          {error}
        </div>
      )}

      <section aria-busy={loading} className="grid gap-4">
        {loading ? (
          <ComplaintSkeleton count={4} />
        ) : complaints.length ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
            {complaints.map(ticket => (
              <ComplaintCard
                key={ticket.id}
                ticket={ticket}
                onViewDetails={() => setSelectedTicket(ticket)}
              />
            ))}
          </div>
        ) : (
          <EmptyComplaintsState onCreate={() => navigate('/student/raise-complaint')} />
        )}
      </section>

      {!loading && complaints.length > 0 && (
        <ComplaintPagination
          page={meta.page}
          totalPages={meta.totalPages}
          totalElements={meta.totalElements}
          size={meta.size}
          onPageChange={setPage}
        />
      )}

      <button
        type="button"
        onClick={() => navigate('/student/raise-complaint')}
        className="md:hidden fixed right-5 bottom-5 z-20 w-13 h-13 rounded-full bg-primary text-white grid place-items-center shadow-card"
        aria-label="Raise complaint"
      >
        <Plus size={22} />
      </button>

      {/* ─── Ticket Detail Pop-up Modal ─── */}
      {activeDetailTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]" onClick={() => setSelectedTicket(null)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Modal */}
          <article
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-line animate-[modalIn_0.25s_ease-out] custom-scrollbar"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 p-5 pb-4 bg-white/95 backdrop-blur-sm border-b border-line">
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <code className="text-sm font-bold text-primary">{activeDetailTicket.id}</code>
                  <StatusBadge value={activeDetailTicket.status} />
                  <StatusBadge type="priority" value={activeDetailTicket.priority} />
                </div>
                <h2 className="m-0 text-lg font-bold leading-snug">{activeDetailTicket.title}</h2>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="w-9 h-9 rounded-lg border border-line bg-white grid place-items-center hover:bg-surface-soft flex-shrink-0 transition-colors" aria-label="Close detail">
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <ComplaintDetailsPanel ticket={activeDetailTicket} onUpdate={refetch} />
          </article>
        </div>
      )}
    </div>
  );
}
