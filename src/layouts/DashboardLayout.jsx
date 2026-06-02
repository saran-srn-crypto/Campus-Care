import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { useTickets } from '../hooks/useTickets';
import { ROLE_META, ROLE_USERS } from '../utils/constants';
import NotificationPanel from '../components/notifications/NotificationPanel';
import ProfileCard from '../components/student/ProfileCard';
import ProfileSettingsForm from '../components/student/ProfileSettingsForm';
import logo from '../assets/logos/campus-care-logo.svg';
import {
  User,
  Users,
  LayoutDashboard,
  RotateCcw,
  LogOut,
  Bell,
  GraduationCap,
  Wrench,
  Building,
  ShieldCheck,
  Clock,
  Headset,
  FileText,
  BarChart3,
  PlusCircle,
  ClipboardList,
  UserCircle,
  BellRing,
} from 'lucide-react';

const sidebarRoleIcons = {
  student: <GraduationCap size={18} />,
  staff: <Wrench size={18} />,
  warden: <Building size={18} />,
  admin: <ShieldCheck size={18} />,
};

const studentNavItems = [
  { label: 'Student Dashboard', path: '/student/dashboard', icon: LayoutDashboard, aliases: ['/dashboard/student'] },
  { label: 'Raise Complaint', path: '/student/raise-complaint', icon: PlusCircle },
  { label: 'Complaint History', path: '/student/complaints', icon: ClipboardList, startsWith: true },
  { label: 'Profile', path: '/student/profile', icon: UserCircle },
  { label: 'Notifications', path: '/student/notifications', icon: BellRing },
];

function isActiveItem(pathname, item) {
  if (item.startsWith && pathname.startsWith(item.path)) return true;
  if (pathname === item.path) return true;
  return item.aliases?.includes(pathname) || false;
}

