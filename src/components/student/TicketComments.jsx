import React, { useState } from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useNotifications } from '../../hooks/useNotifications';
import Button from '../common/Button';

export default function TicketComments({ ticketId, ownerName }) {
  const [text, setText] = useState('');
  const { addComment } = useTickets();
  const { addNotification, showToast } = useNotifications();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    addComment(ticketId, { by: ownerName, role: 'Student', text: text.trim() });
    addNotification(`New comment on ${ticketId}`, text.trim());
    showToast('Comment posted.');
    setText('');
  };

  return (
    <form className="grid gap-3" onSubmit={handleSubmit}>
      <div className="grid gap-1.5">
        <label htmlFor="studentComment" className="text-[#344054] text-sm font-bold">Add comment</label>
        <textarea id="studentComment" placeholder="Add an update or reply to the assigned staff" value={text} onChange={e => setText(e.target.value)}
          className="w-full border border-[#cbd5e1] rounded-lg bg-white text-ink px-3 py-2.5 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)] min-h-28 resize-y" />
      </div>
      <div className="flex flex-wrap gap-2.5">
        <Button variant="secondary" type="submit">Post Comment</Button>
      </div>
    </form>
  );
}
