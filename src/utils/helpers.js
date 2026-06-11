import { ALLOWED_DOMAINS } from './constants';

export function escapeValue(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function statusClass(status = '') {
  const key = String(status).toLowerCase().replace(/\s+/g, '-');
  const map = {
    'open': 'bg-[#e8f1ff] text-[#175cd3]',
    'reopened': 'bg-[#e8f1ff] text-[#175cd3]',
    'assigned': 'bg-[#f0eaff] text-purple',
    'in-progress': 'bg-[#fff7d6] text-[#946200]',
    'resolved': 'bg-[#e4f8f2] text-[#087443]',
    'closed': 'bg-[#eef1f5] text-closed',
    'overdue': 'bg-[#fff0ee] text-danger',
    'unassigned': 'bg-surface-soft text-muted',
  };
  return map[key] || 'bg-surface-soft text-muted';
}

export function priorityClass(priority = '') {
  const key = String(priority).toLowerCase();
  const map = {
    'urgent': 'bg-[#fff0ee] text-danger',
    'high': 'bg-[#fff0ee] text-danger',
    'medium': 'bg-[#fff3dc] text-amber',
    'low': 'bg-[#edf7ed] text-[#28733d]',
  };
  return map[key] || 'bg-surface-soft text-muted';
}

export function isOfficialEmail(email) {
  const lower = email.toLowerCase();
  return ALLOWED_DOMAINS.some(d => lower.endsWith(d));
}

export function formatDate(value) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function sortTicketsByNewest(tickets) {
  return [...tickets].sort((a, b) => {
    const aDate = new Date(a.updatedAt || a.created || 0).getTime();
    const bDate = new Date(b.updatedAt || b.created || 0).getTime();
    return bDate - aDate;
  });
}

export function getStats(tickets) {
  return {
    total: tickets.length,
    open: tickets.filter(t => {
      const status = (t.status || '').toLowerCase().replace(/_/g, ' ').trim();
      return ['open', 'reopened', 'pending assignment'].includes(status);
    }).length,
    pending: tickets.filter(t => {
      const status = (t.status || '').toLowerCase().replace(/_/g, ' ').trim();
      return ['open', 'assigned', 'in progress', 'reopened', 'pending assignment'].includes(status);
    }).length,
    resolved: tickets.filter(t => {
      const status = (t.status || '').toLowerCase().replace(/_/g, ' ').trim();
      return status === 'resolved';
    }).length,
    closed: tickets.filter(t => {
      const status = (t.status || '').toLowerCase().replace(/_/g, ' ').trim();
      return status === 'closed';
    }).length,
    urgent: tickets.filter(t => {
      const priority = (t.priority || '').toLowerCase().trim();
      return priority === 'urgent';
    }).length,
  };
}
