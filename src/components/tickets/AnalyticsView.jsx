import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import { useAuth } from '../../hooks/useAuth';
import { getStats } from '../../utils/helpers';
import StatsGrid from '../common/StatsGrid';
import { ArrowLeft, TrendingUp, PieChart, BarChart3, Activity } from 'lucide-react';

export default function AnalyticsView() {
  const { state } = useTickets();
  const { role, getProfile } = useAuth();
  const navigate = useNavigate();
  const profile = getProfile();

  // Derive tickets for the current role
  const roleTickets = useMemo(() => {
    if (role === 'student') return state.tickets.filter(t => t.owner === profile.name || t.owner === profile.userId);
    return state.tickets;
  }, [state.tickets, role, profile.name, profile.userId]);

  const stats = getStats(roleTickets);

  // Category breakdown
  const categoryCounts = useMemo(() => {
    const counts = {};
    roleTickets.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [roleTickets]);
  const maxCatCount = Math.max(...categoryCounts.map(c => c[1]), 1);

  // Status breakdown
  const statusCounts = useMemo(() => {
    const counts = {};
    roleTickets.forEach(t => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [roleTickets]);

  // Priority breakdown
  const priorityCounts = useMemo(() => {
    const counts = {};
    roleTickets.forEach(t => { counts[t.priority] = (counts[t.priority] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [roleTickets]);

  // Assignee workload
  const assigneeCounts = useMemo(() => {
    const counts = {};
    roleTickets.filter(t => t.assignee).forEach(t => { counts[t.assignee] = (counts[t.assignee] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [roleTickets]);
  const maxAssigneeCount = Math.max(...assigneeCounts.map(c => c[1]), 1);

  // Resolution rate
  const resolutionRate = stats.total > 0 ? Math.round(((stats.resolved + (stats.closed || 0)) / stats.total) * 100) : 0;

  const statusColors = {
    'Open': '#1f57c3',
    'Assigned': '#7c3aed',
    'In Progress': '#b98900',
    'Resolved': '#0d9668',
    'Closed': '#6b7280',
    'Overdue': '#d9534f',
  };

  const priorityColors = {
    'Urgent': '#d9534f',
    'High': '#b98900',
    'Medium': '#1f57c3',
    'Low': '#28733d',
  };

  return (
    <>
      <StatsGrid stats={stats} />

      <section className="mt-5 grid gap-5">
        {/* Top row */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(`/dashboard/${role}`)}
            className="w-9 h-9 rounded-lg border border-line bg-white grid place-items-center hover:bg-surface-soft transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="m-0">Analytics & Insights</h2>
            <p className="mt-0.5 mb-0 text-muted text-sm">Visualize complaint data, trends, and workload distribution.</p>
          </div>
        </div>

        {/* KPI cards row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <article className="p-4.5 border border-line rounded-lg bg-white shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-lg grid place-items-center bg-[#e4f8f2] text-[#0d9668]"><TrendingUp size={16} /></span>
              <span className="text-muted text-sm">Resolution Rate</span>
            </div>
            <strong className="block text-3xl">{resolutionRate}%</strong>
            <div className="mt-2 h-2 rounded-full bg-[#e6ebf2] overflow-hidden">
              <div className="h-full rounded-full bg-teal transition-all duration-700" style={{ width: `${resolutionRate}%` }} />
            </div>
          </article>
          <article className="p-4.5 border border-line rounded-lg bg-white shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-lg grid place-items-center bg-[#e9f0ff] text-[#1f57c3]"><Activity size={16} /></span>
              <span className="text-muted text-sm">Active Tickets</span>
            </div>
            <strong className="block text-3xl">{stats.pending}</strong>
            <span className="block mt-1 text-xs text-muted">Requiring attention</span>
          </article>
          <article className="p-4.5 border border-line rounded-lg bg-white shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-lg grid place-items-center bg-[#eeeafd] text-[#7c3aed]"><PieChart size={16} /></span>
              <span className="text-muted text-sm">Categories</span>
            </div>
            <strong className="block text-3xl">{categoryCounts.length}</strong>
            <span className="block mt-1 text-xs text-muted">Distinct categories</span>
          </article>
          <article className="p-4.5 border border-line rounded-lg bg-white shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-8 rounded-lg grid place-items-center bg-[#fff0ee] text-[#d9534f]"><BarChart3 size={16} /></span>
              <span className="text-muted text-sm">Avg per Category</span>
            </div>
            <strong className="block text-3xl">{categoryCounts.length > 0 ? (roleTickets.length / categoryCounts.length).toFixed(1) : '0'}</strong>
            <span className="block mt-1 text-xs text-muted">Tickets per category</span>
          </article>
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {/* Category breakdown */}
          <article className="p-4.5 border border-line rounded-lg bg-white shadow-card grid gap-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" />
              <h3 className="m-0">Tickets by Category</h3>
            </div>
            <div className="grid gap-3">
              {categoryCounts.map(([cat, count]) => (
                <div key={cat} className="grid grid-cols-[140px_minmax(0,1fr)_44px] gap-2.5 items-center">
                  <strong className="text-sm truncate">{cat}</strong>
                  <div className="h-4 rounded-full bg-[#e6ebf2] overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${(count / maxCatCount) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-right">{count}</span>
                </div>
              ))}
              {categoryCounts.length === 0 && <p className="text-muted text-center py-4">No data available.</p>}
            </div>
          </article>

          {/* Status breakdown */}
          <article className="p-4.5 border border-line rounded-lg bg-white shadow-card grid gap-4">
            <div className="flex items-center gap-2">
              <PieChart size={18} className="text-primary" />
              <h3 className="m-0">Tickets by Status</h3>
            </div>
            <div className="grid gap-3">
              {statusCounts.map(([status, count]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: statusColors[status] || '#6b7280' }} />
                  <span className="text-sm flex-grow">{status}</span>
                  <strong className="text-sm">{count}</strong>
                  <span className="text-xs text-muted w-10 text-right">{stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%</span>
                </div>
              ))}
              {statusCounts.length === 0 && <p className="text-muted text-center py-4">No data available.</p>}
            </div>
            {/* Visual pie approximation */}
            <div className="flex gap-1 h-6 rounded-full overflow-hidden">
              {statusCounts.map(([status, count]) => (
                <div
                  key={status}
                  className="transition-all duration-500"
                  style={{
                    width: `${(count / stats.total) * 100}%`,
                    backgroundColor: statusColors[status] || '#6b7280',
                    minWidth: count > 0 ? '8px' : '0'
                  }}
                  title={`${status}: ${count}`}
                />
              ))}
            </div>
          </article>

          {/* Priority breakdown */}
          <article className="p-4.5 border border-line rounded-lg bg-white shadow-card grid gap-4">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-primary" />
              <h3 className="m-0">Tickets by Priority</h3>
            </div>
            <div className="grid gap-3">
              {priorityCounts.map(([priority, count]) => (
                <div key={priority} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: priorityColors[priority] || '#6b7280' }} />
                  <span className="text-sm flex-grow">{priority}</span>
                  <strong className="text-sm">{count}</strong>
                  <span className="text-xs text-muted w-10 text-right">{stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%</span>
                </div>
              ))}
              {priorityCounts.length === 0 && <p className="text-muted text-center py-4">No data available.</p>}
            </div>
            <div className="flex gap-1 h-6 rounded-full overflow-hidden">
              {priorityCounts.map(([priority, count]) => (
                <div
                  key={priority}
                  className="transition-all duration-500"
                  style={{
                    width: `${(count / stats.total) * 100}%`,
                    backgroundColor: priorityColors[priority] || '#6b7280',
                    minWidth: count > 0 ? '8px' : '0'
                  }}
                  title={`${priority}: ${count}`}
                />
              ))}
            </div>
          </article>

          {/* Assignee workload */}
          <article className="p-4.5 border border-line rounded-lg bg-white shadow-card grid gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              <h3 className="m-0">Staff Workload</h3>
            </div>
            <div className="grid gap-3">
              {assigneeCounts.map(([name, count]) => (
                <div key={name} className="grid grid-cols-[140px_minmax(0,1fr)_44px] gap-2.5 items-center">
                  <strong className="text-sm truncate">{name}</strong>
                  <div className="h-4 rounded-full bg-[#e6ebf2] overflow-hidden">
                    <div className="h-full rounded-full bg-teal transition-all duration-500" style={{ width: `${(count / maxAssigneeCount) * 100}%` }} />
                  </div>
                  <span className="text-sm font-semibold text-right">{count}</span>
                </div>
              ))}
              {assigneeCounts.length === 0 && <p className="text-muted text-center py-4">No staff assignments yet.</p>}
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
