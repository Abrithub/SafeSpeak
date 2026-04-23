import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Base URL ──────────────────────────────────────────────────────────────────
const BASE = 'https://safespeak-api-vkw6.onrender.com/api';
export const BASE_URL = BASE;

const getToken = async () => await AsyncStorage.getItem('token');

const authHeaders = async () => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ── Fetch with timeout (prevents hanging on slow/sleeping servers) ─────────────
const fetchWithTimeout = (url, options = {}, ms = 20000) => {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(id));
};

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const loginUser = (username, password) =>
  fetchWithTimeout(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }).then(r => r.json());

export const registerUser = (username, password, email = '') =>
  fetchWithTimeout(`${BASE}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email }),
  }).then(r => r.json());

export const forgotPassword = (email) =>
  fetchWithTimeout(`${BASE}/auth/forgot-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  }).then(r => r.json());

export const resetPassword = (email, code, newPassword) =>
  fetchWithTimeout(`${BASE}/auth/reset-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword }),
  }).then(r => r.json());

export const changePassword = async (currentPassword, newPassword) => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/auth/change-password`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ currentPassword, newPassword }),
  }).then(r => r.json());
};

// ── CASES ─────────────────────────────────────────────────────────────────────
export const submitReport = async (data) => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/cases`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());
};

export const getMyCases = async () => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/cases/mine`, { headers }).then(r => r.json());
};

export const trackCase = (caseId, email = '') =>
  fetchWithTimeout(
    `${BASE}/cases/track/${caseId}${email ? `?email=${encodeURIComponent(email)}` : ''}`
  ).then(r => r.json());

export const sendReporterMessage = async (caseId, text) => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/cases/${caseId}/messages/reporter`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  }).then(r => r.json());
};

// ── APPOINTMENTS ──────────────────────────────────────────────────────────────
export const getMyAppointments = async () => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/appointments/mine`, { headers }).then(r => r.json());
};

export const getReporterAppointments = (email) =>
  fetchWithTimeout(
    `${BASE}/appointments/reporter/${encodeURIComponent(email)}`
  ).then(r => r.json());

// ── ADMIN — CASES ─────────────────────────────────────────────────────────────
export const fetchCases = async (params = {}) => {
  const headers = await authHeaders();
  const q = new URLSearchParams(params).toString();
  return fetchWithTimeout(`${BASE}/cases${q ? '?' + q : ''}`, { headers }).then(r => r.json());
};

export const fetchCase = async (id) => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/cases/${id}`, { headers }).then(r => r.json());
};

export const updateStatus = async (id, status) => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/cases/${id}/status`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }).then(r => r.json());
};

export const addNote = async (id, text) => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/cases/${id}/notes`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  }).then(r => r.json());
};

export const sendAdminMessage = async (id, text) => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/cases/${id}/messages`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  }).then(r => r.json());
};

export const assignCase = async (id, officer, org) => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/cases/${id}/assign`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ officer, org }),
  }).then(r => r.json());
};

export const reopenCase = async (id) => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/cases/${id}/reopen`, {
    method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' },
  }).then(r => r.json());
};

export const archiveCase = async (id) => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/cases/${id}/archive`, {
    method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' },
  }).then(r => r.json());
};

export const deleteCase = async (id) => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/cases/${id}`, {
    method: 'DELETE', headers,
  }).then(r => r.json());
};

export const referCase = async (id, referralData) => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/cases/${id}/refer`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(referralData),
  }).then(r => r.json());
};

export const fetchStats = async () => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/cases/stats/overview`, { headers }).then(r => r.json());
};

// ── ADMIN — APPOINTMENTS ──────────────────────────────────────────────────────
export const scheduleAppointment = async (data) => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/appointments`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());
};

export const updateAppointmentOutcome = async (id, outcome, outcomeNote) => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/appointments/${id}/outcome`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ outcome, outcomeNote }),
  }).then(r => r.json());
};

// ── ADMIN — USERS ─────────────────────────────────────────────────────────────
export const listUsers = async () => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/auth/users`, { headers }).then(r => r.json());
};

export const deleteUser = async (id) => {
  const headers = await authHeaders();
  return fetchWithTimeout(`${BASE}/auth/users/${id}`, {
    method: 'DELETE', headers,
  }).then(r => r.json());
};

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiChat = async (message, history = []) =>
  fetchWithTimeout(`${BASE}/ai/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  }, 30000).then(r => r.json()); // 30s for AI responses

export const getAIResources = () =>
  fetchWithTimeout(`${BASE}/ai/resources`).then(r => r.json());
