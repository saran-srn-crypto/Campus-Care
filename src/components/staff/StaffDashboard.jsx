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
    return state.tickets.filter(t => 
      t.assignedStaffId === profile.userId ||
      t.assignee === profile.userId ||
      t.assignedStaff === profile.name ||
      t.assignee === profile.name
    );
  }, [state.tickets, profile.userId, profile.name]);

  const stats = getStats(staffTickets);
  const selectedTicket = getSelectedTicket();

  const filteredTickets = React.useMemo(() => {
    return staffTickets.filter(t => {
      const tStatus = (t.status || '').toLowerCase().replace(/_/g, ' ').trim();
      const fStatus = (state.filters.staffStatus || '').toLowerCase().replace(/_/g, ' ').trim();
      const s = state.filters.staffStatus === 'All' || tStatus === fStatus;

      const tPriority = (t.priority || '').toLowerCase().trim();
      const fPriority = (state.filters.staffPriority || '').toLowerCase().trim();
      const p = state.filters.staffPriority === 'All' || tPriority === fPriority;

      const tCategory = (t.category || '').toLowerCase().trim();
      const fCategory = (state.filters.staffCategory || '').toLowerCase().trim();
      const c = state.filters.staffCategory === 'All' || tCategory === fCategory;

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
