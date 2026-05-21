import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logos/campus-care-logo.svg';

export default function Navbar({ variant = 'public', rightSlot }) {
  return (
    <header className={`min-h-[82px] flex items-center justify-between gap-5 px-[clamp(18px,5vw,56px)] py-4.5 border-b border-line ${variant === 'auth' ? 'sticky top-0 z-5' : ''} bg-white/92 backdrop-blur-sm`}>
      <Link to="/" className="flex items-center gap-3 text-ink no-underline" aria-label="CampusCare home">
        <img src={logo} alt="Campus Care logo" className="w-13 h-13 rounded-lg object-contain bg-white flex-shrink-0" />
        <div>
          <strong className="block">CampusCare</strong>
          <span className="block mt-0.5 text-muted text-[0.9rem]">Ticket escalating system</span>
        </div>
      </Link>
      {rightSlot && <nav className="flex flex-wrap gap-2.5 items-center" aria-label="Account actions">{rightSlot}</nav>}
    </header>
  );
}
