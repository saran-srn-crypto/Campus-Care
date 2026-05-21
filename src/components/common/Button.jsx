import React from 'react';

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-dark',
  secondary: 'border border-[#b8c5d6] bg-white text-primary-dark',
  ghost: 'border border-line bg-transparent text-[#344054]',
  danger: 'bg-[#fff0ee] text-danger border border-[#f4c4be]',
};

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  return (
    <button
      className={`min-h-[40px] rounded-lg border border-transparent px-3.5 py-2 font-extrabold transition-colors ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
