import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '../services/apiHelper';
import { useAuth } from '../hooks/useAuth';

const TicketContext = createContext(null);

const DEFAULT_CATEGORIES = ['Hostel', 'Infrastructure', 'IT Services', 'Academic', 'Administrative'];

export function TicketProvider({ children }) {
  const { isLoggedIn, role } = useAuth();
  const [state, setStateRaw] = useState({
    tickets: [],
    categories: DEFAULT_CATEGORIES,
    staffMembers: [],
    users: [],
    selectedTicketId: null,
    filters: { status: 'All', priority: 'All', search: '', staffStatus: 'All', staffPriority: 'All', staffCategory: 'All' }
  });

  const updateState = useCallback((updater) => {
    setStateRaw(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      return next;
    });
  }, []);

  const fetchTicketsAndMetadata = useCallback(async () => {
    if (!isLoggedIn) return;

    let ticketsData = [];
    try {
      ticketsData = await api.get('/api/tickets');
    } catch (error) {
      console.error("Error fetching tickets", error);
    }
    
    let categoriesData = [];
    let usersData = [];
    if (role === 'admin') {
      try {
        categoriesData = await api.get('/api/admin/categories');
      } catch (e) {
        console.error("Admin fetch categories error", e);
      }
      try {
        usersData = await api.get('/api/admin/users');
      } catch (e) {
        console.error("Admin fetch users error", e);
      }
    }

    let staffList = [];
    try {
      const staffData = await api.get('/api/auth/staff');
      if (staffData && staffData.length > 0) {
        staffList = staffData
          .filter(s => s.status && s.status.toLowerCase() === 'active')
          .map(s => s.name);
      }
    } catch (e) {
      console.error("Staff fetch error", e);
    }

    const categoryNames = categoriesData.length > 0
      ? categoriesData.map(c => c.name)
      : DEFAULT_CATEGORIES;

    setStateRaw(prev => {
      const newTickets = ticketsData || [];
      let nextSelectedId = prev.selectedTicketId;
      if (nextSelectedId && !newTickets.some(t => t.id === nextSelectedId)) {
        nextSelectedId = null;
      }

      return {
        ...prev,
        tickets: newTickets,
        categories: categoryNames,
        users: usersData || [],
        staffMembers: staffList,
        selectedTicketId: nextSelectedId
      };
    });
  }, [isLoggedIn, role]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchTicketsAndMetadata();
      const timer = setInterval(fetchTicketsAndMetadata, 5000);
      return () => clearInterval(timer);
    } else {
      setStateRaw({
        tickets: [],
        categories: DEFAULT_CATEGORIES,
        staffMembers: [],
        users: [],
        selectedTicketId: null,
        filters: { status: 'All', priority: 'All', search: '', staffStatus: 'All', staffPriority: 'All', staffCategory: 'All' }
      });
    }
  }, [isLoggedIn, fetchTicketsAndMetadata]);

  const resetState = useCallback(async () => {
    // No-op or we can just fetch to refresh
    await fetchTicketsAndMetadata();
  }, [fetchTicketsAndMetadata]);

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
      await fetchTicketsAndMetadata();
      if (created && created.id) {
        updateState({ selectedTicketId: created.id });
      }
      return created;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [fetchTicketsAndMetadata, updateState]);

  const updateTicket = useCallback(async (ticketId, updates) => {
    try {
      let result;
      
      // 1. Assign ticket
      if (updates.assignee !== undefined) {
        result = await api.post(`/api/tickets/${ticketId}/assign`, { assignee: updates.assignee });
      } 
      // 2. Escalate ticket
      else if (updates.priority === 'Urgent') {
        result = await api.post(`/api/tickets/${ticketId}/escalate`, { reason: updates.reason || 'Escalated to urgent' });
      } 
      // 3. Update status (with optional notes/rating/proofImage/resolutionNotes)
      else if (updates.status !== undefined) {
        result = await api.post(`/api/tickets/${ticketId}/status`, {
          status: updates.status,
          notes: updates.notes || '',
          proofImage: updates.proofImage,
          resolutionNotes: updates.resolutionNotes
        });
        
        if (updates.rating !== undefined) {
          result = await api.put(`/api/tickets/${ticketId}`, { rating: parseFloat(updates.rating) });
        }
      } 
      // 4. Fallback general update
      else {
        result = await api.put(`/api/tickets/${ticketId}`, updates);
      }

      await fetchTicketsAndMetadata();
      return result;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [fetchTicketsAndMetadata]);

  const addComment = useCallback(async (ticketId, comment) => {
    try {
      // comment could be a string or a comment object containing the text
      const commentText = typeof comment === 'object' ? comment.text : comment;
      const result = await api.post(`/api/tickets/${ticketId}/comments`, { text: commentText });
      await fetchTicketsAndMetadata();
      return result;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [fetchTicketsAndMetadata]);

  const addTimelineEntry = useCallback(async (ticketId, entry) => {
    // Timeline entries are created on the backend automatically, so this is a local no-op
    await fetchTicketsAndMetadata();
  }, [fetchTicketsAndMetadata]);

  const setSelectedTicket = useCallback((ticketId) => {
    updateState({ selectedTicketId: ticketId });
  }, [updateState]);

  const setFilters = useCallback((filters) => {
    updateState(prev => ({ filters: { ...prev.filters, ...filters } }));
  }, [updateState]);

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
      await fetchTicketsAndMetadata();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [fetchTicketsAndMetadata]);

  const toggleUserStatus = useCallback(async (userId) => {
    try {
      if (!userId) return;
      await api.post(`/api/admin/users/${userId}/toggle`);
      await fetchTicketsAndMetadata();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [fetchTicketsAndMetadata]);

  const removeUser = useCallback(async (userId) => {
    try {
      if (!userId) return;
      await api.delete(`/api/admin/users/${userId}`);
      await fetchTicketsAndMetadata();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [fetchTicketsAndMetadata]);

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
      await fetchTicketsAndMetadata();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [fetchTicketsAndMetadata]);

  const uploadUserExcel = useCallback(async (file) => {
    try {
      if (!file) return;
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/api/admin/users/upload', formData);
      await fetchTicketsAndMetadata();
      return response;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [fetchTicketsAndMetadata]);

  const addCategory = useCallback(async (category) => {
    try {
      await api.post('/api/admin/categories', { name: category });
      await fetchTicketsAndMetadata();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }, [fetchTicketsAndMetadata]);

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
    if (!state.selectedTicketId) return null;
    return state.tickets.find(t => t.id === state.selectedTicketId) || null;
  }, [state.tickets, state.selectedTicketId]);

  return (
    <TicketContext.Provider value={{
      state, updateState, resetState,
      addTicket, updateTicket, addComment, addTimelineEntry,
      setSelectedTicket, setFilters, addUser, toggleUserStatus, removeUser, updateUser, uploadUserExcel, addCategory,
      getSelectedTicket, exportPdfReport
    }}>
      {children}
    </TicketContext.Provider>
  );
}

export const useTicketContext = () => useContext(TicketContext);
