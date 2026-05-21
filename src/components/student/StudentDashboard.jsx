import React from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useAuth } from '../../hooks/useAuth';
import { getStats, sortTicketsByNewest } from '../../utils/helpers';
import CreateTicketForm from './CreateTicketForm';
import RecentComplaintsWidget from './RecentComplaintsWidget';
import StatsGrid from '../common/StatsGrid';

function isOwnedTicket(ticket, profile) {
  const identifiers = [profile.userId, profile.name].filter(Boolean);
  return identifiers.includes(ticket.owner);
}

export default function StudentDashboard() {
  const { state } = useTickets();
  const { getProfile } = useAuth();
  const profile = getProfile();
  const ownedTickets = sortTicketsByNewest(state.tickets.filter(t => isOwnedTicket(t, profile)));
  const stats = getStats(ownedTickets);

  return (
    <div className="grid gap-5">
      <StatsGrid stats={stats} basePath="/student/complaints" />

      <section id="raise-complaint" className="grid gap-4">
        <CreateTicketForm ownerName={profile.userId || profile.name} />
      </section>

      <RecentComplaintsWidget tickets={ownedTickets} />
    </div>
  );
}
