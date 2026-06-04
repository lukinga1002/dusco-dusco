const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('dusco_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  verifyOtp: (body) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Wallets
  getWallets: () => request('/wallets'),
  createWallet: (body) => request('/wallets', { method: 'POST', body: JSON.stringify(body) }),
  updateWallet: (id, body) => request(`/wallets/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  rebalance: (allocations) => request('/wallets/batch/rebalance', { method: 'PUT', body: JSON.stringify({ allocations }) }),
  deleteWallet: (id, body) => request(`/wallets/${id}`, { method: 'DELETE', body: JSON.stringify(body) }),

  // Transactions
  deposit: (body) => request('/transactions/deposit', { method: 'POST', body: JSON.stringify(body) }),
  withdraw: (body) => request('/transactions/withdraw', { method: 'POST', body: JSON.stringify(body) }),
  getTransactions: (params = '') => request(`/transactions${params ? '?' + params : ''}`),
  feePreview: (params) => request(`/transactions/fee-preview?${params}`),

  // Dividends
  getDividendProjection: () => request('/dividends/projection'),
  getDividendHistory: () => request('/dividends/history'),

  // Groups
  getGroups: () => request('/groups'),
  createGroup: (body) => request('/groups', { method: 'POST', body: JSON.stringify(body) }),
  getGroup: (id) => request(`/groups/${id}`),
  groupContribute: (id, body) => request(`/groups/${id}/contribute`, { method: 'POST', body: JSON.stringify(body) }),
  groupWithdraw: (id, body) => request(`/groups/${id}/withdraw`, { method: 'POST', body: JSON.stringify(body) }),
  getGroupMembers: (id) => request(`/groups/${id}/members`),
  getGroupTransactions: (id, params = '') => request(`/groups/${id}/transactions${params ? '?' + params : ''}`),
  inviteToGroup: (id, phone) => request(`/groups/${id}/invite`, { method: 'POST', body: JSON.stringify({ phone }) }),

  // Notifications
  getNotifications: () => request('/notifications'),
  markRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => request('/notifications/batch/read-all', { method: 'PUT' }),

  // Admin
  adminLogin: (username, password) => request('/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  adminDistributeDividends: () => {
    const token = localStorage.getItem('dusco_admin_token');
    return request('/admin/dividends/distribute', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  },
  adminDashboard: () => {
    const token = localStorage.getItem('dusco_admin_token');
    return request('/admin/dashboard', { headers: { Authorization: `Bearer ${token}` } });
  },
  adminUsers: () => {
    const token = localStorage.getItem('dusco_admin_token');
    return request('/admin/users', { headers: { Authorization: `Bearer ${token}` } });
  },
  adminUserDetail: (id) => {
    const token = localStorage.getItem('dusco_admin_token');
    return request(`/admin/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  },
  adminTransactions: (params = '') => {
    const token = localStorage.getItem('dusco_admin_token');
    return request(`/admin/transactions${params ? '?' + params : ''}`, { headers: { Authorization: `Bearer ${token}` } });
  },
};
