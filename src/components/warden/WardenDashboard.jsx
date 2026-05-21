import React from 'react';
import { useTickets } from '../../hooks/useTickets';
import { getStats } from '../../utils/helpers';
import HostelTickets from './HostelTickets';
import StaffAssignment from './StaffAssignment';
import ClosureApproval from './ClosureApproval';
import TicketDetails from '../tickets/TicketDetails';
import StatsGrid from '../common/StatsGrid';


export default function WardenDashboard() {
  const { state, getSelectedTicket, setSelectedTicket } = useTickets();
  const allTickets = state.tickets;
  const stats = getStats(allTickets);
  const selectedTicket = getSelectedTicket();

  const wardenActions = selectedTicket && (
    <>
      <StaffAssignment ticket={selectedTicket} />
      <ClosureApproval ticket={selectedTicket} />
    </>
  );

  return (
    <>
      <StatsGrid stats={stats} />
      <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.75fr] gap-5 items-start mt-5">
        <HostelTickets tickets={allTickets} selectedId={state.selectedTicketId} onSelect={setSelectedTicket} />
        <div className="grid gap-4">
          <TicketDetails ticket={selectedTicket} actions={wardenActions} />
        </div>
      </section>
    </>
  );
}
