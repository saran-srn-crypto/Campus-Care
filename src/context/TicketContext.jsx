import React, { createContext, useContext } from 'react';
import { useDashboardContext } from './DashboardContext';

const TicketContext = createContext(null);

export function TicketProvider({ children }) {
  const dashboard = useDashboardContext();

  // Re-construct the state object structure expected by consumers of useTicketContext
  const state = {
    tickets: dashboard?.tickets || [],
    categories: dashboard?.categories || [],
    staffMembers: dashboard?.staffMembers || [],
    users: dashboard?.users || [],
    selectedTicketId: dashboard?.selectedTicketId || null,
    filters: dashboard?.filters || { status: 'All', priority: 'All', search: '', staffStatus: 'All', staffPriority: 'All', staffCategory: 'All' }
  };

  const updateState = (updater) => {
    // If anything tries to update selectedTicketId or filters directly via updateState, map it.
    if (typeof updater === 'function') {
      const next = updater(state);
      if (next.selectedTicketId !== state.selectedTicketId) {
        dashboard?.setSelectedTicket(next.selectedTicketId);
      }
      if (next.filters !== state.filters) {
        dashboard?.setFilters(next.filters);
      }
    } else {
      if (updater.selectedTicketId !== undefined) {
        dashboard?.setSelectedTicket(updater.selectedTicketId);
      }
      if (updater.filters !== undefined) {
        dashboard?.setFilters(updater.filters);
      }
    }
  };

  const resetState = dashboard?.resetState;
  const addTicket = dashboard?.addTicket;
  const updateTicket = dashboard?.updateTicket;
  const addComment = dashboard?.addComment;
  const addTimelineEntry = dashboard?.addTimelineEntry;
  const setSelectedTicket = dashboard?.setSelectedTicket;
  const setFilters = dashboard?.setFilters;
  const addUser = dashboard?.addUser;
  const toggleUserStatus = dashboard?.toggleUserStatus;
  const removeUser = dashboard?.removeUser;
  const updateUser = dashboard?.updateUser;
  const uploadUserExcel = dashboard?.uploadUserExcel;
  const addCategory = dashboard?.addCategory;
  const getSelectedTicket = dashboard?.getSelectedTicket;
  const exportPdfReport = dashboard?.exportPdfReport;

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
