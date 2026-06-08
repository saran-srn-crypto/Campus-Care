import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import Button from '../common/Button';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      if (res && res.error) {
        showToast(res.error);
      } else {
        showToast(`Welcome! Opening your dashboard.`);
        setTimeout(() => navigate('/dashboard'), 450);
      }
    } catch (err) {
      showToast(err.message || 'Login failed');
    }
  };

  return (
    <section className="w-full max-w-[560px] grid gap-4.5 p-5.5 border border-line rounded-lg bg-white shadow-card" aria-labelledby="loginTitle">
      <div className="grid gap-2">
        <span className="text-sidebar-label text-xs font-bold uppercase">Secure access</span>
        <h1 id="loginTitle" className="m-0 text-[clamp(1.8rem,4vw,2.6rem)] leading-tight">Sign in to CampusCare</h1>
        <p className="m-0 text-muted leading-relaxed">Use your registered credentials to access the system.</p>
      </div>

      <form className="grid gap-3.5" onSubmit={handleSubmit}>
        <div className="grid gap-1.5">
          <label htmlFor="loginId" className="text-[#344054] text-sm font-bold">Email or User ID</label>
          <input id="loginId" type="text" required autoComplete="username" placeholder="Email address or User ID" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full border border-[#cbd5e1] rounded-lg bg-white text-ink px-3 py-2.5 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)]" />
        </div>
        <div className="grid gap-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="loginPassword" className="text-[#344054] text-sm font-bold">Password</label>
            <Link to="/forgot-password" className="text-primary text-sm font-extrabold hover:underline">Forgot password?</Link>
          </div>
          <input id="loginPassword" type="password" required autoComplete="current-password" placeholder="Enter password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full border border-[#cbd5e1] rounded-lg bg-white text-ink px-3 py-2.5 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)]" />
        </div>
        <Button type="submit">Sign In</Button>
      </form>

      <p className="m-0 text-center text-muted">New to CampusCare? <a href="/signup" className="text-primary-dark font-extrabold">Create an account</a></p>
    </section>
  );
}
