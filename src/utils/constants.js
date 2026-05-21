// Allowed email domains for signup
export const ALLOWED_DOMAINS = ['@kce.ac.in'];

// Role labels
export const ROLE_LABELS = {
  student: 'Student',
  staff: 'Staff / Technician',
  warden: 'Hostel Warden',
  admin: 'Administrator',
};

// Valid roles
export const VALID_ROLES = ['student', 'staff', 'warden', 'admin'];

// Role meta for dashboard titles
export const ROLE_META = {
  student: ['Student Dashboard', 'Student portal'],
  staff: ['Staff / Technician Panel', 'Resolution workspace'],
  warden: ['Hostel Warden Panel', 'Hostel operations'],
  admin: ['Admin Interface', 'Administration console'],
};

// Default profile data per role
export const PROFILE_DEFAULTS = {
  student: { name: 'Student User', email: 'student@example.com', userId: 'STU-001', department: 'Computer Science', phone: '9876543210' },
  staff: { name: 'Meera Nair', email: 'staff@example.com', userId: 'EMP-204', department: 'IT Services', phone: '9876543211' },
  warden: { name: 'Ravi Iyer', email: 'warden@example.com', userId: 'WRD-102', department: 'Hostel Block C', phone: '9876543212' },
  admin: { name: 'Priya Shah', email: 'admin@example.com', userId: '717823s146', department: 'Administration', phone: '9876543213' },
};

// Role users for display
export const ROLE_USERS = {
  student: { name: 'Student User', label: 'Student' },
  staff: { name: 'Meera Nair', label: 'Staff / Technician' },
  warden: { name: 'Ravi Iyer', label: 'Hostel Warden' },
  admin: { name: 'Priya Shah', label: 'Administrator' },
};

// Seed/demo data
export const SEED_DATA = {
  currentRole: 'student',
  currentView: 'dashboard',
  selectedTicketId: 'CC-1048',
  filters: { staffStatus: 'All', staffPriority: 'All', staffCategory: 'All' },
  categories: ['Hostel', 'Infrastructure', 'IT Services', 'Academic', 'Administrative'],
  staffMembers: ['Meera Nair', 'Karthik Rao', 'Anita Paul', 'Dinesh Kumar'],
  users: [
    { name: '717823s146', role: 'Student', department: 'Computer Science', status: 'Active' },
    { name: 'Meera Nair', role: 'Staff / Technician', department: 'IT Services', status: 'Active' },
    { name: 'Ravi Iyer', role: 'Hostel Warden', department: 'Hostel Block C', status: 'Active' },
    { name: 'Priya Shah', role: 'Administrator', department: 'Administration', status: 'Active' },
  ],
  notifications: [
    { id: 1, title: 'Ticket CC-1048 moved to In Progress', body: 'IT Services is checking the access point in Block C.', unread: true },
    { id: 2, title: 'Ticket CC-1045 assigned', body: 'Infrastructure team has accepted the classroom projector issue.', unread: true },
  ],
  tickets: [
    {
      id: 'CC-1048', title: 'Wi-Fi not working in hostel Block C', category: 'IT Services', priority: 'High', status: 'In Progress',
      owner: '717823s146', location: 'Hostel Block C, Room 214', assignee: 'Meera Nair', department: 'IT Services',
      created: '2026-05-12', due: '2026-05-19',
      description: 'The hostel Wi-Fi keeps disconnecting during evening study hours. Multiple students in the same floor are affected.',
      attachments: ['wifi-speed-test.png'], rating: null,
      timeline: [
        { title: 'Ticket opened', date: 'May 12, 2026', note: 'Student submitted the issue with supporting image.' },
        { title: 'Ticket assigned', date: 'May 13, 2026', note: 'Assigned to IT Services technician.' },
        { title: 'Work started', date: 'May 14, 2026', note: 'Technician is checking the hostel access point.' },
      ],
      comments: [
        { by: '717823s146', role: 'Student', text: 'The issue is worse after 7 PM.' },
        { by: 'Meera Nair', role: 'Staff', text: 'We are checking the router logs and signal strength today.' },
      ],
    },
    {
      id: 'CC-1047', title: 'Water leakage near hostel washroom', category: 'Hostel', priority: 'Urgent', status: 'Assigned',
      owner: 'Nisha Thomas', location: 'Hostel Block A, Floor 2', assignee: 'Karthik Rao', department: 'Hostel Maintenance',
      created: '2026-05-14', due: '2026-05-18',
      description: 'Water is leaking continuously near the washroom entrance and the floor is slippery.',
      attachments: ['leakage-photo.jpg'], rating: null,
      timeline: [
        { title: 'Ticket opened', date: 'May 14, 2026', note: 'Complaint marked urgent after review.' },
        { title: 'Ticket assigned', date: 'May 15, 2026', note: 'Assigned to hostel maintenance staff.' },
      ],
      comments: [{ by: 'Ravi Iyer', role: 'Hostel Warden', text: 'Maintenance staff should inspect this before evening.' }],
    },
    {
      id: 'CC-1045', title: 'Projector not displaying in seminar hall', category: 'Infrastructure', priority: 'Medium', status: 'Resolved',
      owner: 'Kiran Patel', location: 'Seminar Hall 2', assignee: 'Anita Paul', department: 'Infrastructure',
      created: '2026-05-09', due: '2026-05-17',
      description: 'The projector powers on but does not display HDMI input from laptops.',
      attachments: ['projector-panel.jpg', 'completion-proof.jpg'], rating: null,
      timeline: [
        { title: 'Ticket opened', date: 'May 9, 2026', note: 'Issue submitted by student representative.' },
        { title: 'Ticket assigned', date: 'May 10, 2026', note: 'Assigned to infrastructure support.' },
        { title: 'Resolved', date: 'May 16, 2026', note: 'HDMI switcher replaced and tested.' },
      ],
      comments: [{ by: 'Anita Paul', role: 'Staff', text: 'The switcher has been replaced. Please confirm the next class session works.' }],
    },
    {
      id: 'CC-1042', title: 'Internal marks not visible in portal', category: 'Academic', priority: 'Low', status: 'Closed',
      owner: '717823s146', location: 'Student Portal', assignee: 'Dinesh Kumar', department: 'Academic Office',
      created: '2026-05-03', due: '2026-05-10',
      description: 'The internal marks for Data Structures are missing in the student portal.',
      attachments: [], rating: 4,
      timeline: [
        { title: 'Ticket opened', date: 'May 3, 2026', note: 'Academic office received the complaint.' },
        { title: 'Resolved', date: 'May 8, 2026', note: 'Marks were synced from the department record.' },
        { title: 'Closed', date: 'May 9, 2026', note: 'Student rated the service.' },
      ],
      comments: [{ by: '717823s146', role: 'Student', text: 'Marks are visible now. Thank you.' }],
    },
  ],
};
