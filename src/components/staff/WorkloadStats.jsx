import React, { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function WorkloadStats({ tickets }) {
  const { getProfile } = useAuth();
  const staffName = getProfile().name;

  // Compute counts per staff from provided tickets (excluding closed tickets)
  const { count, maxCount } = useMemo(() => {
    const countsMap = {};
    tickets
      .filter(t => t.status !== 'Closed')
      .forEach(t => {
        countsMap[t.assignee] = (countsMap[t.assignee] || 0) + 1;
      });
    const countsArray = Object.entries(countsMap).map(([name, cnt]) => ({ name, count: cnt }));
    const max = Math.max(...countsArray.map(i => i.count), 1);
    const staffItem = countsArray.find(i => i.name === staffName) || { name: staffName, count: 0 };
    return { count: staffItem.count, maxCount: max };
  }, [tickets, staffName]);

  return (
    <article className="p-4.5 border border-line rounded-lg bg-white shadow-card">
      <h2 className="m-0 mb-3">My Workload</h2>
      <div className="grid gap-3.5 items-center">
        <div className="grid grid-cols-[150px_minmax(0,1fr)_44px] gap-2.5 items-center">
          <strong>{staffName}</strong>
          <div className="h-3 rounded-full bg-[#e6ebf2] overflow-hidden">
            <div
              className="h-full rounded-full bg-teal"
              style={{ width: `${Math.max((count / maxCount) * 100, 8)}%` }}
            />
          </div>
          <span>{count}</span>
        </div>
      </div>
    </article>
  );
}
