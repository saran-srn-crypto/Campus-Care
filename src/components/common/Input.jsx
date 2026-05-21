import React from 'react';

export default function Input({ label, id, className = '', ...props }) {
  return (
    <div className="grid gap-1.5">
      {label && <label htmlFor={id} className="text-[#344054] text-sm font-bold">{label}</label>}
      <input
        id={id}
        className={`w-full border border-[#cbd5e1] rounded-lg bg-white text-ink px-3 py-2.5 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)] ${className}`}
        {...props}
      />
    </div>
  );
}
