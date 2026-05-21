import React from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useNotifications } from '../../hooks/useNotifications';
import Button from '../common/Button';

export default function ServiceRating({ ticket }) {
  const { updateTicket, addTimelineEntry } = useTickets();
  const { addNotification, showToast } = useNotifications();

  const handleRate = () => {
    updateTicket(ticket.id, { rating: 5, status: 'Closed' });
    addTimelineEntry(ticket.id, { title: 'Closed', date: 'Today', note: 'Student rated the service 5 out of 5.' });
    addNotification(`Ticket ${ticket.id} closed`, 'Student confirmed the resolution and rated the service.');
    showToast('Service rated and ticket closed.');
  };

  return <Button onClick={handleRate}>Rate Service</Button>;
}
