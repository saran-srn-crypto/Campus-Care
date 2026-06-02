import React, { useEffect } from 'react';
import StatusBadge from '../common/StatusBadge';
import Timeline from '../common/Timeline';
import { useTickets } from '../../hooks/useTickets';
import { X } from 'lucide-react';

export default function TicketDetails({ ticket, actions }) {
  const { setSelectedTicket } = useTickets();
  const isOpen = !!ticket;

  // Prevent background scroll when details drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleClose = () => {
    setSelectedTicket(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[999] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <section
        className={`fixed top-0 right-0 h-screen w-[min(550px,100vw)] bg-white shadow-[0_0_50px_rgba(0,0,0,0.2)] z-[1000] flex flex-col sliding-drawer border-l border-line ${
          isOpen ? 'translate-x-0 visible' : 'translate-x-full invisible pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-line flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <span className="text-sm font-extrabold text-primary bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
              {ticket?.id || 'CC-XXXX'}
            </span>
            <h2 className="m-0 text-base font-extrabold text-ink truncate max-w-[280px]">{ticket?.title || 'Issue Details'}</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg border border-line bg-white text-slate-500 hover:text-ink hover:bg-slate-50 transition-colors grid place-items-center cursor-pointer"
            aria-label="Close details"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-5 grid gap-5 align-content-start bg-slate-50/50">
          {ticket ? (
            <>
              {/* Category, Location, & Status info */}
              <div className="p-4 rounded-xl border border-line bg-white shadow-sm grid gap-3">
                <div className="flex flex-wrap gap-2 items-center">
                  <StatusBadge value={ticket.status} />
                  <StatusBadge type="priority" value={ticket.priority} />
                </div>
                <div className="text-sm text-slate-600 grid gap-1 mt-1">
                  <div><strong>Category:</strong> {ticket.category}</div>
                  <div><strong>Location:</strong> {ticket.location}</div>
                  <div><strong>Department:</strong> {ticket.department}</div>
                  <div><strong>Assigned To:</strong> {ticket.assignee || 'Not assigned'}</div>
                  {ticket.assignedStaff && <div><strong>Staff Name:</strong> {ticket.assignedStaff}</div>}
                  <div><strong>Created:</strong> {ticket.created}</div>
                  <div><strong>Due Date:</strong> {ticket.due || '—'}</div>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 rounded-xl border border-line bg-white shadow-sm grid gap-2">
                <h3 className="m-0 text-xs font-bold uppercase text-muted tracking-wider">Issue Description</h3>
                <p className="m-0 text-sm leading-relaxed text-slate-700">{ticket.description}</p>
              </div>

              {/* Attachments */}
              {ticket.attachments && ticket.attachments.length > 0 && (
                <div className="p-4 rounded-xl border border-line bg-white shadow-sm grid gap-3">
                  <h3 className="m-0 text-xs font-bold uppercase text-muted tracking-wider">Student Attachments</h3>
                  <div className="flex flex-wrap gap-3">
                    {ticket.attachments.map((att, idx) => {
                      const isBase64 = att && att.startsWith('data:');
                      return (
                        <div key={idx} className="p-1.5 rounded-lg bg-surface-soft border border-line">
                          {isBase64 ? (
                            <img src={att} alt={`Attachment ${idx + 1}`} className="rounded-md max-h-24 max-w-[150px] object-cover border border-line shadow-sm hover:scale-[1.02] transition-transform duration-200" />
                          ) : (
                            <div className="flex flex-col gap-1 items-center justify-center w-28 h-20 bg-[#f8fafc] rounded-md border border-[#e2e8f0] text-[10px] font-bold text-muted text-center p-2 shadow-sm">
                              <div className="w-7 h-7 rounded-full bg-[#e2e8f0] text-[#475569] grid place-items-center mb-1 text-xs">
                                📁
                              </div>
                              <span className="truncate w-full text-[#475569]">{att}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="p-4 rounded-xl border border-line bg-white shadow-sm grid gap-2">
                <h3 className="m-0 text-xs font-bold uppercase text-muted tracking-wider">Timeline</h3>
                <Timeline items={ticket.timeline} />
              </div>

              {/* Comments */}
              <div className="p-4 rounded-xl border border-line bg-white shadow-sm grid gap-3">
                <h3 className="m-0 text-xs font-bold uppercase text-muted tracking-wider">Comments</h3>
                <div className="grid gap-2.5">
                  {ticket.comments.length ? (
                    ticket.comments.map((c, i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-50 border border-line shadow-sm">
                        <div className="flex justify-between items-center text-xs">
                          <strong className="text-ink">{c.by}</strong>
                          <span className="text-muted font-semibold capitalize">{c.role}</span>
                        </div>
                        <p className="mt-2 mb-0 text-sm text-slate-700 leading-normal">{c.text}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-400 border border-dashed border-[#e2e8f0] rounded-lg">
                      No comments yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Action Panels (Staff Assign / Closure Approval / Resolution Notes) */}
              {actions && (
                <div className="p-4 rounded-xl border border-line bg-white shadow-sm grid gap-2.5">
                  <h3 className="m-0 text-xs font-bold uppercase text-muted tracking-wider">Action Controls</h3>
                  <div className="mt-1">{actions}</div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center text-muted border border-dashed border-[#cbd5e1] rounded-lg">
              Select a ticket from the dashboard list.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
