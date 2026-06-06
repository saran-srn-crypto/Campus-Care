import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { api } from '../services/apiHelper';
import { useAuth } from '../hooks/useAuth';

const DashboardContext = createContext(null);

const DEFAULT_CATEGORIES = ['Hostel', 'Infrastructure', 'IT Services', 'Academic', 'Administrative'];

export function DashboardProvider({ children }) {
  const { isLoggedIn, role } = useAuth();
  
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [users, setUsers] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [filters, setFilters] = useState({
    status: 'All', priority: 'All', search: '', staffStatus: 'All', staffPriority: 'All', staffCategory: 'All'
  });
  
  const [notifications, setNotifications] = useState([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', visible: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Request deduplication ref
  const fetchPromiseRef = useRef(null);

  const fetchDashboardData = useCallback(async (isSilent = false) => {
    if (!isLoggedIn) return;

    // Deduplicate concurrent requests
    if (fetchPromiseRef.current) {
      return fetchPromiseRef.current;
    }

    if (!isSilent) {
      setLoading(true);
    }

    const fetchPromise = (async () => {
      try {
        const promises = [
          api.get('/api/tickets'),
          api.get('/api/auth/staff'),
          api.get('/api/notifications')
        ];

        if (role === 'admin') {
          promises.push(api.get('/api/admin/categories'));
          promises.push(api.get('/api/admin/users'));
        }

        const results = await Promise.all(promises);
        
        const ticketsData = results[0] || [];
        const staffData = results[1] || [];
        const notificationsData = results[2] || [];
        
        let categoriesData = [];
        let usersData = [];
        if (role === 'admin') {
          categoriesData = results[3] || [];
          usersData = results[4] || [];
        }

        const staffList = staffData
          .filter(s => s.status && s.status.toLowerCase() === 'active')
          .map(s => s.name);

        const categoryNames = categoriesData.length > 0
          ? categoriesData.map(c => c.name)
          : DEFAULT_CATEGORIES;

        setTickets(ticketsData);
        setStaffMembers(staffList);
        setNotifications(notificationsData);
        setCategories(categoryNames);
        setUsers(usersData);
        setError('');
      } catch (err) {
        console.error("Dashboard fetch error", err);
        setError('Failed to fetch dashboard data.');
      } finally {
        if (!isSilent) {
          setLoading(false);
        }
      }
    })();

    fetchPromiseRef.current = fetchPromise;
    
    fetchPromise.finally(() => {
      fetchPromiseRef.current = null;
    });

    return fetchPromise;
  }, [isLoggedIn, role]);

  useEffect(() => {
    let intervalId = null;
    if (isLoggedIn) {
      // Fetch once immediately
      fetchDashboardData(false);
      
      // Coordinated background polling interval (reduced to 20 seconds to save network traffic)
      intervalId = setInterval(() => {
        fetchDashboardData(true);
      }, 20000);
    } else {
      // Clean up and reset states
      setTickets([]);
      setCategories(DEFAULT_CATEGORIES);
      setUsers([]);
      setStaffMembers([]);
      setNotifications([]);
      setSelectedTicketId(null);
      setFilters({
        status: 'All', priority: 'All', search: '', staffStatus: 'All', staffPriority: 'All', staffCategory: 'All'
      });
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoggedIn, fetchDashboardData]);

  const resetState = useCallback(async () => {
    await fetchDashboardData(false);
  }, [fetchDashboardData]);

  const addTicket = useCallback(async (ticket) => {
    try {
      const created = await api.post('/api/tickets', {
        title: ticket.title,
        category: ticket.category,
        priority: ticket.priority,
        description: ticket.description,
        location: ticket.location,
        attachments: ticket.attachments || []
      });
      await fetchDashboardData(true);
      if (created && created.id) {
        setSelectedTicketId(created.id);
      }
      return created;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [fetchDashboardData]);

  const updateTicket = useCallback(async (ticketId, updates) => {
    try {
      let result;
      if (updates.assignee !== undefined) {
        result = await api.post(`/api/tickets/${ticketId}/assign`, { assignee: updates.assignee });
      } else if (updates.priority === 'Urgent') {
        result = await api.post(`/api/tickets/${ticketId}/escalate`, { reason: updates.reason || 'Escalated to urgent' });
      } else if (updates.status !== undefined) {
        result = await api.post(`/api/tickets/${ticketId}/status`, {
          status: updates.status,
          notes: updates.notes || '',
          proofImage: updates.proofImage,
          resolutionNotes: updates.resolutionNotes
        });
        if (updates.rating !== undefined) {
          result = await api.put(`/api/tickets/${ticketId}`, { rating: parseFloat(updates.rating) });
        }
      } else {
        result = await api.put(`/api/tickets/${ticketId}`, updates);
      }
      await fetchDashboardData(true);
      return result;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [fetchDashboardData]);

  const addComment = useCallback(async (ticketId, comment) => {
    try {
      const commentText = typeof comment === 'object' ? comment.text : comment;
      const result = await api.post(`/api/tickets/${ticketId}/comments`, { text: commentText });
      await fetchDashboardData(true);
      return result;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [fetchDashboardData]);

  const addTimelineEntry = useCallback(async (ticketId, entry) => {
    await fetchDashboardData(true);
  }, [fetchDashboardData]);

  const setSelectedTicket = useCallback((ticketId) => {
    setSelectedTicketId(ticketId);
  }, []);

  const setFiltersCallback = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const addUser = useCallback(async (userForm) => {
    try {
      let mappedRole = 'student';
      const roleLower = userForm.role.toLowerCase();
      if (roleLower.includes('staff') || roleLower.includes('tech')) mappedRole = 'staff';
      else if (roleLower.includes('warden')) mappedRole = 'warden';
      else if (roleLower.includes('admin')) mappedRole = 'admin';

      const cleanName = userForm.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const userId = userForm.userId || (mappedRole === 'student' ? `STU-${Math.floor(100 + Math.random() * 900)}` : `EMP-${Math.floor(200 + Math.random() * 800)}`);
      const email = userForm.email || `${cleanName || 'user'}@kce.ac.in`;
      const password = userForm.password || 'password';
      const phone = userForm.phone || '9876543210';
      
      const payload = {
        userId,
        email,
        password,
        role: mappedRole,
        name: userForm.name,
        department: userForm.department,
        phone,
        label: userForm.role
      };

      await api.post('/api/admin/users', payload);
      await fetchDashboardData(true);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [fetchDashboardData]);

  const toggleUserStatus = useCallback(async (userId) => {
    try {
      if (!userId) return;
      await api.post(`/api/admin/users/${userId}/toggle`);
      await fetchDashboardData(true);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [fetchDashboardData]);

  const removeUser = useCallback(async (userId) => {
    try {
      if (!userId) return;
      await api.delete(`/api/admin/users/${userId}`);
      await fetchDashboardData(true);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [fetchDashboardData]);

  const updateUser = useCallback(async (userId, userForm) => {
    try {
      let mappedRole = 'student';
      const roleLower = userForm.role.toLowerCase();
      if (roleLower.includes('staff') || roleLower.includes('tech')) mappedRole = 'staff';
      else if (roleLower.includes('warden')) mappedRole = 'warden';
      else if (roleLower.includes('admin')) mappedRole = 'admin';

      const payload = {
        userId: userForm.userId,
        email: userForm.email,
        password: userForm.password,
        role: mappedRole,
        name: userForm.name,
        department: userForm.department,
        phone: userForm.phone
      };

      await api.put(`/api/admin/users/${userId}`, payload);
      await fetchDashboardData(true);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [fetchDashboardData]);

  const uploadUserExcel = useCallback(async (file) => {
    try {
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/api/admin/users/upload', formData);
      await fetchDashboardData(true);
      return response;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [fetchDashboardData]);

  const addCategory = useCallback(async (category) => {
    try {
      await api.post('/api/admin/categories', { name: category });
      await fetchDashboardData(true);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [fetchDashboardData]);

  const exportPdfReport = useCallback(async () => {
    try {
      const blob = await api.download('/api/admin/reports/pdf');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'campus_care_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error("PDF download failed", e);
      throw e;
    }
  }, []);

  const getSelectedTicket = useCallback(() => {
    if (!selectedTicketId) return null;
    return tickets.find(t => t.id === selectedTicketId) || null;
  }, [tickets, selectedTicketId]);

  const addNotification = useCallback(async (title, body) => {
    try {
      await api.post('/api/notifications', { title, body, recipient: 'all' });
      await fetchDashboardData(true);
    } catch (e) {
      console.error(e);
    }
  }, [fetchDashboardData]);

  const markAllRead = useCallback(async () => {
    try {
      await api.post('/api/notifications/read-all');
      await fetchDashboardData(true);
    } catch (e) {
      console.error(e);
    }
  }, [fetchDashboardData]);

  const togglePanel = useCallback(async () => {
    setPanelOpen(prev => {
      const next = !prev;
      if (next) {
        markAllRead();
      }
      return next;
    });
  }, [markAllRead]);

  const showToast = useCallback((message) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 2200);
  }, []);

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <DashboardContext.Provider value={{
      tickets, categories, users, staffMembers, selectedTicketId, filters,
      notifications, panelOpen, toast, unreadCount, loading, error,
      resetState, addTicket, updateTicket, addComment, addTimelineEntry,
      setSelectedTicket, setFilters: setFiltersCallback, addUser, toggleUserStatus,
      removeUser, updateUser, uploadUserExcel, addCategory, getSelectedTicket,
      exportPdfReport, addNotification, markAllRead, togglePanel, setPanelOpen, showToast
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboardContext = () => useContext(DashboardContext);
