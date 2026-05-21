import React, { createContext, useContext, useState, useCallback } from 'react';
import { ROLE_USERS, PROFILE_DEFAULTS, VALID_ROLES } from '../utils/constants';
import { api } from '../services/apiHelper';

const AuthContext = createContext(null);

function getStoredSession() {
  try {
    return JSON.parse(localStorage.getItem('campuscare-session')) || {};
  } catch { return {}; }
}

export function AuthProvider({ children }) {
  const [session, setSessionState] = useState(getStoredSession);

  const isLoggedIn = !!session.loggedIn;
  const role = VALID_ROLES.includes(session.role) ? session.role : 'student';

  const setSession = useCallback((data) => {
    setSessionState(data);
    localStorage.setItem('campuscare-session', JSON.stringify(data));
  }, []);

  const login = useCallback(async (email, password, role) => {
    try {
      const data = await api.post('/api/auth/login', { email, password, role });

      const token = data.accessToken || data.token;
      if (token) localStorage.setItem('campuscare-token', token);

      const normalizedRole = data.role.toLowerCase();
      const sessionData = {
        loggedIn: true,
        role: normalizedRole,
        name: data.name || data.userId,
        label: ROLE_USERS[normalizedRole]?.label || data.role,
        loginId: data.email,
        userId: data.userId,
        department: data.department,
        phone: data.phone,
        status: data.status
      };

      setSession(sessionData);
      return { success: true };
    } catch (error) {
      return { error: error.message || 'Login failed' };
    }
  }, [setSession]);

  const signup = useCallback(async (formData) => {
    try {
      await api.post('/api/auth/signup', formData);
      return await login(formData.email, formData.password, formData.role);
    } catch (error) {
      return { error: error.message || 'Registration failed' };
    }
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {}
    localStorage.removeItem('campuscare-session');
    localStorage.removeItem('campuscare-token');
    setSessionState({});
  }, []);

  const getProfile = useCallback(() => {
    const defaults = PROFILE_DEFAULTS[role] || PROFILE_DEFAULTS.student;
    return {
      role,
      label: ROLE_USERS[role]?.label || 'Portal user',
      name: session.name || defaults.name,
      email: session.loginId || defaults.email,
      userId: session.userId || defaults.userId,
      department: session.department || defaults.department,
      phone: session.phone || defaults.phone,
    };
  }, [role, session]);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const updatedUser = await api.put('/api/auth/profile', {
        name: profileData.name,
        phone: profileData.phone,
        department: profileData.department,
      });

      const newSession = {
        ...session,
        name: updatedUser.name || updatedUser.userId,
        loginId: updatedUser.email,
        userId: updatedUser.userId,
        department: updatedUser.department,
        phone: updatedUser.phone,
      };
      setSession(newSession);
      return { success: true };
    } catch (error) {
      return { error: error.message || 'Failed to update profile' };
    }
  }, [session, setSession]);

  return (
    <AuthContext.Provider value={{ session, isLoggedIn, role, login, signup, logout, getProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
