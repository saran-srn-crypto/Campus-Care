import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../../hooks/useTickets';
import { getStats } from '../../utils/helpers';
import UserManagement from './UserManagement';
import CategoryManagement from './CategoryManagement';
import AuditLogs from './AuditLogs';
import Reports from './Reports';
import StatsGrid from '../common/StatsGrid';
import StatusBadge from '../common/StatusBadge';
import Timeline from '../common/Timeline';
import {
  ShieldCheck, ArrowRight, Ticket, ChevronDown, ChevronUp,
  Eye, MapPin, User, Calendar, Clock, FileText, ImagePlus,
} from 'lucide-react';

export default function AdminDashboard() {
  const { state } = useTickets();
  const navigate = useNavigate();
  const stats = getStats(state.tickets);
  const tickets = state.tickets || [];

  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const expandedTicket = expandedId ? tickets.find(t => t.id === expandedId) : null;

  return (
    <>
      <StatsGrid stats={stats} />

      {/* Admin Controls CTA banner */}
      <div className="mt-5 p-5 rounded-xl border border-[#c7d2fe] bg-gradient-to-r from-[#eef2ff] to-[#f5f3ff] flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1f57c3] to-[#6366f1] text-white grid place-items-center shadow-md flex-shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <strong className="block text-ink">Administrative Controls</strong>
            <span className="text-muted text-sm">Assign staff, update resolution, approve closure &amp; manage full ticket lifecycle</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard/admin/controls')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#1f57c3] to-[#6366f1] text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex-shrink-0"
        >
          Open Controls
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Complaints Table with expandable details */}
      <section className="mt-5 border border-line rounded-xl bg-white shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-line bg-surface-soft flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Ticket size={18} className="text-primary" />
            <h3 className="m-0 text-base font-bold text-ink">All Complaints</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{tickets.length}</span>
          </div>
        </div>

        <div className="max-h-[480px] overflow-y-auto">
          {tickets.length === 0 && (
            <div className="p-8 text-center text-muted text-sm">No complaints found.</div>
          )}
          {tickets.map(t => {
            const isExpanded = expandedId === t.id;
            return (
              <div key={t.id} className="border-b border-line last:border-b-0">
                {/* Row */}
                <button
                  onClick={() => toggleExpand(t.id)}
                  className={[
                    'w-full text-left px-5 py-3.5 flex items-center gap-4 transition-colors',
                    isExpanded ? 'bg-[#f0f4ff]' : 'hover:bg-surface-soft',
                  ].join(' ')}
                >
                  <div className="flex-shrink-0">
                    {isExpanded ? <ChevronUp size={16} className="text-primary" /> : <ChevronDown size={16} className="text-muted" />}
                  </div>
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-2">
                      <strong className="text-sm truncate">{t.title}</strong>
                      <span className="text-xs text-muted font-mono flex-shrink-0">{t.id}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted">
                      <span className="flex items-center gap-1"><User size={11} /> {t.owner}</span>
                      <span className="flex items-center gap-1"><MapPin size={11} /> {t.location}</span>
                      <span className="flex items-center gap-1"><Calendar size={11} /> {t.created}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge value={t.status} />
                    <StatusBadge type="priority" value={t.priority} />
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && expandedTicket && (
                  <div className="px-5 pb-5 pt-1 bg-[#f8faff] border-t border-[#e2e8f0] animate-[fadeIn_0.2s_ease-out]">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-start">
                      {/* Detail content */}
                      <div className="grid gap-4">
                        {/* Description */}
                        <div>
                          <h4 className="m-0 mb-1 text-xs font-bold uppercase text-muted flex items-center gap-1.5"><FileText size={12} /> Description</h4>
                          <p className="m-0 text-sm leading-relaxed">{expandedTicket.description}</p>
                        </div>

                        {/* Info chips */}
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge value={expandedTicket.category} />
                          <StatusBadge value={expandedTicket.department} />
                          <StatusBadge value={`Assigned: ${expandedTicket.assignee || 'Not assigned'}`} />
                        </div>

                        {/* Student Attachments */}
                        {expandedTicket.attachments && expandedTicket.attachments.length > 0 && (
                          <div>
                            <h4 className="m-0 mb-2 text-xs font-bold uppercase text-muted flex items-center gap-1.5"><ImagePlus size={12} /> Student Attachments</h4>
                            <div className="flex flex-wrap gap-2.5">
                              {expandedTicket.attachments.map((att, idx) => {
                                const isBase64 = att && att.startsWith('data:');
                                return (
                                  <div key={idx} className="p-1.5 rounded-lg bg-white border border-line">
                                    {isBase64 ? (
                                      <img src={att} alt={`Attachment ${idx + 1}`} className="rounded max-h-28 max-w-[160px] object-cover" />
                                    ) : (
                                      <div className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted font-bold">📁 {att}</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Timeline summary */}
                        {expandedTicket.timeline && expandedTicket.timeline.length > 0 && (
                          <div>
                            <h4 className="m-0 mb-2 text-xs font-bold uppercase text-muted flex items-center gap-1.5"><Clock size={12} /> Timeline</h4>
                            <Timeline items={expandedTicket.timeline} />
                          </div>
                        )}
                      </div>

                      {/* More Details button */}
                      <div className="flex flex-col gap-2.5 items-stretch flex-shrink-0">
                        <button
                          onClick={() => navigate(`/dashboard/admin/controls?ticket=${expandedTicket.id}`)}
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#1f57c3] to-[#6366f1] text-white text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 whitespace-nowrap"
                        >
                          <ShieldCheck size={16} />
                          More Details
                          <ArrowRight size={14} />
                        </button>
                        <button
                          onClick={() => navigate(`/dashboard/admin/controls?ticket=${expandedTicket.id}`)}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#c7d2fe] bg-[#eef2ff] text-[#4338ca] text-xs font-bold hover:bg-[#e0e7ff] transition-colors whitespace-nowrap"
                        >
                          <Eye size={13} />
                          Open Admin Controls
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.75fr] gap-5 items-start mt-5">
        <div className="grid gap-4">
          <UserManagement />
          <CategoryManagement />
        </div>
        <div className="grid gap-4">
          <Reports />
          <AuditLogs />
        </div>
      </section>
    </>
  );
}
