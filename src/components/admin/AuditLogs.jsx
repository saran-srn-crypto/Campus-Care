import React, { useEffect, useState } from 'react';
import { api } from '../../services/apiHelper';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    try {
      const data = await api.get('/api/admin/logs');
      setLogs(data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch logs');
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <article className="p-4.5 border border-line rounded-lg bg-white shadow-card max-h-[400px] overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="m-0">System Activity Logs</h2>
          <p className="mt-1 mb-0 text-muted">Real-time system activity audit logs from NoSQL.</p>
        </div>
        <button onClick={fetchLogs} className="rounded border px-2.5 py-1 text-sm bg-surface-soft hover:bg-line">
          Refresh
        </button>
      </div>
      {error && <p className="text-danger">{error}</p>}
      {logs.length === 0 ? (
        <p className="text-muted text-sm italic">No logs available.</p>
      ) : (
        <div className="grid gap-2">
          {logs.map((log) => (
            <div key={log.id} className="p-2.5 rounded border border-line text-xs font-mono bg-surface-soft">
              <div className="flex justify-between text-muted mb-1">
                <span>{new Date(log.timestamp).toLocaleString()}</span>
                <span className="font-bold text-primary">{log.action}</span>
              </div>
              <p className="m-0"><strong>User:</strong> {log.userId} | {log.details}</p>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
