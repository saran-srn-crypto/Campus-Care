import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTickets } from '../../hooks/useTickets';
import { useStudentComplaints } from '../../hooks/useStudentComplaints';
import ComplaintStatsTabs from './ComplaintStatsTabs';
import ComplaintFilterToolbar from './ComplaintFilterToolbar';
import ComplaintCard from './ComplaintCard';
import ComplaintSkeleton from './ComplaintSkeleton';
import ComplaintPagination from './ComplaintPagination';
import EmptyComplaintsState from './EmptyComplaintsState';

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

  const { complaints, meta, statusCounts, loading, error } = useStudentComplaints(params);

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
            {complaints.map(ticket => <ComplaintCard key={ticket.id} ticket={ticket} />)}
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
    </div>
  );
}
