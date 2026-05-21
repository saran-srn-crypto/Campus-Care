import React from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useNotifications } from '../../hooks/useNotifications';
import Button from '../common/Button';

export default function Reports() {
  const { state, exportPdfReport } = useTickets();
  const { showToast } = useNotifications();
  const categoryCounts = state.categories.map(c => ({ category: c, count: state.tickets.filter(t => t.category === c).length }));
  const maxCount = Math.max(...categoryCounts.map(c => c.count), 1);

  const handleDownloadReport = async (reportType) => {
    try {
      showToast(`Generating ${reportType} PDF report...`);
      await exportPdfReport();
      showToast(`${reportType} PDF report downloaded successfully.`);
    } catch (err) {
      showToast('Failed to generate PDF report.');
    }
  };

  return (
    <article className="p-4.5 border border-line rounded-lg bg-white shadow-card grid gap-4">
      <div><h2 className="m-0">Reports and Analytics</h2><p className="mt-1 mb-0 text-muted">Monthly and semester report snapshot.</p></div>
      <div className="grid gap-3.5">
        {categoryCounts.map(item => (
          <div key={item.category} className="grid grid-cols-[150px_minmax(0,1fr)_44px] gap-2.5 items-center">
            <strong>{item.category}</strong>
            <div className="h-3 rounded-full bg-[#e6ebf2] overflow-hidden">
              <div className="h-full rounded-full bg-teal" style={{ width: `${(item.count / maxCount) * 100}%` }} />
            </div>
            <span>{item.count}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Button variant="secondary" onClick={() => handleDownloadReport('Monthly')}>Monthly Report</Button>
        <Button variant="secondary" onClick={() => handleDownloadReport('Semester')}>Semester Report</Button>
      </div>
    </article>
  );
}
