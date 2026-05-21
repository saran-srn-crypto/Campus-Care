import React from 'react';
import { statusClass, priorityClass } from '../../utils/helpers';

export default function StatusBadge({ type = 'status', value }) {
  const cls = type === 'priority' ? priorityClass(value) : statusClass(value);
  return (
    <span className={`inline-flex items-center min-h-[26px] max-w-full rounded-full px-2.5 py-1 text-xs font-extrabold leading-tight whitespace-nowrap ${cls}`}>
      {value}
    </span>
  );
}
