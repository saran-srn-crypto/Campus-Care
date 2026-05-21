import React from 'react';

export default function Timeline({ items = [] }) {
  return (
    <ul className="grid gap-3 p-0 m-0 list-none">
      {items.map((item, i) => (
        <li key={i} className="relative pl-7">
          {/* Dot */}
          <span className="absolute left-1 top-1.5 w-2.5 h-2.5 rounded-full bg-primary" />
          {/* Connector line */}
          {i < items.length - 1 && (
            <span className="absolute left-[7px] top-5 w-0.5 h-[calc(100%+2px)] bg-line" />
          )}
          <strong className="block">{item.title}</strong>
          <span className="block text-muted text-sm">{item.date}</span>
          <span className="block text-muted text-sm">{item.note}</span>
        </li>
      ))}
    </ul>
  );
}
