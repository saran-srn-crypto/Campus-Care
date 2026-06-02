import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import { ROLE_LABELS } from '../../utils/constants';
import { validateEmail, validatePassword, validatePasswordMatch } from '../../utils/validators';
import Button from '../common/Button';
import { GraduationCap, Wrench, Building } from 'lucide-react';

/* ─── Role-specific field definitions ─── */
const ROLE_FIELDS = {
  student: [
    { key: 'name', label: 'Full name', placeholder: 'Enter your full name', type: 'text', required: true },
    { key: 'userId', label: 'Roll number / Student ID', placeholder: 'e.g. 717823S146', type: 'text', required: true },
    { key: 'email', label: 'College email address', placeholder: 'name@kce.ac.in', type: 'email', required: true },
    { key: 'department', label: 'Department', placeholder: 'e.g. Computer Science', type: 'text', required: true },
    { key: 'year', label: 'Year / Semester', placeholder: 'e.g. 3rd Year / 6th Sem', type: 'text', required: true },
    { key: 'hostelBlock', label: 'Hostel block & Room no.', placeholder: 'e.g. Block C, Room 214', type: 'text', required: false },
    { key: 'phone', label: 'Phone number', placeholder: 'Contact number', type: 'tel', required: true },
  ],
  staff: [
    { key: 'name', label: 'Full name', placeholder: 'Enter your full name', type: 'text', required: true },
    { key: 'userId', label: 'Employee ID', placeholder: 'e.g. EMP-204', type: 'text', required: true },
    { key: 'email', label: 'Official email address', placeholder: 'name@kce.ac.in', type: 'email', required: true },
    { key: 'department', label: 'Department / Unit', placeholder: 'e.g. IT Services, Maintenance', type: 'text', required: true },
    { key: 'designation', label: 'Designation', placeholder: 'e.g. Senior Technician', type: 'text', required: true },
    { key: 'specialization', label: 'Specialization', placeholder: 'e.g. Networking, Plumbing, Electrical', type: 'text', required: false },
    { key: 'phone', label: 'Phone number', placeholder: 'Contact number', type: 'tel', required: true },
  ],
  warden: [
    { key: 'name', label: 'Full name', placeholder: 'Enter your full name', type: 'text', required: true },
    { key: 'userId', label: 'Employee ID', placeholder: 'e.g. WRD-102', type: 'text', required: true },
    { key: 'email', label: 'Official email address', placeholder: 'name@kce.ac.in', type: 'email', required: true },
    { key: 'hostelBlock', label: 'Hostel block assigned', placeholder: 'e.g. Block A, Block C', type: 'text', required: true },
    { key: 'designation', label: 'Designation', placeholder: 'e.g. Chief Warden, Block Warden', type: 'text', required: true },
    { key: 'floorsManaged', label: 'Floors managed', placeholder: 'e.g. Floor 1–3', type: 'text', required: false },
    { key: 'phone', label: 'Phone number', placeholder: 'Contact number', type: 'tel', required: true },
  ],
};

const ROLE_CARDS = [
  { value: 'student', label: 'Student', desc: 'Raise and track campus complaints', icon: <GraduationCap size={22} /> },
  { value: 'staff', label: 'Staff / Technician', desc: 'Resolve assigned maintenance tickets', icon: <Wrench size={22} /> },
  { value: 'warden', label: 'Hostel Warden', desc: 'Manage hostel issues and staff', icon: <Building size={22} /> },
];

const INITIAL_FORM = {
  name: '', role: 'student', email: '', userId: '', department: '',
  phone: '', password: '', confirm: '', official: false,
  year: '', hostelBlock: '', designation: '', specialization: '', floorsManaged: '',
};

