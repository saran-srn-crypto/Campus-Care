import React, { useState } from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useNotifications } from '../../hooks/useNotifications';
import Button from '../common/Button';

export default function StaffAssignment({ ticket }) {
  const { state, updateTicket, addComment, addTimelineEntry } = useTickets();
  const { addNotification, showToast } = useNotifications();
  const [staff, setStaff] = useState(ticket.assignee || state.staffMembers[0]);
  const [remark, setRemark] = useState('');
  const inputCls = 'w-full border border-[#cbd5e1] rounded-lg bg-white text-ink px-3 py-2.5 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)]';

  const handleSubmit = (e) => {
    e.preventDefault();
    const note = remark.trim() || 'Assigned by hostel warden.';
    updateTicket(ticket.id, { assignee: staff, status: 'Assigned' });
    addTimelineEntry(ticket.id, { title: 'Ticket assigned', date: 'Today', note });
    addComment(ticket.id, { by: 'Ravi Iyer', role: 'Hostel Warden', text: note });
    addNotification(`Ticket ${ticket.id} assigned`, `${staff} has been assigned by the hostel warden.`);
    showToast('Hostel ticket assigned.');
    setRemark('');
  };

  return (
    <form className="grid grid-cols-2 gap-3.5" onSubmit={handleSubmit}>
      <div className="grid gap-1.5">
        <label htmlFor="assignStaff" className="text-[#344054] text-sm font-bold">Assign maintenance staff</label>
        <select id="assignStaff" value={staff} onChange={e => setStaff(e.target.value)} className={inputCls}>
          {state.staffMembers.map(n => <option key={n}>{n}</option>)}
        </select>
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="wardenRemark" className="text-[#344054] text-sm font-bold">Warden remark</label>
        <input id="wardenRemark" placeholder="Add a short instruction" value={remark} onChange={e => setRemark(e.target.value)} className={inputCls} />
      </div>
      <div className="col-span-full flex flex-wrap gap-2.5"><Button type="submit">Assign Ticket</Button></div>
    </form>
  );
}
