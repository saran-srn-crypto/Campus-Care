import { SEED_DATA } from '../utils/constants';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const USE_MOCK = false; // Set to false to connect to the backend microservices again

/* ─── Client-side In-memory Mock Database for Disconnected Mode ─── */
let mockTickets = [...(SEED_DATA?.tickets || [])];
let mockUsers = [
  { userId: 'STU-001', name: 'Student User', email: 'student@example.com', role: 'student', department: 'Computer Science', phone: '9876543210', status: 'Active' },
  { userId: 'EMP-204', name: 'Meera Nair', email: 'staff@example.com', role: 'staff', department: 'IT Services', phone: '9876543211', status: 'Active' },
  { userId: 'WRD-102', name: 'Ravi Iyer', email: 'warden@example.com', role: 'warden', department: 'Hostel Block C', phone: '9876543212', status: 'Active' },
  { userId: '717823s146', name: 'Saran', email: '717823s146@kce.ac.in', role: 'admin', department: 'Administration', phone: '9876543213', status: 'Active' }
];
let mockCategories = [
  { name: 'Hostel' },
  { name: 'Infrastructure' },
  { name: 'IT Services' },
  { name: 'Academic' },
  { name: 'Administrative' }
];
let mockNotifications = [
  { id: 1, title: 'Ticket CC-1048 moved to In Progress', body: 'IT Services is checking the access point in Block C.', unread: true },
  { id: 2, title: 'Ticket CC-1045 assigned', body: 'Infrastructure team has accepted the classroom projector issue.', unread: true },
];

// Current logged-in mock session user reference
let currentUser = mockUsers[3]; // Default to seeded admin

