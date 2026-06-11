import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ImageModal({ src, onClose }) {
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    if (src) {
      mountTimeRef.current = Date.now();
    }
  }, [src]);

  if (!src) return null;

  const handleClose = (e) => {
    if (e) e.stopPropagation();
    if (Date.now() - mountTimeRef.current < 250) {
      return;
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 transition-all duration-300 animate-[fadeIn_0.2s_ease-out]"
      onClick={handleClose}
    >
      <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center animate-[modalIn_0.25s_ease-out]" onClick={e => e.stopPropagation()}>
        <img 
          src={src} 
          alt="Preview" 
          className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10"
        />
        <button 
          onClick={handleClose}
          className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-black/60 text-white hover:bg-black/90 flex items-center justify-center border border-white/20 transition-all duration-150 hover:scale-105 cursor-pointer shadow-lg"
          aria-label="Close preview"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