export default function SignupForm() {
  const [form, setForm] = useState(INITIAL_FORM);
  const { signup } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const set = (key) => (e) => setForm(prev => ({
    ...prev,
    [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }));

  const selectRole = (role) => setForm(prev => ({ ...prev, role }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emailErr = validateEmail(form.email);
    if (emailErr) { showToast(emailErr); return; }
    const passErr = validatePassword(form.password);
    if (passErr) { showToast(passErr); return; }
    const matchErr = validatePasswordMatch(form.password, form.confirm);
    if (matchErr) { showToast(matchErr); return; }

    try {
      const result = await signup({
        role: form.role,
        label: ROLE_LABELS[form.role],
        name: form.name,
        email: form.email,
        userId: form.userId,
        department: form.department || form.hostelBlock,
        phone: form.phone,
        password: form.password,
        year: form.year,
        hostelBlock: form.hostelBlock,
        designation: form.designation,
        specialization: form.specialization,
        floorsManaged: form.floorsManaged,
      });
      if (result && result.error) { showToast(result.error); return; }
      showToast('Account created. Opening your dashboard.');
      setTimeout(() => navigate('/dashboard'), 650);
    } catch (err) {
      showToast(err.message || 'Registration failed');
    }
  };

  const inputCls = 'w-full border border-[#cbd5e1] rounded-lg bg-white text-ink px-3 py-2.5 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)] transition-colors';
  const fields = ROLE_FIELDS[form.role] || ROLE_FIELDS.student;

  return (
    <section className="w-full max-w-[860px] grid gap-5 p-6 border border-line rounded-lg bg-white shadow-card" aria-labelledby="signupTitle">
      {/* Header */}
      <div className="grid gap-2">
        <span className="text-sidebar-label text-xs font-bold uppercase tracking-wide">Official registration</span>
        <h1 id="signupTitle" className="m-0 text-[clamp(1.8rem,4vw,2.6rem)] leading-tight">Create your CampusCare account</h1>
        <p className="m-0 text-muted leading-relaxed">Fill in the details below to register your student account.</p>
      </div>

      {/* Dynamic form */}
      <form className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" onSubmit={handleSubmit}>
        {/* Role-specific fields */}
        {fields.map(f => (
          <div key={f.key} className="grid gap-1.5">
            <label htmlFor={`signup-${f.key}`} className="text-[#344054] text-sm font-bold">
              {f.label}{f.required && <span className="text-danger ml-0.5">*</span>}
            </label>
            <input
              id={`signup-${f.key}`}
              type={f.type}
              required={f.required}
              placeholder={f.placeholder}
              value={form[f.key] || ''}
              onChange={set(f.key)}
              inputMode={f.type === 'tel' ? 'tel' : undefined}
              autoComplete={f.type === 'email' ? 'email' : undefined}
              className={inputCls}
            />
          </div>
        ))}

        {/* Password row — always shown */}
        <div className="grid gap-1.5">
          <label htmlFor="signupPassword" className="text-[#344054] text-sm font-bold">
            Password<span className="text-danger ml-0.5">*</span>
          </label>
          <input id="signupPassword" required minLength={6} type="password" placeholder="Minimum 6 characters"
            value={form.password} onChange={set('password')} className={inputCls} />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="signupConfirm" className="text-[#344054] text-sm font-bold">
            Confirm password<span className="text-danger ml-0.5">*</span>
          </label>
          <input id="signupConfirm" required minLength={6} type="password" placeholder="Re-enter password"
            value={form.confirm} onChange={set('confirm')} className={inputCls} />
        </div>

        {/* Checkbox */}
        <div className="col-span-full">
          <label className="flex items-start gap-2.5 text-[#344054] leading-relaxed cursor-pointer">
            <input type="checkbox" required checked={form.official} onChange={set('official')}
              className="mt-1 flex-shrink-0 w-4 h-4 accent-primary" />
            <span>I confirm this is my official email address provided by the organization.</span>
          </label>
        </div>

        {/* Actions */}
        <div className="col-span-full flex flex-wrap gap-2.5 items-center">
          <Button type="submit">Create Account</Button>
          <a href="/login" className="min-h-[42px] inline-flex items-center justify-center rounded-lg px-3.5 py-2 font-extrabold no-underline bg-white text-primary-dark border border-[#b8c5d6] hover:bg-surface-soft transition-colors">
            Already registered
          </a>
        </div>
      </form>

      {/* Info box */}
      <div className="grid gap-1 p-3.5 rounded-lg bg-surface-soft">
        <strong>Official email rule</strong>
        <span className="text-muted leading-relaxed">For this prototype, the accepted organization domain is <code className="bg-white px-1 py-0.5 rounded text-sm">@kce.ac.in</code>.</span>
      </div>
    </section>
  );
}
