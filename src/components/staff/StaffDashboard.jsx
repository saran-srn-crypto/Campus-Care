import React from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useAuth } from '../../hooks/useAuth';
import { getStats } from '../../utils/helpers';
import AssignedTickets from './AssignedTickets';
import TicketDetails from '../tickets/TicketDetails';
import ResolutionNotes from './ResolutionNotes';
import EscalationPanel from './EscalationPanel';
import WorkloadStats from './WorkloadStats';
import StatsGrid from '../common/StatsGrid';


export default function StaffDashboard() {
  const { state, getSelectedTicket, setSelectedTicket, setFilters } = useTickets();
  const { getProfile } = useAuth();
  const profile = getProfile();
  const staffName = profile.name;

  const staffTickets = React.useMemo(() => {
    return state.tickets.filter(t => t.assignee === staffName);
  }, [state.tickets, staffName]);

  const stats = getStats(staffTickets);
  const selectedTicket = getSelectedTicket();

  const filteredTickets = React.useMemo(() => {
    return staffTickets.filter(t => {
      const s = state.filters.staffStatus === 'All' || t.status === state.filters.staffStatus;
      const p = state.filters.staffPriority === 'All' || t.priority === state.filters.staffPriority;
      const c = state.filters.staffCategory === 'All' || t.category === state.filters.staffCategory;
      return s && p && c;
    });
  }, [staffTickets, state.filters.staffStatus, state.filters.staffPriority, state.filters.staffCategory]);

  React.useEffect(() => {
    if (filteredTickets.length > 0 && state.selectedTicketId !== null) {
      const hasSelected = filteredTickets.some(t => t.id === state.selectedTicketId);
      if (!hasSelected) {
        setSelectedTicket(null);
      }
    }
  }, [filteredTickets, state.selectedTicketId, setSelectedTicket]);

  const staffActions = selectedTicket && (
    <>
      <ResolutionNotes ticket={selectedTicket} />
      <EscalationPanel ticket={selectedTicket} />
    </>
  );

  return (
    <>
<StatsGrid tickets={staffTickets} />
      <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.75fr] gap-5 items-start mt-5">
        <div className="grid gap-4">
          <AssignedTickets tickets={filteredTickets} filters={state.filters} categories={state.categories} onFilterChange={setFilters} selectedId={state.selectedTicketId} onSelect={setSelectedTicket} />
        </div>
        <div className="grid gap-4">
          <WorkloadStats tickets={staffTickets} />
          <TicketDetails ticket={selectedTicket} actions={staffActions} />
        </div>
      </section>
    </>
  );
}
