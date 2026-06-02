import React, { useState, useEffect } from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useNotifications } from '../../hooks/useNotifications';
import Button from '../common/Button';

export default function StaffAssignment({ ticket }) {
  const { state, updateTicket, addComment, addTimelineEntry } = useTickets();
  const { addNotification, showToast } = useNotifications();
  const [staff, setStaff] = useState(ticket?.assignee || state.staffMembers[0] || '');
  const [priority, setPriority] = useState(ticket?.priority || 'Low');
  const [remark, setRemark] = useState('');
  const [prevTicketId, setPrevTicketId] = useState(null);
  const inputCls = 'w-full border border-[#cbd5e1] rounded-lg bg-white text-ink px-3 py-2.5 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)]';

  useEffect(() => {
    if (ticket) {
      if (ticket.id !== prevTicketId) {
        setStaff(ticket.assignee || state.staffMembers[0] || '');
        setPriority(ticket.priority || 'Low');
        setRemark('');
        setPrevTicketId(ticket.id);
      } else if (!staff && state.staffMembers.length > 0) {
        setStaff(ticket.assignee || state.staffMembers[0] || '');
      }
    }
  }, [ticket, prevTicketId, state.staffMembers, staff]);

  if (!ticket || ticket.status === 'Resolved' || ticket.status === 'Closed') {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!staff) {
      showToast('Please select a staff member to assign.');
      return;
    }
    const note = remark.trim() || 'Assigned by hostel warden.';
    updateTicket(ticket.id, { assignee: staff, status: 'Assigned', priority });
    addTimelineEntry(ticket.id, { title: 'Ticket assigned & prioritized', date: 'Today', note: `${note} (Priority set to: ${priority})` });
    addComment(ticket.id, { by: 'Ravi Iyer', role: 'Hostel Warden', text: `${note} [Priority: ${priority}]` });
    addNotification(`Ticket ${ticket.id} assigned`, `${staff} has been assigned by the hostel warden with ${priority} priority.`);
    showToast('Hostel ticket assigned.');
    setRemark('');
  };

  return (
    <form className="grid grid-cols-1 md:grid-cols-3 gap-3.5" onSubmit={handleSubmit}>
      <div className="grid gap-1.5">
        <label htmlFor="assignStaff" className="text-[#344054] text-sm font-bold">Assign maintenance staff</label>
        <select id="assignStaff" value={staff} onChange={e => setStaff(e.target.value)} className={inputCls} required>
          {state.staffMembers.length === 0 ? (
            <option value="" disabled>No staff available</option>
          ) : (
            <>
              <option value="" disabled>Select staff member</option>
              {state.staffMembers.map(n => <option key={n} value={n}>{n}</option>)}
            </>
          )}
        </select>
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="assignPriority" className="text-[#344054] text-sm font-bold">Set issue priority</label>
        <select id="assignPriority" value={priority} onChange={e => setPriority(e.target.value)} className={inputCls} required>
          {['Low', 'Medium', 'High', 'Urgent'].map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="wardenRemark" className="text-[#344054] text-sm font-bold">Warden remark</label>
        <input id="wardenRemark" placeholder="Add a short instruction" value={remark} onChange={e => setRemark(e.target.value)} className={inputCls} />
      </div>
      <div className="col-span-full flex flex-wrap gap-2.5">
        <Button type="submit" disabled={!staff || state.staffMembers.length === 0}>Assign &amp; Prioritize Ticket</Button>
      </div>
    </form>
  );
}
