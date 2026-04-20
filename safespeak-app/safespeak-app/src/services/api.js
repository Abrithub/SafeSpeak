import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE = 'http://192.168.1.8:5000/api'; // Your PC's IP — update if needed

const getToken = async () => await AsyncStorage.getItem('token');

const authHeaders = async () => {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const loginUser = (username, password) =>
  fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  }).then(r => r.json());

export const registerUser = (username, password, email = '') =>
  fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email }),
  }).then(r => r.json());

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

export const fetchCases = async () => {
  const headers = await authHeaders();
  return fetch(`${BASE}/cases`, { headers }).then(r => r.json());
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