function getInitials(value) {
  const parts = String(value || 'User').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function DashboardLayout() {
  const { session, role, logout, getProfile } = useAuth();
  const { unreadCount, togglePanel, showToast } = useNotifications();
  const { resetState } = useTickets();
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState('dashboard');
  const profile = getProfile();

  useEffect(() => {
    if (role === 'student') setView('dashboard');
  }, [location.pathname, role]);

  const routeMeta = useMemo(() => {
    if (view === 'account' || location.pathname === '/student/profile') {
      return ['Account Settings', 'Profile management'];
    }
    if (role === 'student') {
      if (location.pathname.startsWith('/student/complaints')) return ['Complaint History', 'Student workspace'];
      if (location.pathname === '/student/raise-complaint') return ['Raise Complaint', 'Student workspace'];
      if (location.pathname === '/student/notifications') return ['Notifications', 'Student workspace'];
      return ['Student Dashboard', 'Student portal'];
    }
    if (location.pathname.includes('/complaints')) return ['All Complaints', 'Ticket management'];
    if (location.pathname.includes('/analytics')) return ['Analytics', 'Service intelligence'];
    if (location.pathname.includes('/admin/controls')) return ['Administrative Controls', 'Master controls'];
    if (location.pathname.includes('/admin/users')) return ['User Management', 'Directory management'];
    return ROLE_META[role] || ROLE_META.student;
  }, [location.pathname, role, view]);

  const [title, eyebrow] = routeMeta;
  const handleLogout = () => { logout(); navigate('/login'); };
  const handleReset = () => { resetState(); showToast('Ticket data refreshed.'); };
  const handleAccount = () => {
    if (role === 'student') {
      navigate('/student/profile');
      return;
    }
    setView(v => v === 'account' ? 'dashboard' : 'account');
  };

  const showAccountPanel = view === 'account' && role !== 'student';
  const isOnComplaints = location.pathname.includes('/complaints');
  const isOnAnalytics = location.pathname.includes('/analytics');
  const isOnAdminControls = location.pathname.includes('/admin/controls');
  const isOnAdminUsers = location.pathname.includes('/admin/users');
  const isOnDashboard = !isOnComplaints && !isOnAnalytics && !isOnAdminControls && !isOnAdminUsers;
  const accountActive = showAccountPanel || location.pathname === '/student/profile';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] min-h-screen">
      <aside className="bg-sidebar text-[#f8fafc] p-4 lg:p-6 flex flex-col gap-4 lg:gap-7" aria-label="Primary navigation">
        <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => { setView('dashboard'); navigate(role === 'student' ? '/student/dashboard' : `/dashboard/${role}`); }} title="Go to Dashboard">
          <img src={logo} alt="Campus Care logo" className="w-13 h-13 rounded-lg object-contain bg-white flex-shrink-0" />
          <div>
            <strong className="block">CampusCare</strong>
            <span className="block mt-0.5 text-sidebar-muted text-[0.9rem]">Ticket escalation system</span>
          </div>
        </div>

        {role === 'student' ? (
          <nav className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2" aria-label="Student Workspace">
            <p className="col-span-full m-0 text-sidebar-label text-xs font-bold uppercase">Student Workspace</p>
            {studentNavItems.map(item => {
              const Icon = item.icon;
              const active = isActiveItem(location.pathname, item);
              return (
                <button
                  key={item.path}
                  className={[
                    'w-full min-h-[44px] px-3 py-2.5 border rounded-lg text-left transition-colors flex items-center gap-2.5',
                    active ? 'bg-sidebar-hover border-sidebar-border text-white' : 'bg-transparent border-transparent text-[#dbe5f4] hover:bg-sidebar-hover/40',
                  ].join(' ')}
                  onClick={() => { setView('dashboard'); navigate(item.path); }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        ) : (
          <>
            <nav className="grid gap-2" aria-label="Role workspaces">
              <p className="m-0 text-sidebar-label text-xs font-bold uppercase">Workspace</p>
              <span className="text-sidebar-muted text-sm leading-relaxed">Only your assigned dashboard is available.</span>
              {['student', 'staff', 'warden', 'admin'].map(r => (
                <button
                  key={r}
                  className={[
                    'w-full min-h-[44px] px-3 py-2.5 border rounded-lg text-left transition-colors flex items-center gap-2.5',
                    r === role && isOnDashboard ? 'bg-sidebar-hover border-sidebar-border text-white' : '',
                    r === role && !isOnDashboard ? 'bg-transparent border-transparent text-[#dbe5f4] hover:bg-sidebar-hover/40' : '',
                    r !== role ? 'hidden bg-transparent border-transparent text-[#dbe5f4]' : '',
                  ].join(' ')}
                  onClick={() => { setView('dashboard'); navigate('/dashboard/' + r); }}
                >
                  {sidebarRoleIcons[r]}
                  <span>{ROLE_USERS[r]?.label || r} Dashboard</span>
                </button>
              ))}
            </nav>

            <nav className="grid gap-2" aria-label="Pages">
              <p className="m-0 text-sidebar-label text-xs font-bold uppercase">Pages</p>
              <button
                onClick={() => { setView('dashboard'); navigate('/dashboard/complaints'); }}
                className={[
                  'w-full min-h-[44px] px-3 py-2.5 border rounded-lg text-left transition-colors flex items-center gap-2.5',
                  isOnComplaints ? 'bg-sidebar-hover border-sidebar-border text-white' : 'bg-transparent border-transparent text-[#dbe5f4] hover:bg-sidebar-hover/40',
                ].join(' ')}
              >
                <FileText size={18} />
                <span>All Complaints</span>
              </button>
              <button
                onClick={() => { setView('dashboard'); navigate('/dashboard/analytics'); }}
                className={[
                  'w-full min-h-[44px] px-3 py-2.5 border rounded-lg text-left transition-colors flex items-center gap-2.5',
                  isOnAnalytics ? 'bg-sidebar-hover border-sidebar-border text-white' : 'bg-transparent border-transparent text-[#dbe5f4] hover:bg-sidebar-hover/40',
                ].join(' ')}
              >
                <BarChart3 size={18} />
                <span>Analytics</span>
              </button>
              {role === 'admin' && (
                <>
                  <button
                    onClick={() => { setView('dashboard'); navigate('/dashboard/admin/users'); }}
                    className={[
                      'w-full min-h-[44px] px-3 py-2.5 border rounded-lg text-left transition-colors flex items-center gap-2.5',
                      isOnAdminUsers ? 'bg-sidebar-hover border-sidebar-border text-white' : 'bg-transparent border-transparent text-[#dbe5f4] hover:bg-sidebar-hover/40',
                    ].join(' ')}
                  >
                    <Users size={18} />
                    <span>User Management</span>
                  </button>
                  <button
                    onClick={() => { setView('dashboard'); navigate('/dashboard/admin/controls'); }}
                    className={[
                      'w-full min-h-[44px] px-3 py-2.5 border rounded-lg text-left transition-colors flex items-center gap-2.5',
                      isOnAdminControls ? 'bg-sidebar-hover border-sidebar-border text-white' : 'bg-transparent border-transparent text-[#dbe5f4] hover:bg-sidebar-hover/40',
                    ].join(' ')}
                  >
                    <ShieldCheck size={18} />
                    <span>Admin Controls</span>
                  </button>
                </>
              )}
            </nav>
          </>
        )}

        <div className="mt-auto hidden lg:grid gap-2 p-4 border border-sidebar-border rounded-lg bg-[#202d47]">
          <span className="flex items-center gap-1.5 text-sidebar-label text-xs font-bold uppercase">
            <Headset size={14} /> Service Desk
          </span>
          <strong className="flex items-center gap-1.5"><Clock size={14} /> 9:00 AM - 6:00 PM</strong>
          <span className="text-sidebar-muted leading-relaxed text-sm">Emergency issues are marked urgent automatically after review.</span>
        </div>
      </aside>

      <div className="min-w-0 flex flex-col">
        <header className="sticky top-0 z-10 min-h-[72px] flex items-center justify-between gap-4 px-7 py-4 bg-bg/92 border-b border-line backdrop-blur-sm relative">
          <div>
            <span className="text-sidebar-label text-xs font-bold uppercase">{eyebrow}</span>
            <h1 className="mt-1 m-0 text-[clamp(1.3rem,2.5vw,1.75rem)] leading-tight">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="min-h-[42px] flex items-center gap-2 px-3 py-1.5 border border-line rounded-lg bg-white">
              <div className="w-8 h-8 rounded-full bg-primary text-white grid place-items-center text-xs font-bold uppercase">
                {getInitials(profile.name || session.name)}
              </div>
              <div className="hidden sm:grid gap-px">
                <strong className="text-sm leading-tight whitespace-nowrap">{profile.name || 'User'}</strong>
                <span className="text-muted text-xs leading-tight whitespace-nowrap">{profile.userId || profile.label}</span>
              </div>
            </div>

            <button
              onClick={togglePanel}
              title="Alerts"
              className="relative w-10 h-10 rounded-lg border border-line bg-white text-ink grid place-items-center hover:bg-surface-soft transition-colors"
              aria-label="Open alerts"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full grid place-items-center bg-coral text-white text-[0.65rem] font-bold">
                  {unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={handleAccount}
              title={accountActive ? 'Back to dashboard' : 'Account'}
              className={[
                'w-10 h-10 rounded-lg border grid place-items-center transition-colors',
                accountActive ? 'border-primary bg-[#e9f0ff] text-primary-dark' : 'border-line bg-white text-[#344054] hover:bg-surface-soft',
              ].join(' ')}
            >
              {accountActive ? <LayoutDashboard size={18} /> : <User size={18} />}
            </button>

            {role !== 'student' && (
              <button
                onClick={handleReset}
                title="Refresh ticket data"
                className="w-10 h-10 rounded-lg border border-line bg-white text-[#344054] grid place-items-center hover:bg-surface-soft transition-colors"
              >
                <RotateCcw size={18} />
              </button>
            )}

            <button
              onClick={handleLogout}
              title="Logout"
              className="w-10 h-10 rounded-lg border border-line bg-white text-danger grid place-items-center hover:bg-[#fff0ee] transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>

          <NotificationPanel />
        </header>

        <main className="p-7 flex-grow">
          {showAccountPanel ? (
            <section className="grid grid-cols-1 lg:grid-cols-[minmax(240px,0.42fr)_minmax(0,1fr)] gap-5 items-start">
              <ProfileCard profile={profile} />
              <ProfileSettingsForm profile={profile} onBack={() => setView('dashboard')} />
            </section>
          ) : <Outlet />}
        </main>
      </div>
    </div>
  );
}
