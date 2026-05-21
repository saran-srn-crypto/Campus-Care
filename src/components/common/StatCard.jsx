import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function StatCard({ label, count, icon: Icon, color, bgColor, borderColor, navigateTo }) {
  const navigate = useNavigate();

  return (
    <button
      id={'stat-card-' + label.toLowerCase().replace(/\s+/g, '-')}
      onClick={() => navigate(navigateTo)}
      className="group relative min-h-[150px] p-5 border-2 rounded-lg bg-white text-left cursor-pointer overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card focus:outline-none focus:ring-4 focus:ring-[#d6e4ff]"
      style={{ '--card-color': color, '--card-bg': bgColor, '--card-border': borderColor, borderColor }}
      aria-label={'View ' + label + ': ' + count + ' tickets'}
    >
      <div className="relative flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-muted group-hover:text-ink transition-colors duration-200">
          {label}
        </span>
        <span
          className="w-10 h-10 rounded-lg grid place-items-center transition-all duration-200 group-hover:scale-105"
          style={{ backgroundColor: bgColor, color }}
        >
          <Icon size={20} />
        </span>
      </div>

      <strong className="relative block mt-3 text-4xl font-extrabold tracking-normal text-ink">
        {count}
      </strong>

      <div className="relative mt-2 flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 opacity-70 group-hover:opacity-100" style={{ color }}>
        <span>View details</span>
        <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[3px] transition-all duration-300 origin-left scale-x-0 group-hover:scale-x-100" style={{ backgroundColor: color }} />
    </button>
  );
}
