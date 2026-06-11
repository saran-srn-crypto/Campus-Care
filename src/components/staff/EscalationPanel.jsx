import React from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useNotifications } from '../../hooks/useNotifications';
import Button from '../common/Button';

export default function EscalationPanel({ ticket }) {
  const { updateTicket, addTimelineEntry } = useTickets();
  const { addNotification, showToast } = useNotifications();

  const handleEscalate = async () => {
    try {
      await updateTicket(ticket.id, { priority: 'Urgent' });
      await addNotification(`Ticket ${ticket.id} escalated`, 'An unresolved issue needs admin attention.');
      showToast('Ticket escalated.');
    } catch (err) {
      showToast(err.message || 'Failed to escalate ticket.');
    }
  };

  return <Button variant="danger" onClick={handleEscalate}>Escalate</Button>;
}
