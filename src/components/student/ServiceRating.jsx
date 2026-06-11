import React from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useNotifications } from '../../hooks/useNotifications';
import Button from '../common/Button';

export default function ServiceRating({ ticket }) {
  const { updateTicket, addTimelineEntry } = useTickets();
  const { addNotification, showToast } = useNotifications();

  const handleRate = async () => {
    try {
      await updateTicket(ticket.id, { rating: 5, status: 'Closed' });
      await addNotification(`Ticket ${ticket.id} closed`, 'Student confirmed the resolution and rated the service.');
      showToast('Service rated and ticket closed.');
    } catch (err) {
      showToast(err.message || 'Failed to rate and close ticket.');
    }
  };

  return <Button onClick={handleRate}>Rate Service</Button>;
}
