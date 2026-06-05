import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';
import { api } from '../../services/apiHelper';
import { validatePassword, validatePasswordMatch } from '../../utils/validators';
import Button from '../common/Button';
import { ArrowLeft, KeyRound, Mail } from 'lucide-react';

export default function ForgotPasswordForm() {
  const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Reset
  const [emailOrUserId, setEmailOrUserId] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [resendTimer, setResendTimer] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputsRef = useRef([]);
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2 && resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, resendTimer]);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!emailOrUserId.trim()) {
      showToast('Please enter your Email or User ID.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/api/auth/otp/send-forgot-password?emailOrUserId=${encodeURIComponent(emailOrUserId)}`);
      showToast('Verification OTP code sent to your registered email.');
      setStep(2);
      setResendTimer(30);
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      showToast(err.message || 'Failed to send verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      await api.post(`/api/auth/otp/send-forgot-password?emailOrUserId=${encodeURIComponent(emailOrUserId)}`);
      showToast('A new verification code has been sent to your email.');
      setResendTimer(30);
    } catch (err) {
      showToast(err.message || 'Failed to resend OTP.');
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      showToast('Please enter the full 6-digit OTP code.');
      return;
    }

    const passErr = validatePassword(newPassword);
    if (passErr) { showToast(passErr); return; }

    const matchErr = validatePasswordMatch(newPassword, confirmPassword);
    if (matchErr) { showToast(matchErr); return; }

    setIsSubmitting(true);
    try {
      await api.post('/api/auth/otp/reset-password', {
        emailOrUserId,
        otp: otpCode,
        newPassword
      });
      showToast('Password reset successfully. Please log in.');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      showToast(err.message || 'Failed to reset password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls = 'w-full border border-[#cbd5e1] rounded-lg bg-white text-ink px-3 py-2.5 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)] transition-all';

  if (step === 1) {
    return (
      <section className="w-full max-w-[500px] grid gap-5 p-7 border border-line rounded-lg bg-white shadow-card" aria-labelledby="forgotTitle">
        <div className="grid gap-2 text-center">
          <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-[#f0f5ff] text-primary">
            <KeyRound size={24} />
          </div>
          <h1 id="forgotTitle" className="m-0 text-2xl font-bold leading-tight">Forgot Password?</h1>
          <p className="m-0 text-muted leading-relaxed text-sm">
            Enter your Email address or User ID below and we will send you a verification code.
          </p>
        </div>

        <form className="grid gap-4" onSubmit={handleRequestOtp}>
          <div className="grid gap-1.5">
            <label htmlFor="emailOrUserId" className="text-[#344054] text-sm font-bold">Email or User ID</label>
            <input
              id="emailOrUserId"
              type="text"
              required
              placeholder="e.g. student@example.com or Roll Number"
              value={emailOrUserId}
              onChange={e => setEmailOrUserId(e.target.value)}
              className={inputCls}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Sending code...' : 'Send Verification Code'}
          </Button>

          <Link to="/login" className="flex items-center justify-center gap-1.5 text-muted hover:text-ink text-sm font-bold transition-colors no-underline">
            <ArrowLeft size={16} /> Back to Sign In
          </Link>
        </form>
      </section>
    );
  }

  return (
    <section className="w-full max-w-[500px] grid gap-5 p-7 border border-line rounded-lg bg-white shadow-card animate-fade-in" aria-labelledby="resetTitle">
      <div className="grid gap-2 text-center">
        <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-[#f0f5ff] text-primary">
          <Mail size={24} />
        </div>
        <h1 id="resetTitle" className="m-0 text-2xl font-bold leading-tight">Verify Your Account</h1>
        <p className="m-0 text-muted leading-relaxed text-sm">
          Please enter the OTP sent to your email and select a new secure password.
        </p>
      </div>

      <form className="grid gap-4" onSubmit={handleResetPassword}>
        <div className="grid gap-1.5">
          <label className="text-[#344054] text-sm font-bold text-center block mb-1">Enter Verification Code (OTP)</label>
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
                onChange={e => handleOtpChange(i, e.target.value)}
                onKeyDown={e => handleOtpKeyDown(i, e)}
                className="w-11 h-11 text-center text-lg font-bold border border-[#cbd5e1] rounded-lg bg-white text-ink outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)] transition-all"
              />
            ))}
          </div>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="newPassword" className="text-[#344054] text-sm font-bold">New Password</label>
          <input
            id="newPassword"
            type="password"
            required
            minLength={6}
            placeholder="Minimum 6 characters"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className={inputCls}
          />
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="confirmPassword" className="text-[#344054] text-sm font-bold">Confirm New Password</label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={6}
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className={inputCls}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full mt-1.5">
          {isSubmitting ? 'Resetting password...' : 'Reset Password'}
        </Button>
      </form>

      <div className="flex justify-between items-center text-sm text-muted px-1">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="text-muted hover:text-ink font-bold flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back
        </button>
        {resendTimer > 0 ? (
          <span className="font-semibold text-primary">Resend in {resendTimer}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResendOtp}
            className="text-primary-dark font-extrabold hover:underline bg-transparent border-none p-0 cursor-pointer"
          >
            Resend OTP
          </button>
        )}
      </div>
    </section>
  );
}
