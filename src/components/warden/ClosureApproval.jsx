import React from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useNotifications } from '../../hooks/useNotifications';
import Button from '../common/Button';

export default function ClosureApproval({ ticket }) {
  const { updateTicket, addTimelineEntry } = useTickets();
  const { addNotification, showToast } = useNotifications();

  const handleApprove = () => {
    if (ticket.status !== 'Resolved') { showToast('Only resolved tickets can be approved for closure.'); return; }
    updateTicket(ticket.id, { status: 'Closed' });
    addTimelineEntry(ticket.id, { title: 'Closure approved', date: 'Today', note: 'Hostel warden approved ticket closure.' });
    addNotification(`Ticket ${ticket.id} closed`, 'Hostel warden approved the closure.');
    showToast('Closure approved.');
  };

  return (
    <div className="grid gap-3 border-t border-line pt-3 mt-3">
      <h3 className="m-0 text-sm font-bold text-ink">Warden Closure Verification</h3>
      {ticket.proofImage && (
        <div className="grid gap-2">
          <span className="text-xs text-muted font-semibold">Proof of Completion:</span>
          <img src={ticket.proofImage} alt="Completion proof upload" className="rounded-lg max-h-48 object-cover border border-line bg-surface-soft shadow-sm" />
        </div>
      )}
      {ticket.resolutionNotes && (
        <div className="p-2.5 rounded bg-surface-soft border border-line text-sm grid gap-1">
          <strong className="block text-xs uppercase text-muted">Technician Notes:</strong>
          <span className="text-[#344054]">{ticket.resolutionNotes}</span>
        </div>
      )}
      {!ticket.proofImage && !ticket.resolutionNotes && (
        <span className="text-xs text-muted italic">Technician has not uploaded any completion details yet.</span>
      )}
      <div className="flex gap-2.5">
        <Button variant="secondary" onClick={handleApprove} disabled={ticket.status === 'Closed'}>
          {ticket.status === 'Closed' ? 'Closed & Approved' : 'Approve Closure'}
        </Button>
      </div>
    </div>
  );
}
