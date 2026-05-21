import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import LoginForm from '../components/auth/LoginForm';

export default function LoginPage() {
  const navRight = (
    <>
      <Link to="/" className="min-h-[42px] inline-flex items-center justify-center rounded-lg px-3.5 py-2 font-extrabold no-underline bg-white text-primary-dark border border-[#b8c5d6]">Home</Link>
      <Link to="/signup" className="min-h-[42px] inline-flex items-center justify-center rounded-lg px-3.5 py-2 font-extrabold no-underline bg-primary text-white border border-primary hover:bg-primary-dark">Sign Up</Link>
    </>
  );

  return (
    <div className="bg-[#f7fbff] min-h-screen">
      <Navbar variant="auth" rightSlot={navRight} />
      <main className="min-h-[calc(100vh-82px)] grid place-items-center p-8">
        <LoginForm />
      </main>
    </div>
  );
}
