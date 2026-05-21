import { api } from './apiHelper';

function toQueryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (value === 'All') return;
    query.set(key, value);
  });
  const text = query.toString();
  return text ? '?' + text : '';
}

export const studentComplaintService = {
  fetchComplaints: (params) => api.get('/api/student/complaints' + toQueryString(params)),
  fetchComplaint: (id) => api.get('/api/student/complaints/' + encodeURIComponent(id)),
  fetchByStatus: (status, params) => api.get('/api/student/complaints/status/' + encodeURIComponent(status) + toQueryString(params)),
  fetchByPriority: (priority, params) => api.get('/api/student/complaints/priority/' + encodeURIComponent(priority) + toQueryString(params)),
  searchComplaints: (search, params) => api.get('/api/student/complaints/search' + toQueryString({ ...params, query: search })),
};
