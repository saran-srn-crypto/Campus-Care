import React from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useNotifications } from '../../hooks/useNotifications';
import Button from '../common/Button';

export default function EscalationPanel({ ticket }) {
  const { updateTicket, addTimelineEntry } = useTickets();
  const { addNotification, showToast } = useNotifications();

  const handleEscalate = () => {
    updateTicket(ticket.id, { priority: 'Urgent' });
    addTimelineEntry(ticket.id, { title: 'Escalated', date: 'Today', note: 'Ticket escalated for administrative review.' });
    addNotification(`Ticket ${ticket.id} escalated`, 'An unresolved issue needs admin attention.');
    showToast('Ticket escalated.');
  };

  return <Button variant="danger" onClick={handleEscalate}>Escalate</Button>;
}
