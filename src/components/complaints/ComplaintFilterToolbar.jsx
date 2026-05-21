import React, { useState } from 'react';
import { Filter, Search, X } from 'lucide-react';

const statuses = ['All', 'Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
const priorities = ['All', 'Low', 'Medium', 'High', 'Urgent'];
const sorts = ['Latest', 'Oldest', 'Priority', 'Status'];

export default function ComplaintFilterToolbar({ filters, categories = [], onChange, onClear }) {
  const [open, setOpen] = useState(false);
  const inputCls = 'w-full min-h-[40px] border border-[#cbd5e1] rounded-lg bg-white text-ink px-3 py-2 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)]';

  const set = (key) => (e) => onChange({ [key]: e.target.value });

  return (
    <section className="sticky top-[88px] z-[8] border border-line rounded-lg bg-white/95 shadow-card backdrop-blur-sm">
      <div className="p-4 flex items-center justify-between gap-3 md:hidden">
        <div className="flex items-center gap-2 font-extrabold">
          <Filter size={18} /> Filters
        </div>
        <button type="button" onClick={() => setOpen(value => !value)} className="w-9 h-9 rounded-lg border border-line grid place-items-center">
          {open ? <X size={17} /> : <Filter size={17} />}
        </button>
      </div>

      <div className={[open ? 'grid' : 'hidden', 'md:grid p-4 pt-0 md:pt-4 gap-3'].join(' ')}>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(220px,1.3fr)_repeat(4,minmax(140px,0.8fr))] gap-3">
          <label className="grid gap-1.5">
            <span className="text-[#344054] text-sm font-bold">Search</span>
            <span className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                value={filters.search}
                onChange={set('search')}
                placeholder="Ticket ID, title, or location"
                className={inputCls + ' pl-9'}
              />
            </span>
          </label>

          <label className="grid gap-1.5">
            <span className="text-[#344054] text-sm font-bold">Status</span>
            <select value={filters.status} onChange={set('status')} className={inputCls}>
              {statuses.map(value => <option key={value}>{value}</option>)}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-[#344054] text-sm font-bold">Priority</span>
            <select value={filters.priority} onChange={set('priority')} className={inputCls}>
              {priorities.map(value => <option key={value}>{value}</option>)}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-[#344054] text-sm font-bold">Category</span>
            <select value={filters.category} onChange={set('category')} className={inputCls}>
              <option>All</option>
              {categories.map(value => <option key={value}>{value}</option>)}
            </select>
          </label>

          <label className="grid gap-1.5">
            <span className="text-[#344054] text-sm font-bold">Sort</span>
            <select value={filters.sort} onChange={set('sort')} className={inputCls}>
              {sorts.map(value => <option key={value}>{value}</option>)}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[repeat(2,minmax(150px,220px))_auto] gap-3 items-end">
          <label className="grid gap-1.5">
            <span className="text-[#344054] text-sm font-bold">From</span>
            <input type="date" value={filters.dateFrom} onChange={set('dateFrom')} className={inputCls} />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[#344054] text-sm font-bold">To</span>
            <input type="date" value={filters.dateTo} onChange={set('dateTo')} className={inputCls} />
          </label>
          <button type="button" onClick={onClear} className="min-h-[40px] rounded-lg border border-[#b8c5d6] bg-white text-primary-dark px-3 py-2 font-extrabold hover:bg-surface-soft transition-colors">
            Clear
          </button>
        </div>
      </div>
    </section>
  );
}
