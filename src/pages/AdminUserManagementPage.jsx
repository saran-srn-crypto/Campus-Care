import React from 'react';
import UserManagement from '../components/admin/UserManagement';
import { Users } from 'lucide-react';

export default function AdminUserManagementPage() {
  return (
    <div className="grid gap-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1f57c3] to-[#6366f1] text-white grid place-items-center shadow-md">
          <Users size={22} />
        </div>
        <div>
          <h2 className="m-0 text-xl font-bold text-ink">User Directory &amp; Credentials</h2>
          <p className="m-0 text-muted text-sm">Manage, create, and edit system accounts, departments, and passwords.</p>
        </div>
      </div>

      {/* User Management Component */}
      <UserManagement />
    </div>
  );
}
