import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import SignupForm from '../components/auth/SignupForm';

export default function SignupPage() {
  const navRight = (
    <>
      <Link to="/" className="min-h-[42px] inline-flex items-center justify-center rounded-lg px-3.5 py-2 font-extrabold no-underline bg-white text-primary-dark border border-[#b8c5d6]">Home</Link>
      <Link to="/login" className="min-h-[42px] inline-flex items-center justify-center rounded-lg px-3.5 py-2 font-extrabold no-underline bg-primary text-white border border-primary hover:bg-primary-dark">Sign In</Link>
    </>
  );

  return (
    <div className="bg-[#f7fbff] min-h-screen">
      <Navbar variant="auth" rightSlot={navRight} />
      <main className="min-h-[calc(100vh-82px)] grid place-items-center p-8">
        <SignupForm />
      </main>
    </div>
  );
}
