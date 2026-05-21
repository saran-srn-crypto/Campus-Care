import React from 'react';

export default function TicketFilters({ filters, categories, onChange }) {
  const selectCls = 'w-full border border-[#cbd5e1] rounded-lg bg-white text-ink px-3 py-2.5 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)]';
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="grid gap-1.5">
        <label htmlFor="filterStatus" className="text-[#344054] text-sm font-bold">Status</label>
        <select id="filterStatus" value={filters.staffStatus} onChange={e => onChange({ staffStatus: e.target.value })} className={selectCls}>
          {['All', 'Assigned', 'In Progress', 'Resolved', 'Closed'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="filterPriority" className="text-[#344054] text-sm font-bold">Priority</label>
        <select id="filterPriority" value={filters.staffPriority} onChange={e => onChange({ staffPriority: e.target.value })} className={selectCls}>
          {['All', 'Low', 'Medium', 'High', 'Urgent'].map(p => <option key={p}>{p}</option>)}
        </select>
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="filterCategory" className="text-[#344054] text-sm font-bold">Category</label>
        <select id="filterCategory" value={filters.staffCategory} onChange={e => onChange({ staffCategory: e.target.value })} className={selectCls}>
          {['All', ...categories].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
}
