import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ComplaintPagination({ page, totalPages, totalElements, size, onPageChange }) {
  const current = page + 1;
  const start = totalElements === 0 ? 0 : page * size + 1;
  const end = Math.min(totalElements, (page + 1) * size);

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-lg border border-line bg-white" aria-label="Complaint pagination">
      <span className="text-sm text-muted">
        Showing {start}-{end} of {totalElements} complaints
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
          className="w-10 h-10 rounded-lg border border-line bg-white text-[#344054] grid place-items-center disabled:opacity-50 hover:bg-surface-soft"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="min-w-[88px] text-center text-sm font-extrabold">Page {current} of {Math.max(totalPages, 1)}</span>
        <button
          type="button"
          disabled={current >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="w-10 h-10 rounded-lg border border-line bg-white text-[#344054] grid place-items-center disabled:opacity-50 hover:bg-surface-soft"
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </nav>
  );
}
