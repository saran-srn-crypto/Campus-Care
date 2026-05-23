import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import StatCard from './StatCard';
import { Ticket, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { getStats } from '../../utils/helpers';

const cardConfig = [
  {
    key: 'total',
    label: 'Total Tickets',
    icon: Ticket,
    color: '#1f57c3',
    bgColor: '#e9f0ff',
    borderColor: '#c0d4f5',
    filterKey: 'all',
  },
  {
    key: 'pending',
    label: 'Pending Tickets',
    icon: Clock,
    color: '#b98900',
    bgColor: '#fff3dc',
    borderColor: '#f5e2a0',
    filterKey: 'pending',
  },
  {
    key: 'resolved',
    label: 'Resolved Tickets',
    icon: CheckCircle,
    color: '#0d9668',
    bgColor: '#e4f8f2',
    borderColor: '#a3e0cc',
    filterKey: 'resolved',
  },
  {
    key: 'urgent',
    label: 'Urgent Tickets',
    icon: AlertTriangle,
    color: '#d9534f',
    bgColor: '#fff0ee',
    borderColor: '#f5b8b4',
    filterKey: 'urgent',
  },
];

export default function StatsGrid({ stats, tickets }) {
  const { role } = useAuth();
  const baseRoute = role === 'student' ? '/student/tickets' : '/dashboard/tickets';

  // If tickets are provided, compute stats on the fly
  const derivedStats = tickets ? getStats(tickets) : {};
  const data = stats || derivedStats;

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Ticket statistics">
      {cardConfig.map(c => (
        <StatCard
          key={c.key}
          label={c.label}
          count={data[c.key]}
          icon={c.icon}
          color={c.color}
          bgColor={c.bgColor}
          borderColor={c.borderColor}
          navigateTo={`${baseRoute}/${c.filterKey}`}
        />
      ))}
    </section>
  );
}
