// Dusco API client — talks directly to the live backend.
// Handles JWT auth, generous timeouts for cold starts, and human error messages.

const API_BASE = "https://dusco-dusco.onrender.com/api";
const TOKEN_KEY = "dusco_token";
const USER_KEY = "dusco_user";
const ADMIN_TOKEN_KEY = "dusco_admin_token";

export function getToken() {
  try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
}
export function setSession(token, user) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {}
}
export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {}
}
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function getAdminToken() {
  try { return localStorage.getItem(ADMIN_TOKEN_KEY); } catch { return null; }
}
export function setAdminToken(t) {
  try { localStorage.setItem(ADMIN_TOKEN_KEY, t); } catch {}
}
export function clearAdminToken() {
  try { localStorage.removeItem(ADMIN_TOKEN_KEY); } catch {}
}

async function request(path, opts = {}) {
  const {
    method = "GET",
    body,
    auth = true,
    query,
    timeout = 95000,
    admin = false,
  } = opts;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = admin ? getAdminToken() : getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let url = API_BASE + path;
  if (query) {
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.append(k, v);
    });
    const s = qs.toString();
    if (s) url += "?" + s;
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    let data = {};
    try { data = await res.json(); } catch { data = {}; }
    if (!res.ok) {
      const msg = data?.error || data?.message || `Request failed (${res.status})`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  } catch (e) {
    if (e.name === "AbortError") {
      throw new Error("The request timed out. Our secure servers may be waking up — please try again in a moment.");
    }
    if (e?.message === "Failed to fetch") {
      throw new Error("Couldn't reach the Dusco servers. Please check your connection and try again.");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// ---- Auth ----
export const api = {
  register: (body) => request("/auth/register", { method: "POST", body, auth: false }),
  verifyOtp: (body) => request("/auth/verify-otp", { method: "POST", body, auth: false }),
  login: (body) => request("/auth/login", { method: "POST", body, auth: false }),
  me: () => request("/auth/me"),
  updateProfile: (body) => request("/auth/profile", { method: "PUT", body }),

  // ---- Bahashas ----
  getWallets: () => request("/wallets"),
  createWallet: (body) => request("/wallets", { method: "POST", body }),
  updateWallet: (id, body) => request(`/wallets/${id}`, { method: "PUT", body }),
  rebalance: (allocations) => request("/wallets/batch/rebalance", { method: "PUT", body: { allocations } }),
  deleteWallet: (id, body) => request(`/wallets/${id}`, { method: "DELETE", body: body || {} }),

  // ---- Transactions ----
  deposit: (body) => request("/transactions/deposit", { method: "POST", body }),
  withdraw: (body) => request("/transactions/withdraw", { method: "POST", body }),
  getTransactions: (query) => request("/transactions", { query }),
  feePreview: (query) => request("/transactions/fee-preview", { query }),

  // ---- Dividends ----
  dividendProjection: () => request("/dividends/projection"),
  dividendHistory: () => request("/dividends/history"),

  // ---- Consent (PDPA Cap. 44) ----
  // The durable record lives on the server as an append-only audit log, not in
  // browser storage: it must survive a cleared cache and follow the account
  // across devices.
  consentPurposes: () => request("/consent/purposes", { auth: false }),
  getConsent: () => request("/consent"),
  consentHistory: () => request("/consent/history"),
  recordConsent: (body) => request("/consent", { method: "POST", body }),

  // ---- Account erasure (PDPA right to erasure) ----
  deletionPreview: () => request("/account/deletion-preview"),
  deleteAccount: (body) => request("/account", { method: "DELETE", body }),

  // ---- Notifications ----
  getNotifications: () => request("/notifications"),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: "PUT" }),
  markAllRead: () => request("/notifications/batch/read-all", { method: "PUT" }),

  // ---- Groups ----
  getGroups: () => request("/groups"),
  createGroup: (body) => request("/groups", { method: "POST", body }),
  getGroup: (id) => request(`/groups/${id}`),
  contribute: (id, body) => request(`/groups/${id}/contribute`, { method: "POST", body }),
  groupWithdraw: (id, body) => request(`/groups/${id}/withdraw`, { method: "POST", body }),
  groupMembers: (id) => request(`/groups/${id}/members`),
  groupTransactions: (id, query) => request(`/groups/${id}/transactions`, { query }),
  inviteMember: (id, body) => request(`/groups/${id}/invite`, { method: "POST", body }),

  // ---- Admin ----
  adminLogin: (body) => request("/admin/login", { method: "POST", body, auth: false }),
  adminDashboard: () => request("/admin/dashboard", { admin: true }),
  adminUsers: () => request("/admin/users", { admin: true }),
  adminUser: (id) => request(`/admin/users/${id}`, { admin: true }),
  adminTransactions: (query) => request("/admin/transactions", { query, admin: true }),
  adminDistributeDividends: (body) => request("/admin/dividends/distribute", { method: "POST", body, admin: true }),
};