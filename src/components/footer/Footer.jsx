import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logos/campus-care-logo.svg';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-line mt-12 py-12 px-[clamp(18px,5vw,56px)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand section */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 text-ink no-underline mb-4" aria-label="CampusCare home">
              <img src={logo} alt="Campus Care logo" className="w-10 h-10 object-contain" />
              <strong className="text-lg">CampusCare</strong>
            </Link>
            <p className="text-muted text-sm leading-relaxed">
              [Short description placeholder. This will be updated later with actual company details or mission statement.]
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <strong className="block mb-4 text-ink">Quick Links</strong>
            <ul className="grid gap-2 list-none p-0 m-0 text-sm text-muted">
              <li><Link to="#" className="hover:text-primary transition-colors no-underline text-inherit">[Link 1]</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors no-underline text-inherit">[Link 2]</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors no-underline text-inherit">[Link 3]</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors no-underline text-inherit">[Link 4]</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <strong className="block mb-4 text-ink">Support</strong>
            <ul className="grid gap-2 list-none p-0 m-0 text-sm text-muted">
              <li><Link to="#" className="hover:text-primary transition-colors no-underline text-inherit">[Help Center]</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors no-underline text-inherit">[Contact Us]</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors no-underline text-inherit">[Terms of Service]</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors no-underline text-inherit">[Privacy Policy]</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <strong className="block mb-4 text-ink">Contact</strong>
            <ul className="grid gap-2 list-none p-0 m-0 text-sm text-muted">
              <li>Email: [support@example.com]</li>
              <li>Phone: [+1 234 567 8900]</li>
              <li>Address: [123 Campus Drive, City, State]</li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <span>© {new Date().getFullYear()} CampusCare. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-primary transition-colors">[Twitter]</a>
            <a href="#" className="hover:text-primary transition-colors">[LinkedIn]</a>
            <a href="#" className="hover:text-primary transition-colors">[Facebook]</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
