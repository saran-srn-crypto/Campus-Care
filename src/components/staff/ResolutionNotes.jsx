import React, { useState, useEffect } from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useNotifications } from '../../hooks/useNotifications';
import Button from '../common/Button';

export default function ResolutionNotes({ ticket }) {
  const [status, setStatus] = useState(ticket.status);
  const [note, setNote] = useState('');
  const [proofImage, setProofImage] = useState(ticket.proofImage || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { updateTicket, addComment, addTimelineEntry } = useTickets();
  const { addNotification, showToast } = useNotifications();
  const inputCls = 'w-full border border-[#cbd5e1] rounded-lg bg-white text-ink px-3 py-2.5 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)]';

  useEffect(() => {
    if (ticket) {
      setStatus(ticket.status);
      setNote('');
      setProofImage(ticket.proofImage || '');
    }
  }, [ticket?.id]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result);
        showToast('Proof of completion file loaded.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const resolNote = note.trim() || `Ticket status updated to ${status}.`;
    
    try {
      // Sequential execution prevents Hibernate transaction collisions and React state update races
      await updateTicket(ticket.id, { status, proofImage, resolutionNotes: resolNote });
      await addComment(ticket.id, { by: ticket.assignee || 'Staff', role: 'Staff', text: resolNote });
      await addTimelineEntry(ticket.id, { title: status, date: 'Today', note: resolNote });
      addNotification(`Ticket ${ticket.id} updated`, `${ticket.title} is now ${status}.`);
      showToast('Ticket update saved.');
      setNote('');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to save ticket update.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3.5">
        <div className="grid gap-1.5">
          <label htmlFor="staffStatus" className="text-[#344054] text-sm font-bold">Update status</label>
          <select id="staffStatus" value={status} onChange={e => setStatus(e.target.value)} className={inputCls} disabled={isSubmitting}>
            {['Assigned', 'In Progress', 'Resolved'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="grid gap-1.5">
          <label className="text-[#344054] text-sm font-bold">Proof of completion</label>
          <div className="flex flex-col gap-1.5">
            <input id="proofUpload" type="file" accept="image/*" onChange={handleFileChange} className={inputCls} disabled={isSubmitting} />
          </div>
        </div>
        <div className="col-span-full grid gap-1.5">
          <label htmlFor="resolutionNote" className="text-[#344054] text-sm font-bold">Resolution notes</label>
          <textarea id="resolutionNote" placeholder="Describe the action taken" value={note} onChange={e => setNote(e.target.value)} className={`${inputCls} min-h-28 resize-y`} disabled={isSubmitting} />
        </div>
      </div>
      
      {proofImage && (
        <div className="p-3 border border-line rounded-lg bg-surface-soft grid gap-2">
          <span className="text-xs text-muted font-bold">Proof Preview:</span>
          <img src={proofImage} alt="Proof preview" className="rounded-lg max-h-40 object-cover border border-line" />
        </div>
      )}

      <div className="flex flex-wrap gap-2.5">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Update'}
        </Button>
      </div>
    </form>
  );
}
