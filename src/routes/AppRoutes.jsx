import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import StudentPage from '../pages/StudentPage';
import StudentComplaintsPage from '../pages/StudentComplaintsPage';
import StudentRaiseComplaintPage from '../pages/StudentRaiseComplaintPage';
import StudentProfilePage from '../pages/StudentProfilePage';
import StaffPage from '../pages/StaffPage';
import WardenPage from '../pages/WardenPage';
import AdminPage from '../pages/AdminPage';
import AdminControlsPage from '../pages/AdminControlsPage';
import AdminUserManagementPage from '../pages/AdminUserManagementPage';
import NotificationsPage from '../pages/NotificationsPage';
import ComplaintsPage from '../pages/ComplaintsPage';
import AnalyticsPage from '../pages/AnalyticsPage';
import DashboardLayout from '../layouts/DashboardLayout';
import TicketListPage from '../components/tickets/TicketListPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { isLoggedIn, role } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function RoleRedirect() {
  const { role } = useAuth();
  const paths = {
    student: '/student/dashboard',
    staff: '/dashboard/staff',
    warden: '/dashboard/warden',
    admin: '/dashboard/admin',
  };
  return <Navigate to={paths[role] || '/dashboard'} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentPage />} />
        <Route path="raise-complaint" element={<StudentRaiseComplaintPage />} />
        <Route path="complaints" element={<StudentComplaintsPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="tickets/:filter" element={<TicketListPage />} />
      </Route>

      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<RoleRedirect />} />
        <Route path="student" element={<StudentPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="warden" element={<WardenPage />} />
        <Route path="admin" element={<AdminPage />} />
        <Route path="admin/controls" element={<ProtectedRoute allowedRoles={['admin']}><AdminControlsPage /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserManagementPage /></ProtectedRoute>} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="tickets/:filter" element={<TicketListPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
