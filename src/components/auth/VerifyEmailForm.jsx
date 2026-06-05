import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { api } from '../../services/apiHelper';
import Button from '../common/Button';

export default function VerifyEmailForm() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signupData, setSignupData] = useState(null);
  const inputsRef = useRef([]);
  const { signup } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const dataStr = sessionStorage.getItem('campuscare-signup-pending');
    if (!dataStr) {
      showToast('No registration data found. Please register first.');
      navigate('/signup');
      return;
    }
    setSignupData(JSON.parse(dataStr));
  }, [navigate, showToast]);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || !signupData) return;
    try {
      await api.post(`/api/auth/otp/send-registration?email=${encodeURIComponent(signupData.email)}&userId=${encodeURIComponent(signupData.userId)}`);
      showToast('A new verification code has been sent to your email.');
      setResendTimer(30);
    } catch (err) {
      showToast(err.message || 'Failed to resend OTP.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      showToast('Please enter the full 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await signup({
        ...signupData,
        otp: otpCode
      });

      if (result && result.error) {
        showToast(result.error);
      } else {
        showToast('Email verified. Welcome to CampusCare!');
        sessionStorage.removeItem('campuscare-signup-pending');
        setTimeout(() => navigate('/dashboard'), 650);
      }
    } catch (err) {
      showToast(err.message || 'Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!signupData) return null;

  return (
    <section className="w-full max-w-[500px] grid gap-5 p-7 border border-line rounded-lg bg-white shadow-card animate-fade-in" aria-labelledby="verifyTitle">
      <div className="grid gap-2 text-center">
        <span className="text-sidebar-label text-xs font-bold uppercase tracking-wide">Verification Required</span>
        <h1 id="verifyTitle" className="m-0 text-2xl font-bold leading-tight">Verify Your Email</h1>
        <p className="m-0 text-muted leading-relaxed text-sm">
          We've sent a 6-digit verification code to <br />
          <strong className="text-ink font-semibold">{signupData.email}</strong>.
        </p>
      </div>

      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="flex justify-center gap-2.5">
          {otp.map((digit, i) => (
            <input
              key={i}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              ref={el => inputsRef.current[i] = el}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="w-12 h-12 text-center text-xl font-bold border border-[#cbd5e1] rounded-lg bg-white text-ink outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)] transition-all"
            />
          ))}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Verifying...' : 'Verify & Create Account'}
        </Button>
      </form>

      <div className="text-center text-sm text-muted">
        Didn't receive the code?{' '}
        {resendTimer > 0 ? (
          <span className="font-semibold text-primary">Resend in {resendTimer}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResendOtp}
            className="text-primary-dark font-extrabold hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            Resend code
          </button>
        )}
      </div>
    </section>
  );
}
