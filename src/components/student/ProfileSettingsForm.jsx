import React, { useState } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

export default function ProfileSettingsForm({ profile, onBack, backLabel = 'Back to Dashboard' }) {
  const { updateProfile } = useAuth();
  const { showToast } = useNotifications();
  const [form, setForm] = useState({
    name: profile.name,
    email: profile.email,
    userId: profile.userId,
    department: profile.department,
    phone: profile.phone,
    password: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));
  const inputCls = 'w-full border border-[#cbd5e1] rounded-lg bg-white text-ink px-3 py-2.5 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)]';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const result = await updateProfile(form);
    setSaving(false);
    showToast(result?.error || 'Profile updated.');
  };

  return (
    <article className="p-5 border border-line rounded-lg bg-white shadow-card grid gap-4">
      <div>
        <h2 className="m-0">Profile Settings</h2>
        <p className="mt-1 mb-0 text-muted">Update your personal details, department information, and password.</p>
      </div>
      <form className="grid grid-cols-1 sm:grid-cols-2 gap-3.5" onSubmit={handleSubmit}>
        <div className="grid gap-1.5">
          <label className="text-[#344054] text-sm font-bold">Display name</label>
          <input value={form.name} onChange={set('name')} required className={inputCls} />
        </div>
        <div className="grid gap-1.5">
          <label className="text-[#344054] text-sm font-bold">Email address</label>
          <input type="email" value={form.email} onChange={set('email')} required disabled className={inputCls + ' disabled:bg-surface-soft'} />
        </div>
        <div className="grid gap-1.5">
          <label className="text-[#344054] text-sm font-bold">Student / Employee ID</label>
          <input value={form.userId} onChange={set('userId')} required disabled className={inputCls + ' disabled:bg-surface-soft'} />
        </div>
        <div className="grid gap-1.5">
          <label className="text-[#344054] text-sm font-bold">Department</label>
          <input value={form.department} onChange={set('department')} required className={inputCls} />
        </div>
        <div className="grid gap-1.5">
          <label className="text-[#344054] text-sm font-bold">Phone</label>
          <input value={form.phone} onChange={set('phone')} required inputMode="tel" className={inputCls} />
        </div>
        <div className="grid gap-1.5">
          <label className="text-[#344054] text-sm font-bold">New password</label>
          <input type="password" placeholder="Leave blank to keep current" value={form.password} onChange={set('password')} className={inputCls} />
        </div>
        <div className="col-span-full flex flex-wrap gap-2.5">
          <button type="submit" disabled={saving} className="min-h-[40px] rounded-lg border border-transparent bg-primary text-white px-4 py-2 font-extrabold hover:bg-primary-dark transition-colors disabled:opacity-70">
            {saving ? 'Updating...' : 'Update Profile'}
          </button>
          {onBack && (
            <button type="button" onClick={onBack} className="min-h-[40px] rounded-lg border border-[#b8c5d6] bg-white text-primary-dark px-4 py-2 font-extrabold hover:bg-surface-soft transition-colors flex items-center gap-1.5">
              <LayoutDashboard size={16} /> {backLabel}
            </button>
          )}
        </div>
      </form>
    </article>
  );
}
