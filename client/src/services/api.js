import axios from 'axios';

// Dynamically use VITE_API_URL in production (e.g., Render backend), or fallback to local /api proxy
const configuredApiUrl = import.meta.env.VITE_API_URL;
const baseURL = configuredApiUrl
  ? configuredApiUrl.replace(/\/$/, '').endsWith('/api')
    ? configuredApiUrl.replace(/\/$/, '')
    : `${configuredApiUrl.replace(/\/$/, '')}/api`
  : '/api';

const API = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token if present in localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('raza_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle session expiration or global errors gracefully
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default API;
