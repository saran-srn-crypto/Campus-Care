import React from 'react';

export default function Loader({ className = '' }) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="w-8 h-8 border-4 border-line border-t-primary rounded-full animate-spin" />
    </div>
  );
}
