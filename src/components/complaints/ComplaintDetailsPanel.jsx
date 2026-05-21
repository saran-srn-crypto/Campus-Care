import React from 'react';
import { Check, Clock3, FileImage, History, MessageSquareText, UserRound } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import Timeline from '../common/Timeline';
import { formatDate } from '../../utils/helpers';

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

export default function ComplaintDetailsPanel({ ticket }) {
  const activeIndex = statusIndex[ticket.status] ?? 0;
  const timeline = ticket.timeline || [];
  const comments = ticket.comments || [];
  const activityLogs = ticket.ticketActivityLogs || [];
  const statusHistory = ticket.statusHistory || [];
  const attachments = ticket.attachments || [];
  const assignedStaff = ticket.assignedStaff || ticket.assignee || 'Unassigned';

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
            <ul className="grid gap-2 p-0 m-0 list-none">
              {attachments.map(file => (
                <li key={file} className="min-h-[36px] rounded-lg bg-surface-soft px-3 py-2 text-sm font-bold text-[#344054]">{file}</li>
              ))}
            </ul>
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
      </section>

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
    </div>
  );
}
