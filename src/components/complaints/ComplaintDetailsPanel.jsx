import React, { useState } from 'react';
import { Check, Clock3, FileImage, History, MessageSquareText, UserRound } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Timeline from '../common/Timeline';
import { formatDate } from '../../utils/helpers';
import { useTickets } from '../../hooks/useTickets';
import { useNotifications } from '../../hooks/useNotifications';
import ImageModal from '../common/ImageModal';

const progressSteps = ['Ticket Opened', 'Assigned', 'In Progress', 'Resolved', 'Closed'];
const statusIndex = {
  Open: 0,
  Assigned: 1,
  'In Progress': 2,
  Resolved: 3,
  Closed: 4,
};

function getActivityTime(items, label) {
  const normalized = label.toLowerCase().replace('ticket ', '');
  const match = (items || []).find(item => String(item.title || item.status || '').toLowerCase().includes(normalized));
  return match?.date || match?.createdAt || '';
}

export default function ComplaintDetailsPanel({ ticket, onUpdate }) {
  const { updateTicket, addComment } = useTickets();
  const { showToast } = useNotifications();
  const [previewImage, setPreviewImage] = useState(null);
  const [actionType, setActionType] = useState(null); // 'close' or 'reopen'
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [reopenReason, setReopenReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeIndex = statusIndex[ticket.status] ?? 0;
  const timeline = ticket.timeline || [];
  const comments = ticket.comments || [];
  const activityLogs = ticket.ticketActivityLogs || [];
  const statusHistory = ticket.statusHistory || [];
  const attachments = ticket.attachments || [];
  const assignedStaff = ticket.assignedStaff || ticket.assignee || 'Unassigned';

  const handleCloseTicket = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateTicket(ticket.id, {
        status: 'Closed',
        rating,
        resolutionNotes: feedback || 'Resolution confirmed.'
      });
      showToast('Complaint resolved and closed successfully.');
      setActionType(null);
      if (onUpdate) onUpdate();
    } catch (err) {
      showToast(err.message || 'Failed to close ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReopenTicket = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) return;
    setIsSubmitting(true);
    try {
      await updateTicket(ticket.id, {
        status: 'Reopened',
        notes: reopenReason
      });
      await addComment(ticket.id, `Reopened ticket. Reason: ${reopenReason}`);
      showToast('Complaint reopened successfully.');
      setActionType(null);
      setReopenReason('');
      if (onUpdate) onUpdate();
    } catch (err) {
      showToast(err.message || 'Failed to reopen ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 grid gap-5">
      <section className="grid gap-2">
        <h4 className="m-0 font-extrabold">Issue Description</h4>
        <p className="m-0 text-muted leading-relaxed">{ticket.description || 'No description provided.'}</p>
      </section>

      <section className="grid gap-3">
        <h4 className="m-0 font-extrabold">Timeline Tracking</h4>
        <ol className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-0 m-0 list-none">
          {progressSteps.map((step, index) => {
            const complete = index <= activeIndex;
            return (
              <li key={step} className="relative grid gap-2">
                <span className={[
                  'w-9 h-9 rounded-full grid place-items-center border text-sm font-extrabold',
                  complete ? 'bg-primary text-white border-primary' : 'bg-white text-muted border-line',
                ].join(' ')}>
                  {complete ? <Check size={16} /> : index + 1}
                </span>
                <span className="font-extrabold text-sm">{step}</span>
                <span className="text-xs text-muted">{formatDate(getActivityTime(timeline, step))}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <section className="grid gap-2">
          <h4 className="m-0 font-extrabold flex items-center gap-2"><FileImage size={17} /> Uploaded Files</h4>
          {attachments.length ? (
            <div className="flex flex-wrap gap-3">
              {attachments.map((file, idx) => {
                const isImage = file && (file.startsWith('data:image/') || /\.(png|jpe?g|gif|webp)$/i.test(file));
                return (
                  <div key={idx} className="p-1.5 rounded-lg bg-surface-soft border border-line">
                    {isImage ? (
                      <img
                        src={file}
                        alt={`Attachment ${idx + 1}`}
                        className="rounded-md max-h-24 max-w-[150px] object-cover border border-line shadow-sm hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
                        onClick={() => setPreviewImage(file)}
                      />
                    ) : (
                      <div className="flex flex-col gap-1 items-center justify-center w-28 h-20 bg-[#f8fafc] rounded-md border border-[#e2e8f0] text-[10px] font-bold text-muted text-center p-2 shadow-sm">
                        <div className="w-7 h-7 rounded-full bg-[#e2e8f0] text-[#475569] grid place-items-center mb-1 text-xs">
                          📁
                        </div>
                        <span className="truncate w-full text-[#475569]">{file}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="m-0 text-sm text-muted">No files attached.</p>
          )}
        </section>

        <section className="grid gap-2">
          <h4 className="m-0 font-extrabold flex items-center gap-2"><UserRound size={17} /> Assigned Staff Details</h4>
          <dl className="grid gap-2 m-0 text-sm">
            <div><dt className="font-extrabold text-[#344054]">Staff</dt><dd className="m-0 text-muted">{assignedStaff}</dd></div>
            <div><dt className="font-extrabold text-[#344054]">Department</dt><dd className="m-0 text-muted">{ticket.department || ticket.category}</dd></div>
            <div><dt className="font-extrabold text-[#344054]">Updated</dt><dd className="m-0 text-muted">{formatDate(ticket.updatedAt)}</dd></div>
          </dl>
        </section>
      </div>

      <section className="grid gap-2">
        <h4 className="m-0 font-extrabold">Resolution Notes</h4>
        <p className="m-0 text-muted">{ticket.resolutionNotes || 'Resolution notes will appear after staff updates the ticket.'}</p>
        {ticket.proofImage && (
          <div className="mt-2.5">
            <h5 className="m-0 mb-1.5 text-xs font-bold uppercase text-muted">Resolution Proof</h5>
            <div className="p-1.5 rounded-lg bg-surface-soft border border-line inline-block">
              <img
                src={ticket.proofImage}
                alt="Resolution Proof"
                className="rounded-md max-h-32 max-w-[200px] object-cover border border-line shadow-sm hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
                onClick={() => setPreviewImage(ticket.proofImage)}
              />
            </div>
          </div>
        )}
      </section>

      {ticket.status === 'Resolved' && (
        <section className="p-4 rounded-xl border border-[#b8c5d6] bg-surface-soft grid gap-3">
          <h4 className="m-0 font-extrabold text-[#175cd3] flex items-center gap-2">
            Feedback & Action Required
          </h4>
          <p className="m-0 text-sm text-muted">
            This ticket has been marked as resolved by staff. Please confirm if the issue is resolved or request a reopen.
          </p>

          {actionType === null ? (
            <div className="flex flex-wrap gap-3 mt-1">
              <button
                type="button"
                onClick={() => setActionType('close')}
                className="min-h-[38px] px-4 rounded-lg bg-primary text-white font-extrabold text-sm hover:bg-primary-dark transition-colors cursor-pointer"
              >
                Confirm Resolution & Close
              </button>
              <button
                type="button"
                onClick={() => setActionType('reopen')}
                className="min-h-[38px] px-4 rounded-lg border border-danger text-danger bg-white font-extrabold text-sm hover:bg-[#fff0ee] transition-colors cursor-pointer"
              >
                Reopen Ticket
              </button>
            </div>
          ) : actionType === 'close' ? (
            <form onSubmit={handleCloseTicket} className="grid gap-3 mt-1.5 animate-[fadeIn_200ms_ease-out]">
              <div className="grid gap-1">
                <label className="text-xs font-bold uppercase text-[#344054]">Rate the Service</label>
                <div className="flex gap-1.5 text-2xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-0 border-0 bg-transparent cursor-pointer transition-transform hover:scale-110"
                    >
                      {star <= rating ? '⭐' : '☆'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-1">
                <label htmlFor="feedbackInput" className="text-xs font-bold uppercase text-[#344054]">Feedback / Notes</label>
                <textarea
                  id="feedbackInput"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Write your feedback here (optional)..."
                  className="p-2.5 rounded-lg border border-line bg-white text-sm"
                  rows={2}
                />
              </div>

              <div className="flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="min-h-[36px] px-3.5 rounded-lg border border-line bg-white font-bold text-sm hover:bg-surface-soft cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[36px] px-4 rounded-lg bg-primary text-white font-extrabold text-sm hover:bg-primary-dark disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit & Close'}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleReopenTicket} className="grid gap-3 mt-1.5 animate-[fadeIn_200ms_ease-out]">
              <div className="grid gap-1">
                <label htmlFor="reopenInput" className="text-xs font-bold uppercase text-[#344054]">Reason for Reopening</label>
                <textarea
                  id="reopenInput"
                  required
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Explain why the issue is not resolved properly..."
                  className="p-2.5 rounded-lg border border-line bg-white text-sm"
                  rows={3}
                />
              </div>

              <div className="flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="min-h-[36px] px-3.5 rounded-lg border border-line bg-white font-bold text-sm hover:bg-surface-soft cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[36px] px-4 rounded-lg bg-danger text-white font-extrabold text-sm hover:bg-danger-dark disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Reopening...' : 'Reopen Ticket'}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      {ticket.status === 'Closed' && (
        <section className="p-4 rounded-xl border border-line bg-surface-soft grid gap-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h4 className="m-0 font-extrabold">Ticket Closed</h4>
              <p className="m-0 text-sm text-muted mt-0.5">
                This ticket was closed. If the issue has resurfaced or was not resolved properly, you can reopen it.
              </p>
            </div>
            {actionType !== 'reopen' && (
              <button
                type="button"
                onClick={() => setActionType('reopen')}
                className="min-h-[38px] px-4 rounded-lg border border-danger text-danger bg-white font-extrabold text-sm hover:bg-[#fff0ee] transition-colors cursor-pointer"
              >
                Reopen Ticket
              </button>
            )}
          </div>

          {actionType === 'reopen' && (
            <form onSubmit={handleReopenTicket} className="grid gap-3 mt-1.5 animate-[fadeIn_200ms_ease-out]">
              <div className="grid gap-1">
                <label htmlFor="reopenClosedInput" className="text-xs font-bold uppercase text-[#344054]">Reason for Reopening</label>
                <textarea
                  id="reopenClosedInput"
                  required
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="Explain why the issue needs to be reopened..."
                  className="p-2.5 rounded-lg border border-line bg-white text-sm"
                  rows={3}
                />
              </div>

              <div className="flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setActionType(null)}
                  className="min-h-[36px] px-3.5 rounded-lg border border-line bg-white font-bold text-sm hover:bg-surface-soft cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[36px] px-4 rounded-lg bg-danger text-white font-extrabold text-sm hover:bg-danger-dark disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Reopening...' : 'Reopen Ticket'}
                </button>
              </div>
            </form>
          )}
        </section>
      )}

      <section className="grid gap-2">
        <h4 className="m-0 font-extrabold flex items-center gap-2"><Clock3 size={17} /> Activity Timeline</h4>
        {timeline.length ? <Timeline items={timeline} /> : <p className="m-0 text-sm text-muted">No timeline entries yet.</p>}
      </section>

      <section className="grid gap-2">
        <h4 className="m-0 font-extrabold flex items-center gap-2"><MessageSquareText size={17} /> Ticket Comments</h4>
        {comments.length ? (
          <div className="grid gap-2">
            {comments.map((comment, index) => (
              <div key={comment.id || index} className="rounded-lg bg-surface-soft px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <strong>{comment.by}</strong>
                  <StatusBadge value={comment.role || 'Comment'} />
                </div>
                <p className="mt-1 mb-0 text-sm text-muted">{comment.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="m-0 text-sm text-muted">No comments yet.</p>
        )}
      </section>

      <section className="grid gap-2">
        <h4 className="m-0 font-extrabold flex items-center gap-2"><History size={17} /> Status Updates and Logs</h4>
        <div className="grid gap-2">
          {statusHistory.length ? statusHistory.map((entry, index) => (
            <div key={entry.id || index} className="flex flex-wrap justify-between gap-2 rounded-lg bg-surface-soft px-3 py-2 text-sm">
              <span className="font-bold">{entry.status}</span>
              <span className="text-muted">{entry.note}</span>
              <span className="text-muted">{formatDate(entry.createdAt)}</span>
            </div>
          )) : <span className="text-sm text-muted">No status history yet.</span>}

          {activityLogs.length ? activityLogs.map((entry, index) => (
            <div key={entry.id || index} className="flex flex-wrap justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm">
              <span className="font-bold">{entry.action}</span>
              <span className="text-muted">{entry.note}</span>
              <span className="text-muted">{formatDate(entry.createdAt)}</span>
            </div>
          )) : null}
        </div>
      </section>
      <ImageModal src={previewImage} onClose={() => setPreviewImage(null)} />
    </div>
  );
}
