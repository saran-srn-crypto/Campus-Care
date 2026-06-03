import React, { useState, useRef } from 'react';
import { useTickets } from '../../hooks/useTickets';
import { useNotifications } from '../../hooks/useNotifications';
import Button from '../common/Button';

export default function UserManagement() {
  const { state, addUser, toggleUserStatus, removeUser, updateUser, uploadUserExcel } = useTickets();
  const { showToast } = useNotifications();
  const [editingUserId, setEditingUserId] = useState(null);
  const [listTab, setListTab] = useState('student');
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
  const [excelFile, setExcelFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const ext = file.name.split('.').pop().toLowerCase();
      if (ext === 'xlsx' || ext === 'xls') {
        setExcelFile(file);
        setUploadResult(null);
      } else {
        showToast('Invalid file format. Please upload a valid .xlsx or .xls Excel sheet.');
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setExcelFile(file);
      setUploadResult(null);
    }
  };

  const handleExcelSubmit = (e) => {
    e.preventDefault();
    if (!excelFile) return;

    setIsUploading(true);
    setUploadResult(null);

    uploadUserExcel(excelFile)
      .then((res) => {
        setIsUploading(false);
        setExcelFile(null);
        setUploadResult(res);
        showToast('Excel database imported successfully.');
      })
      .catch((err) => {
        setIsUploading(false);
        const errorMsg = err.message === 'Failed to fetch'
          ? 'Network Connection Interrupted: Please ensure that your Excel file is a valid .xlsx/.xls spreadsheet, the column headers match the template, and the server microservices are online.'
          : (err.message || 'Failed to parse and import Excel file.');
        showToast(errorMsg);
      });
  };

  const inputCls = 'w-full border border-[#cbd5e1] rounded-lg bg-white text-ink px-3 py-2.5 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(31,87,195,0.14)]';

  const handleNameChange = (val) => {
    if (editingUserId) {
      setForm(p => ({ ...p, name: val }));
      return;
    }
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
      let suggestedId = p.userId;
      if (!editingUserId) {
        const prefix = val.includes('Student') ? 'STU-' : (val.includes('Administrator') ? 'ADM-' : 'EMP-');
        suggestedId = `${prefix}${Math.floor(100 + Math.random() * 900)}`;
      }
      return {
        ...p,
        role: val,
        userId: suggestedId
      };
    });
  };

  const handleEditClick = (u) => {
    setEditingUserId(u.userId);
    let displayRole = 'Student';
    if (u.role === 'staff') displayRole = 'Staff / Technician';
    else if (u.role === 'warden') displayRole = 'Hostel Warden';
    else if (u.role === 'admin') displayRole = 'Administrator';

    setForm({
      name: u.name || '',
      role: displayRole,
      department: u.department || '',
      status: u.status || 'Active',
      userId: u.userId || '',
      email: u.email || '',
      password: '', // blank by default
      phone: u.phone || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUserId) {
      updateUser(editingUserId, form)
        .then(() => {
          showToast('User account updated.');
          handleCancelEdit();
        })
        .catch(err => {
          showToast(err.message || 'Failed to update user.');
        });
    } else {
      addUser(form)
        .then(() => {
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
        })
        .catch(err => {
          showToast(err.message || 'Failed to create user.');
        });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Manual Creation Card */}
      <article className="lg:col-span-2 p-5 border border-line rounded-lg bg-white shadow-card grid gap-4">
        <div>
          <h2 className="m-0">{editingUserId ? 'Edit User Credentials & Details' : 'Manual User Creation'}</h2>
          <p className="mt-1 mb-0 text-muted">
            {editingUserId ? `Modifying credentials and details for user ID ${editingUserId}` : 'Create a single account, assign roles, and manage blocks manually.'}
          </p>
        </div>
        <form className="grid grid-cols-2 gap-3.5" onSubmit={handleSubmit}>
          <div className="grid gap-1.5"><label htmlFor="userName" className="text-[#344054] text-sm font-bold">Full name</label><input id="userName" required placeholder="Enter user name" value={form.name} onChange={e => handleNameChange(e.target.value)} className={inputCls} /></div>
          <div className="grid gap-1.5"><label htmlFor="userRole" className="text-[#344054] text-sm font-bold">Role</label>
            <select id="userRole" disabled={editingUserId === '717823s146'} value={form.role} onChange={e => handleRoleChange(e.target.value)} className={`${inputCls} ${editingUserId === '717823s146' ? 'opacity-70 bg-slate-50 cursor-not-allowed' : ''}`}>
              <option>Student</option><option>Staff / Technician</option><option>Hostel Warden</option><option>Administrator</option>
            </select>
          </div>
          <div className="grid gap-1.5"><label htmlFor="userId" className="text-[#344054] text-sm font-bold">User ID / Login ID</label><input id="userId" disabled={editingUserId === '717823s146'} required placeholder="e.g. EMP-101 or 717823s146" value={form.userId} onChange={e => setForm(p => ({ ...p, userId: e.target.value }))} className={`${inputCls} ${editingUserId === '717823s146' ? 'opacity-70 bg-slate-50 cursor-not-allowed' : ''}`} /></div>
          <div className="grid gap-1.5"><label htmlFor="userEmail" className="text-[#344054] text-sm font-bold">Email Address</label><input id="userEmail" type="email" disabled={editingUserId === '717823s146'} required placeholder="e.g. name@kce.ac.in" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className={`${inputCls} ${editingUserId === '717823s146' ? 'opacity-70 bg-slate-50 cursor-not-allowed' : ''}`} /></div>
          <div className="grid gap-1.5">
            <label htmlFor="userPassword" className="text-[#344054] text-sm font-bold">
              {editingUserId ? 'Change Password (optional)' : 'Initial Password'}
            </label>
            <input id="userPassword" type="text" required={!editingUserId} placeholder={editingUserId ? 'Leave blank to keep current' : 'Enter password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className={inputCls} />
          </div>
          <div className="grid gap-1.5"><label htmlFor="userPhone" className="text-[#344054] text-sm font-bold">Phone Number</label><input id="userPhone" required placeholder="e.g. 9876543210" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className={inputCls} /></div>
          <div className="grid gap-1.5"><label htmlFor="userDepartment" className="text-[#344054] text-sm font-bold">Department / Block</label><input id="userDepartment" required placeholder="Department or hostel block" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} className={inputCls} /></div>
          <div className="grid gap-1.5"><label htmlFor="userStatus" className="text-[#344054] text-sm font-bold">Status</label>
            <select id="userStatus" disabled={editingUserId === '717823s146'} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className={`${inputCls} ${editingUserId === '717823s146' ? 'opacity-70 bg-slate-50 cursor-not-allowed' : ''}`}><option>Active</option><option>Inactive</option></select>
          </div>
          <div className="col-span-full flex gap-3">
            <Button type="submit">{editingUserId ? 'Save Changes' : 'Create User'}</Button>
            {editingUserId && (
              <button type="button" onClick={handleCancelEdit} className="min-h-[44px] px-5 py-2.5 rounded-lg border border-line bg-white text-[#344054] font-extrabold hover:bg-surface-soft transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>
      </article>

      {/* Excel Upload Card */}
      <article className="p-5 border border-line rounded-lg bg-white shadow-card grid gap-4">
        <div>
          <h2 className="m-0 flex items-center gap-2">
            <span>Batch Excel Import</span>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">XLSX</span>
          </h2>
          <p className="mt-1 mb-0 text-muted">
            Batch-create student and employee accounts from a spreadsheet.
          </p>
        </div>

        <form onSubmit={handleExcelSubmit} className="grid gap-4">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-6 transition-all text-center flex flex-col items-center justify-center cursor-pointer group ${
              isDragActive
                ? 'border-primary bg-blue-50/50 shadow-[0_0_0_3px_rgba(31,87,195,0.14)]'
                : 'border-slate-200 hover:border-primary bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
            {excelFile ? (
              <div className="grid gap-2 z-20">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto font-extrabold text-xl shadow-sm">
                  ✓
                </div>
                <div className="text-sm font-bold text-ink truncate max-w-[200px]">{excelFile.name}</div>
                <div className="text-xs text-muted">{(excelFile.size / 1024).toFixed(1)} KB</div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExcelFile(null);
                  }}
                  className="mt-2 text-xs font-bold text-coral hover:underline"
                >
                  Change File
                </button>
              </div>
            ) : (
              <div className="grid gap-2 z-20">
                <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-blue-50 flex items-center justify-center text-slate-500 group-hover:text-primary mx-auto transition-colors font-extrabold text-xl shadow-sm">
                  ⎋
                </div>
                <div className="text-sm font-bold text-ink">Drag &amp; drop Excel file here</div>
                <div className="text-xs text-muted">Supports .xlsx and .xls formats</div>
                <span className="mt-1.5 text-xs text-primary font-bold hover:underline">or click to browse</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!excelFile || isUploading}
            className={`min-h-[44px] w-full px-5 py-2.5 rounded-lg text-white font-extrabold transition-all flex items-center justify-center gap-2 ${
              excelFile && !isUploading
                ? 'bg-gradient-to-r from-primary to-primary-dark hover:shadow-[0_4px_12px_rgba(31,87,195,0.2)]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isUploading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                <span>Importing Users...</span>
              </>
            ) : (
              <span>Upload &amp; Process Excel</span>
            )}
          </button>
        </form>

        <div className="border-t border-line pt-3.5 grid gap-2.5">
          <div className="text-xs font-bold text-ink">Expected Column Headers:</div>
          <div className="flex flex-wrap gap-1.5">
            {['User ID', 'Name', 'Email', 'Role', 'Department', 'Phone', 'Password'].map((col, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">
                {col}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-muted m-0 leading-normal">
            Headers are automatically matched (case-insensitive). Missing passwords default to <strong>123456</strong>. Duplicates are skipped safely.
          </p>
        </div>

        {uploadResult && (
          <div className="border border-emerald-100 rounded-lg p-3 bg-emerald-50/50 grid gap-2 animate-[slideDown_0.2s_ease-out]">
            <div className="text-xs font-extrabold text-emerald-800 flex items-center justify-between">
              <span>Import Results:</span>
              <button 
                onClick={() => setUploadResult(null)} 
                className="text-[10px] text-emerald-600 hover:text-emerald-800 font-bold"
              >
                Clear
              </button>
            </div>
            <div className="flex gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded">
                Created: {uploadResult.importedCount}
              </span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 rounded">
                Skipped: {uploadResult.skippedCount}
              </span>
            </div>
            {uploadResult.skippedUserIds && uploadResult.skippedUserIds.length > 0 && (
              <div className="grid gap-1">
                <div className="text-[10px] font-bold text-slate-500">Skipped IDs:</div>
                <div className="max-h-[60px] overflow-y-auto bg-white/80 border border-slate-100 rounded p-1 text-[9px] font-mono text-slate-600 break-all leading-normal">
                  {uploadResult.skippedUserIds.join(', ')}
                </div>
              </div>
            )}
          </div>
        )}
      </article>

      {/* Directory Listing Card */}
      <article className="lg:col-span-3 p-5 border border-line rounded-lg bg-white shadow-card grid gap-4">
        {/* Separate Listing Sections for Students, Wardens, and Staff */}
        <div className="border-b border-line flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setListTab('student')}
            className={`px-4.5 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              listTab === 'student'
                ? 'border-primary text-primary font-extrabold'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            Students ({state.users.filter(u => u.role === 'student').length})
          </button>
          <button
            type="button"
            onClick={() => setListTab('warden')}
            className={`px-4.5 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              listTab === 'warden'
                ? 'border-primary text-primary font-extrabold'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            Hostel Wardens ({state.users.filter(u => u.role === 'warden').length})
          </button>
          <button
            type="button"
            onClick={() => setListTab('staff')}
            className={`px-4.5 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              listTab === 'staff'
                ? 'border-primary text-primary font-extrabold'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            Staff &amp; Technicians ({state.users.filter(u => u.role === 'staff').length})
          </button>
          <button
            type="button"
            onClick={() => setListTab('admin')}
            className={`px-4.5 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              listTab === 'admin'
                ? 'border-primary text-primary font-extrabold'
                : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            Administrators ({state.users.filter(u => u.role === 'admin').length})
          </button>
        </div>

        <div className="grid gap-2.5 min-h-[140px]">
          {state.users.filter(u => u.role === listTab).length === 0 ? (
            <div className="text-center p-12 text-muted text-sm border border-dashed border-[#e2e8f0] rounded-xl bg-slate-50/50">
              No users found in this directory category.
            </div>
          ) : (
            state.users
              .filter(u => u.role === listTab)
              .map((u, i) => (
                <article
                  key={u.userId || i}
                  className="p-3.5 grid grid-cols-[1fr_0.7fr_0.7fr_0.8fr_auto_auto_auto] gap-3 items-center border border-line rounded-lg bg-white shadow-sm hover:border-[#cbd5e1] transition-all"
                >
                  <strong>{u.name}</strong>
                  <code className="bg-surface-soft px-2 py-1 rounded text-sm font-semibold justify-self-start">
                    {u.userId}
                  </code>
                  <span className="capitalize text-sm font-semibold text-slate-600">{u.role}</span>
                  <span className="text-sm text-slate-500">{u.department || '—'}</span>
                  <button
                    type="button"
                    disabled={u.userId === '717823s146' || u.email === '717823s146@kce.ac.in'}
                    title={u.userId === '717823s146' || u.email === '717823s146@kce.ac.in' ? "The primary admin account status cannot be deactivated." : ""}
                    onClick={() => {
                      toggleUserStatus(u.userId);
                      showToast('User status updated.');
                    }}
                    className={`min-h-[40px] rounded-lg border border-line bg-transparent text-[#344054] px-3 py-2 text-sm font-extrabold hover:bg-slate-50 transition-colors cursor-pointer ${(u.userId === '717823s146' || u.email === '717823s146@kce.ac.in') ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {u.status}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditClick(u)}
                    className="min-h-[40px] rounded-lg border border-line bg-[#f8fafc] text-primary px-3 py-2 text-sm font-extrabold hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    disabled={u.userId === '717823s146' || u.email === '717823s146@kce.ac.in'}
                    title={u.userId === '717823s146' || u.email === '717823s146@kce.ac.in' ? "The primary admin account cannot be removed." : ""}
                    onClick={() => {
                      if (window.confirm('Are you sure you want to remove this user?')) {
                        removeUser(u.userId)
                          .then(() => showToast('User removed.'))
                          .catch(() => showToast('Failed to remove user.'));
                      }
                    }}
                    className={`min-h-[40px] rounded-lg border border-red-200 bg-red-50 text-red-600 px-3 py-2 text-sm font-extrabold hover:bg-red-100 transition-colors cursor-pointer ${(u.userId === '717823s146' || u.email === '717823s146@kce.ac.in') ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Remove
                  </button>
                </article>
              ))
          )}
        </div>
      </article>
    </div>
  );
}
