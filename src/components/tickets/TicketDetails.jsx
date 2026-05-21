import React from 'react';
import StatusBadge from '../common/StatusBadge';
import Timeline from '../common/Timeline';

export default function TicketDetails({ ticket, actions }) {
  if (!ticket) return <article className="p-5.5 text-center text-muted border border-line rounded-lg bg-white">Select a ticket to view details.</article>;

  return (
    <article className="p-4.5 border border-line rounded-lg bg-white shadow-card grid gap-4">
      <div className="flex justify-between items-start gap-3">
        <div>
          <h2 className="m-0 text-lg font-bold">{ticket.title}</h2>
          <p className="mt-1 mb-0 text-muted">{ticket.id} — {ticket.category} — {ticket.location}</p>
        </div>
        <StatusBadge value={ticket.status} />
      </div>

      <p className="m-0">{ticket.description}</p>

      <div className="flex flex-wrap gap-2 items-center">
        <StatusBadge type="priority" value={ticket.priority} />
        <StatusBadge value={`Assigned to ${ticket.assignee || 'Not assigned'}`} />
        <StatusBadge value={ticket.department} />
      </div>

      {/* Student Uploaded Attachments */}
      {ticket.attachments && ticket.attachments.length > 0 && (
        <section className="border-t border-line pt-4 mt-2">
          <h3 className="m-0 mb-2.5 font-bold text-ink text-sm uppercase tracking-wider text-muted">Student Attachments</h3>
          <div className="flex flex-wrap gap-3">
            {ticket.attachments.map((att, idx) => {
              const isBase64 = att && att.startsWith('data:');
              return (
                <div key={idx} className="p-2 rounded-xl bg-surface-soft border border-line">
                  {isBase64 ? (
                    <img src={att} alt={`Attachment ${idx + 1}`} className="rounded-lg max-h-36 max-w-[200px] object-cover border border-line shadow-sm hover:scale-[1.02] transition-transform duration-200" />
                  ) : (
                    <div className="flex flex-col gap-1.5 items-center justify-center w-36 h-28 bg-[#f8fafc] rounded-lg border border-[#e2e8f0] text-xs font-bold text-muted text-center p-3 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-[#e2e8f0] text-[#475569] grid place-items-center mb-1">
                        📁
                      </div>
                      <span className="truncate w-full text-[#475569]">{att}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h3 className="m-0 mb-2 font-bold">Timeline</h3>
        <Timeline items={ticket.timeline} />
      </section>

      <section>
        <h3 className="m-0 mb-2 font-bold">Comments</h3>
        <div className="grid gap-2.5">
          {ticket.comments.length ? ticket.comments.map((c, i) => (
            <div key={i} className="p-3 rounded-lg bg-surface-soft">
              <strong className="block">{c.by}</strong>
              <span className="block text-muted text-sm">{c.role}</span>
              <p className="mt-1.5 mb-0">{c.text}</p>
            </div>
          )) : <div className="p-5.5 text-center text-muted border border-line rounded-lg bg-white">No comments yet.</div>}
        </div>
      </section>

      {actions}
    </article>
  );
}
