import React from 'react';
import StatusBadge from '../common/StatusBadge';

export default function TicketStatus({ status }) {
  return <StatusBadge value={status} />;
}
