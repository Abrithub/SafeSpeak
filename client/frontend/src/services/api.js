const BASE = "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

const headers = (auth = false) => ({
  ...(auth && getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// ── AUTH ──────────────────────────────────────────────
export const loginUser = (username, password) =>
  fetch(`${BASE}/auth/login`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  }).then((r) => r.json());

export const registerUser = (username, password, email = "") =>
  fetch(`${BASE}/auth/register`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email }),
  }).then((r) => r.json());

export const googleAuth = (credential) =>
  fetch(`${BASE}/auth/google`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  }).then((r) => r.json());

export const registerAdmin = (username, password, secretKey, email = "") =>
  fetch(`${BASE}/auth/admin/register`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, secretKey, email }),
  }).then((r) => r.json());

export const forgotPassword = (email) =>
  fetch(`${BASE}/auth/forgot-password`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  }).then((r) => r.json());

export const resetPassword = (email, code, newPassword) =>
  fetch(`${BASE}/auth/reset-password`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, newPassword }),
  }).then((r) => r.json());

// ── CASES ─────────────────────────────────────────────
export const submitReport = (formData) =>
  fetch(`${BASE}/cases`, {
    method: "POST",
    // No Content-Type header — let browser set multipart boundary for FormData
    headers: headers(true),  // send token if logged in
    body: formData,
  }).then((r) => r.json());

export const trackCase = (caseId, email = "") =>
  fetch(`${BASE}/cases/track/${caseId}${email ? `?email=${encodeURIComponent(email)}` : ""}`).then((r) => r.json());

export const getReporterAppointments = (email) =>
  fetch(`${BASE}/appointments/reporter/${encodeURIComponent(email)}`).then((r) => r.json());

export const scheduleAppointment = (data) =>
  fetch(`${BASE}/appointments`, {
    method: "POST",
    headers: { ...headers(true), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then((r) => r.json());

export const updateAppointmentOutcome = (id, outcome, outcomeNote) =>
  fetch(`${BASE}/appointments/${id}/outcome`, {
    method: "PATCH",
    headers: { ...headers(true), "Content-Type": "application/json" },
    body: JSON.stringify({ outcome, outcomeNote }),
  }).then((r) => r.json());

export const getCaseAppointments = (caseId) =>
  fetch(`${BASE}/appointments/case/${caseId}`, { headers: headers(true) }).then((r) => r.json());

export const fetchCases = (params = {}) => {
  const q = new URLSearchParams(params).toString();
  return fetch(`${BASE}/cases${q ? "?" + q : ""}`, { headers: headers(true) }).then((r) => r.json());
};

export const fetchCase = (id) =>
  fetch(`${BASE}/cases/${id}`, { headers: headers(true) }).then((r) => r.json());

export const updateStatus = (id, status) =>
  fetch(`${BASE}/cases/${id}/status`, {
    method: "PATCH",
    headers: { ...headers(true), "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  }).then((r) => r.json());

export const addNote = (id, text) =>
  fetch(`${BASE}/cases/${id}/notes`, {
    method: "POST",
    headers: { ...headers(true), "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  }).then((r) => r.json());

export const sendMessage = (id, text) =>
  fetch(`${BASE}/cases/${id}/messages`, {
    method: "POST",
    headers: { ...headers(true), "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  }).then((r) => r.json());

export const replyMessage = (id, text) =>
  fetch(`${BASE}/cases/${id}/messages/reporter`, {
    method: "POST",
    headers: { ...headers(true), "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  }).then((r) => r.json());

export const assignCase = (id, officer, org) =>
  fetch(`${BASE}/cases/${id}/assign`, {
    method: "PATCH",
    headers: { ...headers(true), "Content-Type": "application/json" },
    body: JSON.stringify({ officer, org }),
  }).then((r) => r.json());

export const reopenCase = (id) =>
  fetch(`${BASE}/cases/${id}/reopen`, {
    method: "PATCH",
    headers: { ...headers(true), "Content-Type": "application/json" },
  }).then((r) => r.json());

export const archiveCase = (id) =>
  fetch(`${BASE}/cases/${id}/archive`, {
    method: "PATCH",
    headers: { ...headers(true), "Content-Type": "application/json" },
  }).then((r) => r.json());

export const bulkUpdateStatus = (caseIds, status) =>
  fetch(`${BASE}/cases/bulk/status`, {
    method: "PATCH",
    headers: { ...headers(true), "Content-Type": "application/json" },
    body: JSON.stringify({ caseIds, status }),
  }).then((r) => r.json());

export const deleteCase = (id) =>
  fetch(`${BASE}/cases/${id}`, {
    method: "DELETE",
    headers: headers(true),
  }).then((r) => r.json());

export const exportCasesCSV = () =>
  fetch(`${BASE}/cases/export/csv`, { headers: headers(true) })
    .then(r => r.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `safespeak-cases-${Date.now()}.csv`;
      a.click();
    });

export const changePassword = (currentPassword, newPassword) =>
  fetch(`${BASE}/auth/change-password`, {
    method: "PATCH",
    headers: { ...headers(true), "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newPassword }),
  }).then((r) => r.json());

export const listUsers = () =>
  fetch(`${BASE}/auth/users`, { headers: headers(true) }).then((r) => r.json());

export const deleteUser = (id) =>
  fetch(`${BASE}/auth/users/${id}`, {
    method: "DELETE",
    headers: headers(true),
  }).then((r) => r.json());

export const referCase = (id, referralData) =>
  fetch(`${BASE}/cases/${id}/refer`, {
    method: "PATCH",
    headers: { ...headers(true), "Content-Type": "application/json" },
    body: JSON.stringify(referralData),
  }).then((r) => r.json());

export const getMyCases = () =>
  fetch(`${BASE}/cases/mine`, { headers: headers(true) }).then((r) => r.json());

// ── AI CHAT ───────────────────────────────────────────
export const aiChat = (message, history = []) =>
  fetch(`${BASE}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  }).then((r) => r.json());

export const getAIResources = () =>
  fetch(`${BASE}/ai/resources`).then((r) => r.json());