function simulateRequest(method, originalPath, body = null, isBlob = false) {
  // Console logging for clear feedback to developers
  console.log(`[MOCK API] ${method} ${originalPath}`, body);

  let path = originalPath;
  let queryParams = {};
  if (originalPath.includes('?')) {
    const parts = originalPath.split('?');
    path = parts[0];
    const searchParams = new URLSearchParams(parts[1]);
    for (const [key, value] of searchParams.entries()) {
      queryParams[key] = value;
    }
  }

  // Login handler
  if (path === '/api/auth/login' && method === 'POST') {
    const { email, role: requestedRole } = body;
    let matchedUser = mockUsers.find(u => u.userId === email || u.email === email);
    
    let targetRole = requestedRole ? requestedRole.toLowerCase() : 'user';
    if (targetRole === 'user') {
      if (matchedUser) {
        if (matchedUser.role.toLowerCase() === 'admin') {
          throw new Error("Admin logins are only permitted through the Admin Portal.");
        }
        targetRole = matchedUser.role.toLowerCase();
      } else if (email === '717823s146' || email.toLowerCase().includes('admin')) {
        throw new Error("Admin logins are only permitted through the Admin Portal.");
      } else {
        targetRole = 'student';
      }
    }

    if (!matchedUser) {
      if (email === '717823s146') {
        matchedUser = { ...mockUsers[3], role: targetRole };
      } else {
        matchedUser = {
          userId: email,
          name: email.split('@')[0] || email,
          email: email.includes('@') ? email : `${email}@kce.ac.in`,
          role: targetRole,
          department: 'Computer Science',
          phone: '9876543210',
          status: 'Active'
        };
      }
    } else {
      matchedUser = { ...matchedUser, role: targetRole };
    }
    currentUser = matchedUser;
    
    // Save back to mockUsers
    const idx = mockUsers.findIndex(u => u.userId === matchedUser.userId);
    if (idx >= 0) mockUsers[idx] = matchedUser;
    else mockUsers.push(matchedUser);

    return {
      token: `mock-jwt-token-for-${matchedUser.role}`,
      userId: matchedUser.userId,
      email: matchedUser.email,
      role: matchedUser.role,
      name: matchedUser.name,
      label: `${matchedUser.role.charAt(0).toUpperCase() + matchedUser.role.slice(1)} ID`
    };
  }

  // Signup handler
  if (path === '/api/auth/signup' && method === 'POST') {
    const newUser = {
      userId: body.userId,
      email: body.email,
      role: body.role,
      name: body.name,
      department: body.department,
      phone: body.phone,
      status: 'Active'
    };
    mockUsers.push(newUser);
    return newUser;
  }

  // Logout handler
  if (path === '/api/auth/logout' && method === 'POST') {
    return { success: true };
  }

  // Profile get handler
  if (path === '/api/auth/profile' && method === 'GET') {
    return currentUser;
  }

  // Profile update handler
  if (path === '/api/auth/profile' && method === 'PUT') {
    currentUser = {
      ...currentUser,
      name: body.name,
      phone: body.phone,
      department: body.department
    };
    const idx = mockUsers.findIndex(u => u.userId === currentUser.userId);
    if (idx >= 0) mockUsers[idx] = currentUser;
    return currentUser;
  }

  // Get tickets handler
  if (path === '/api/tickets' && method === 'GET') {
    if (currentUser.role === 'student') {
      // Students only see their own tickets
      return mockTickets.filter(t => t.owner === currentUser.name || t.owner === currentUser.userId);
    }
    // Warden, Staff, and Admin all see ALL tickets so student complaints are visible across dashboards
    return mockTickets;
  }

  // Create ticket handler
  if (path === '/api/tickets' && method === 'POST') {
    const newTicket = {
      id: `CC-${Math.floor(1000 + Math.random() * 9000)}`,
      title: body.title,
      category: body.category,
      priority: body.priority,
      status: 'Open',
      owner: currentUser.name || currentUser.userId,
      location: body.location,
      assignee: '',
      assignedStaff: '',
      department: body.category,
      created: new Date().toISOString().split('T')[0],
      due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: body.description,
      attachments: body.attachments || [],
      rating: null,
      timeline: [
        { title: 'Ticket opened', date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), note: 'Student submitted the complaint.' }
      ],
      comments: []
    };
    mockTickets.push(newTicket);
    return newTicket;
  }

  // Assign ticket handler
  if (path.startsWith('/api/tickets/') && path.endsWith('/assign') && method === 'POST') {
    const ticketId = path.split('/')[3];
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.assignee = body.assignee;
      ticket.assignedStaff = body.assignee;
      ticket.status = 'Assigned';
      ticket.timeline.push({
        title: 'Ticket assigned',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        note: `Assigned to ${body.assignee}.`
      });
    }
    return ticket;
  }

  // Escalate ticket handler
  if (path.startsWith('/api/tickets/') && path.endsWith('/escalate') && method === 'POST') {
    const ticketId = path.split('/')[3];
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.priority = 'Urgent';
      ticket.timeline.push({
        title: 'Ticket escalated',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        note: body.reason || 'Escalated to urgent priority.'
      });
    }
    return ticket;
  }

  // Ticket status update handler
  if (path.startsWith('/api/tickets/') && path.endsWith('/status') && method === 'POST') {
    const ticketId = path.split('/')[3];
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.status = body.status;
      if (body.proofImage !== undefined) {
        ticket.proofImage = body.proofImage;
      }
      if (body.resolutionNotes !== undefined) {
        ticket.resolutionNotes = body.resolutionNotes;
      }
      ticket.timeline.push({
        title: `Status updated to ${body.status}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        note: body.notes || `Status changed to ${body.status}.`
      });
    }
    return ticket;
  }

  // Comments handler
  if (path.startsWith('/api/tickets/') && path.endsWith('/comments') && method === 'POST') {
    const ticketId = path.split('/')[3];
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (ticket) {
      const comment = {
        by: currentUser.name || currentUser.userId,
        role: currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1),
        text: body.text
      };
      if (!ticket.comments) ticket.comments = [];
      ticket.comments.push(comment);
    }
    return ticket;
  }

  // Get student complaints handler
  if (path === '/api/student/complaints' && method === 'GET') {
    let list = mockTickets.filter(t => t.owner === currentUser.name || t.owner === currentUser.userId);
    
    const search = queryParams.search;
    const status = queryParams.status;
    const priority = queryParams.priority;
    const category = queryParams.category;
    
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t => t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    }
    if (status && status !== 'All') {
      if (status === 'Active') {
        list = list.filter(t => ['Open', 'Assigned', 'In Progress'].includes(t.status));
      } else {
        list = list.filter(t => t.status === status);
      }
    }
    if (priority && priority !== 'All') {
      list = list.filter(t => t.priority === priority);
    }
    if (category && category !== 'All') {
      list = list.filter(t => t.category === category);
    }
    
    // Sort
    const sort = queryParams.sort || 'Latest';
    list = [...list].sort((a, b) => {
      const aDate = new Date(a.updatedAt || a.created || 0).getTime();
      const bDate = new Date(b.updatedAt || b.created || 0).getTime();
      return sort === 'Latest' ? bDate - aDate : aDate - bDate;
    });

    return list;
  }

  // Get single student complaint
  if (path.startsWith('/api/student/complaints/') && method === 'GET') {
    const ticketId = path.split('/')[4];
    return mockTickets.find(t => t.id === ticketId);
  }

  // General ticket update (rating, details, proof of completion)
  if (path.startsWith('/api/tickets/') && method === 'PUT') {
    const ticketId = path.split('/')[3];
    const ticket = mockTickets.find(t => t.id === ticketId);
    if (ticket) {
      Object.assign(ticket, body);
    }
    return ticket;
  }

  // Get admin categories
  if (path === '/api/admin/categories' && method === 'GET') {
    return mockCategories;
  }

  // Add admin category
  if (path === '/api/admin/categories' && method === 'POST') {
    const newCat = { name: body.name };
    mockCategories.push(newCat);
    return newCat;
  }

  // Get admin users list
  if (path === '/api/admin/users' && method === 'GET') {
    return mockUsers;
  }

  // Add admin user
  if (path === '/api/admin/users' && method === 'POST') {
    const newUser = {
      userId: body.userId,
      email: body.email,
      role: body.role,
      name: body.name,
      department: body.department,
      phone: body.phone,
      status: 'Active'
    };
    mockUsers.push(newUser);
    return newUser;
  }

  // Batch upload users via Excel
  if (path === '/api/admin/users/upload' && method === 'POST') {
    const mockImported = [
      { userId: 'STU-990', name: 'Albus Dumbledore', email: 'albus@kce.ac.in', role: 'student', department: 'Gryffindor', phone: '9901234567', status: 'Active' },
      { userId: 'EMP-991', name: 'Severus Snape', email: 'severus@kce.ac.in', role: 'staff', department: 'Potions', phone: '9911234567', status: 'Active' },
      { userId: 'WRD-992', name: 'Minerva McGonagall', email: 'minerva@kce.ac.in', role: 'warden', department: 'Hostel Block G', phone: '9921234567', status: 'Active' }
    ];
    const addedCount = mockImported.filter(imp => {
      if (!mockUsers.some(u => u.userId === imp.userId)) {
        mockUsers.push(imp);
        return true;
      }
      return false;
    }).length;

    return {
      message: "Excel import completed successfully (Mock Mode).",
      importedCount: addedCount,
      skippedCount: mockImported.length - addedCount,
      skippedUserIds: mockImported.filter(imp => mockUsers.some(u => u.userId === imp.userId)).map(u => u.userId)
    };
  }

  // Toggle user status
  if (path.startsWith('/api/admin/users/') && path.endsWith('/toggle') && method === 'POST') {
    const userId = path.split('/')[4];
    const user = mockUsers.find(u => u.userId === userId);
    if (user) {
      if (userId === '717823s146' || user.email === '717823s146@kce.ac.in') {
        throw new Error("The primary admin account status cannot be deactivated.");
      }
      user.status = user.status === 'Active' ? 'Inactive' : 'Active';
    }
    return user;
  }

  // Delete admin user
  if (path.startsWith('/api/admin/users/') && method === 'DELETE') {
    const userId = path.split('/')[4];
    const user = mockUsers.find(u => u.userId === userId);
    if (userId === '717823s146' || (user && user.email === '717823s146@kce.ac.in')) {
      throw new Error("The primary admin account cannot be deleted.");
    }
    const idx = mockUsers.findIndex(u => u.userId === userId);
    if (idx >= 0) {
      mockUsers.splice(idx, 1);
    }
    return { message: "User deleted successfully" };
  }

  // Update admin user
  if (path.startsWith('/api/admin/users/') && method === 'PUT') {
    const userId = path.split('/')[4];
    const user = mockUsers.find(u => u.userId === userId);
    if (user) {
      if (userId === '717823s146' || user.email === '717823s146@kce.ac.in') {
        if (body.role && body.role.toLowerCase() !== 'admin') {
          throw new Error("The primary admin account role cannot be changed.");
        }
        if (body.email && body.email !== '717823s146@kce.ac.in') {
          throw new Error("The primary admin email cannot be changed.");
        }
        if (body.userId && body.userId !== '717823s146') {
          throw new Error("The primary admin User ID cannot be changed.");
        }
      }
      if (body.email) user.email = body.email;
      if (body.name) user.name = body.name;
      if (body.role) user.role = body.role.toLowerCase();
      if (body.department) user.department = body.department;
      if (body.phone) user.phone = body.phone;
      if (body.status) user.status = body.status;
      if (body.password) user.password = body.password;
    }
    return user;
  }

  // Get staff members list
  if (path === '/api/auth/staff' && method === 'GET') {
    return mockUsers.filter(u => u.role === 'staff');
  }

  // Download reports PDF
  if (path === '/api/admin/reports/pdf' && method === 'GET') {
    if (isBlob) {
      return new Blob(["Mock PDF Report Content"], { type: 'application/pdf' });
    }
    return null;
  }

  // Get notifications
  if (path === '/api/notifications' && method === 'GET') {
    return mockNotifications;
  }

  // Create notification
  if (path === '/api/notifications' && method === 'POST') {
    const newNotif = {
      id: mockNotifications.length + 1,
      title: body.title,
      body: body.body,
      unread: true
    };
    mockNotifications.unshift(newNotif);
    return newNotif;
  }

  // Read all notifications
  if (path === '/api/notifications/read-all' && method === 'POST') {
    mockNotifications.forEach(n => n.unread = false);
    return { success: true };
  }

  return null;
}

/* ─── Standard Network Connection Fetch Layer ─── */
async function request(method, path, body = null, isBlob = false) {
  if (USE_MOCK) {
    // Return mock data immediately after a tiny 150ms delay to simulate network latency
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          resolve(simulateRequest(method, path, body, isBlob));
        } catch (e) {
          reject(e);
        }
      }, 150);
    });
  }

  const token = localStorage.getItem('campuscare-token');
  const headers = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    if (body instanceof FormData) {
      options.body = body;
    } else {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(body);
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, options);

  if (!response.ok) {
    let errorMsg = 'An error occurred';
    try {
      const errData = await response.json();
      errorMsg = errData.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  if (isBlob) {
    return response.blob();
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
  download: (path) => request('GET', path, null, true),
};
