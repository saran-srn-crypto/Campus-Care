import React from 'react';
import { useTickets } from '../../hooks/useTickets';

export default function WorkloadStats() {
  const { state } = useTickets();
  const workload = state.staffMembers.map(name => ({
    name, count: state.tickets.filter(t => t.assignee === name && t.status !== 'Closed').length,
  })).sort((a, b) => b.count - a.count);

  return (
    <article className="p-4.5 border border-line rounded-lg bg-white shadow-card">
      <h2 className="m-0 mb-3">Workload Dashboard</h2>
      <div className="grid gap-3.5">
        {workload.map(item => (
          <div key={item.name} className="grid grid-cols-[150px_minmax(0,1fr)_44px] gap-2.5 items-center">
            <strong>{item.name}</strong>
            <div className="h-3 rounded-full bg-[#e6ebf2] overflow-hidden">
              <div className="h-full rounded-full bg-teal" style={{ width: `${Math.max(item.count * 24, 8)}%` }} />
            </div>
            <span>{item.count}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
