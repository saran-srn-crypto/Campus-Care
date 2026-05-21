import React, { useState } from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useNotifications } from '../../hooks/useNotifications';
import Button from '../common/Button';

export default function UserManagement() {
  const { state, addUser, toggleUserStatus } = useTickets();
  const { showToast } = useNotifications();
  const [form, setForm] = useState({
    name: '',
    role: 'Student',
    department: '',
    status: 'Active',
    userId: '',
    email: '',
    password: '',
    phone: ''
  });
  const inputCls = 'w-full border border-[#cbd5e1] rounded-lg bg-white text-ink px-3 py-2.5 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)]';

  const handleNameChange = (val) => {
    const cleanName = val.toLowerCase().replace(/[^a-z0-9]/g, '');
    setForm(p => {
      let suggestedId = p.userId;
      if (!p.userId) {
        const prefix = p.role.includes('Student') ? 'STU-' : (p.role.includes('Administrator') ? 'ADM-' : 'EMP-');
        suggestedId = `${prefix}${Math.floor(100 + Math.random() * 900)}`;
      }
      return {
        ...p,
        name: val,
        email: cleanName ? `${cleanName}@kce.ac.in` : '',
        userId: suggestedId
      };
    });
  };

  const handleRoleChange = (val) => {
    setForm(p => {
      const prefix = val.includes('Student') ? 'STU-' : (val.includes('Administrator') ? 'ADM-' : 'EMP-');
      const suggestedId = `${prefix}${Math.floor(100 + Math.random() * 900)}`;
      return {
        ...p,
        role: val,
        userId: suggestedId
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addUser(form);
    showToast('User account created.');
    setForm({
      name: '',
      role: 'Student',
      department: '',
      status: 'Active',
      userId: '',
      email: '',
      password: '',
      phone: ''
    });
  };

  return (
    <article className="p-4.5 border border-line rounded-lg bg-white shadow-card grid gap-4">
      <div><h2 className="m-0">User Management</h2><p className="mt-1 mb-0 text-muted">Create accounts, assign roles, and manage departments.</p></div>
      <form className="grid grid-cols-2 gap-3.5" onSubmit={handleSubmit}>
        <div className="grid gap-1.5"><label htmlFor="userName" className="text-[#344054] text-sm font-bold">Full name</label><input id="userName" required placeholder="Enter user name" value={form.name} onChange={e => handleNameChange(e.target.value)} className={inputCls} /></div>
        <div className="grid gap-1.5"><label htmlFor="userRole" className="text-[#344054] text-sm font-bold">Role</label>
          <select id="userRole" value={form.role} onChange={e => handleRoleChange(e.target.value)} className={inputCls}>
            <option>Student</option><option>Staff / Technician</option><option>Hostel Warden</option><option>Administrator</option>
          </select>
        </div>
        <div className="grid gap-1.5"><label htmlFor="userId" className="text-[#344054] text-sm font-bold">User ID / Login ID</label><input id="userId" required placeholder="e.g. EMP-101 or 717823s146" value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))} className={inputCls} /></div>
        <div className="grid gap-1.5"><label htmlFor="userEmail" className="text-[#344054] text-sm font-bold">Email Address</label><input id="userEmail" type="email" required placeholder="e.g. name@kce.ac.in" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={inputCls} /></div>
        <div className="grid gap-1.5"><label htmlFor="userPassword" className="text-[#344054] text-sm font-bold">Initial Password</label><input id="userPassword" type="text" required placeholder="Enter password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className={inputCls} /></div>
        <div className="grid gap-1.5"><label htmlFor="userPhone" className="text-[#344054] text-sm font-bold">Phone Number</label><input id="userPhone" required placeholder="e.g. 9876543210" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} /></div>
        <div className="grid gap-1.5"><label htmlFor="userDepartment" className="text-[#344054] text-sm font-bold">Department / Block</label><input id="userDepartment" required placeholder="Department or hostel block" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} className={inputCls} /></div>
        <div className="grid gap-1.5"><label htmlFor="userStatus" className="text-[#344054] text-sm font-bold">Status</label>
          <select id="userStatus" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className={inputCls}><option>Active</option><option>Inactive</option></select>
        </div>
        <div className="col-span-full"><Button type="submit">Create User</Button></div>
      </form>
      <div className="grid gap-2.5">
        {state.users.map((u, i) => (
          <article key={i} className="p-3.5 grid grid-cols-[1.2fr_0.8fr_0.8fr_1fr_auto] gap-3 items-center border border-line rounded-lg bg-white">
            <strong>{u.name}</strong>
            <code className="bg-surface-soft px-2 py-1 rounded text-sm font-semibold justify-self-start">{u.userId}</code>
            <span className="capitalize">{u.role}</span>
            <span>{u.department}</span>
            <button onClick={() => { toggleUserStatus(i); showToast('User status updated.'); }} className="min-h-[40px] rounded-lg border border-line bg-transparent text-[#344054] px-3.5 py-2 font-extrabold">{u.status}</button>
          </article>
        ))}
      </div>
    </article>
  );
}
