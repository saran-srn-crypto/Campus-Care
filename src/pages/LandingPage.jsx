import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import logo from '../assets/logos/campus-care-logo.svg';
import Footer from '../components/footer/Footer';

export default function LandingPage() {
  const navRight = (
    <>
      <Link to="/login" className="min-h-[42px] inline-flex items-center justify-center rounded-lg px-3.5 py-2 font-extrabold no-underline bg-white text-primary-dark border border-[#b8c5d6]">Sign In</Link>
      <Link to="/signup" className="min-h-[42px] inline-flex items-center justify-center rounded-lg px-3.5 py-2 font-extrabold no-underline bg-primary text-white border border-primary hover:bg-primary-dark">Sign Up</Link>
    </>
  );

  return (
    <div className="bg-[#f7fbff] min-h-screen">
      <Navbar rightSlot={navRight} />
      <main>
        <section className="min-h-[calc(100vh-82px)] grid grid-cols-1 lg:grid-cols-[1fr_minmax(300px,460px)] gap-8 items-center px-[clamp(18px,5vw,56px)] py-[clamp(34px,7vw,78px)]">
          <div className="grid gap-4.5 max-w-[820px]">
            <span className="text-sidebar-label text-xs font-bold uppercase">College issue tracking portal</span>
            <h1 className="m-0 text-[clamp(2.4rem,6vw,5.2rem)] leading-none">Resolve campus complaints with a clear ticket workflow.</h1>
            <p className="max-w-[720px] m-0 text-[#475467] text-lg leading-relaxed">
              CampusCare helps students raise issues, staff resolve assigned tickets, wardens manage hostel complaints, and administrators monitor service quality from one secure portal.
            </p>
            <div className="flex flex-wrap gap-2.5 items-center">
              <Link to="/signup" className="min-h-[42px] inline-flex items-center justify-center rounded-lg px-3.5 py-2 font-extrabold no-underline bg-primary text-white border border-primary hover:bg-primary-dark">Create Account</Link>
              <Link to="/login" className="min-h-[42px] inline-flex items-center justify-center rounded-lg px-3.5 py-2 font-extrabold no-underline bg-white text-primary-dark border border-[#b8c5d6]">Sign In</Link>
            </div>
          </div>
          <div className="min-h-[430px] grid place-items-center border border-line rounded-lg bg-white shadow-card" aria-label="CampusCare identity">
            <img src={logo} alt="Campus Care ticket escalating system logo" className="w-[min(82%,360px)] h-auto" />
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 px-[clamp(18px,5vw,56px)] pb-12" aria-label="CampusCare modules">
          {[
            { title: 'Students', desc: 'Raise complaints, upload proof, track status, add comments, and rate service.' },
            { title: 'Staff / Technicians', desc: 'View assigned tickets, update progress, upload proof, and escalate unresolved issues.' },
            { title: 'Hostel Wardens', desc: 'Assign hostel complaints, monitor maintenance, and approve ticket closure.' },
            { title: 'Administrators', desc: 'Manage users, roles, categories, reports, statistics, and audit logs.' },
          ].map((m, i) => (
            <article key={i} className="min-h-[132px] grid gap-2 content-start p-4.5 border border-line rounded-lg bg-white shadow-card">
              <strong>{m.title}</strong>
              <span className="text-muted leading-relaxed">{m.desc}</span>
            </article>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}
