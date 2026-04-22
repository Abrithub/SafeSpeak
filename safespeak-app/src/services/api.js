import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Base URL ──────────────────────────────────────────────────────────────────
// Android emulator:  http://10.0.2.2:5000/api
// iOS simulator:     http://localhost:5000/api
// Physical device:   use Render URL below
const BASE = 'https://safespeak-api-vkw6.onrender.com/api';
export const BASE_URL = BASE;

const getToken = async () => await AsyncStorage.getItem('token');

const authHeaders = async () => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const loginUser = (username, password) =>
  fetch(`${BASE}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }).then(r => r.json());

export const registerUser = (username, password, email = '') =>
  fetch(`${BASE}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email }),
  }).then(r => r.json());

export const forgotPassword = (email) =>
  fetch(`${BASE}/auth/forgot-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  }).then(r => r.json());

export const resetPassword = (email, code, newPassword) =>
  fetch(`${BASE}/auth/reset-password`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, newPassword }),
  }).then(r => r.json());

// ── CASES ─────────────────────────────────────────────────────────────────────
export const submitReport = async (data) => {
  const headers = await authHeaders();
  return fetch(`${BASE}/cases`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json());
};

export const getMyCases = async () => {
  const headers = await authHeaders();
  return fetch(`${BASE}/cases/mine`, { headers }).then(r => r.json());
};

export const trackCase = (caseId, email = '') =>
  fetch(`${BASE}/cases/track/${caseId}${email ? `?email=${encodeURIComponent(email)}` : ''}`).then(r => r.json());

export const sendReporterMessage = async (caseId, text) => {
  const headers = await authHeaders();
  return fetch(`${BASE}/cases/${caseId}/messages/reporter`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  }).then(r => r.json());
};

export const getMyAppointments = async () => {
  const headers = await authHeaders();
  return fetch(`${BASE}/appointments/mine`, { headers }).then(r => r.json());
};

// ── ADMIN ─────────────────────────────────────────────────────────────────────
export const fetchCases = async (params = {}) => {
  const headers = await authHeaders();
  const q = new URLSearchParams(params).toString();
  return fetch(`${BASE}/cases${q ? '?' + q : ''}`, { headers }).then(r => r.json());
};

export const fetchCase = async (id) => {
  const headers = await authHeaders();
  return fetch(`${BASE}/cases/${id}`, { headers }).then(r => r.json());
};

export const updateStatus = async (id, status) => {
  const headers = await authHeaders();
  return fetch(`${BASE}/cases/${id}/status`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }).then(r => r.json());
};

export const addNote = async (id, text) => {
  const headers = await authHeaders();
  return fetch(`${BASE}/cases/${id}/notes`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  }).then(r => r.json());
};

export const sendAdminMessage = async (id, text) => {
  const headers = await authHeaders();
  return fetch(`${BASE}/cases/${id}/messages`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  }).then(r => r.json());
};

export const fetchStats = async () => {
  const headers = await authHeaders();
  return fetch(`${BASE}/cases/stats/overview`, { headers }).then(r => r.json());
};

// ── AI ────────────────────────────────────────────────────────────────────────
export const aiChat = async (message, history = []) =>
  fetch(`${BASE}/ai/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  }).then(r => r.json());

export const getAIResources = () =>
  fetch(`${BASE}/ai/resources`).then(r => r.json());

export const getReporterAppointments = (email) =>
  fetch(`${BASE}/appointments/reporter/${encodeURIComponent(email)}`).then(r => r.json());
