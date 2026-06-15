// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Campaign APIs
export const campaignAPI = {
  create: (data) => api.post('/campaigns', data),
  getAll: (params) => api.get('/campaigns', { params }),
  getOne: (id) => api.get(`/campaigns/${id}`),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
  getStats: (id, params) => api.get(`/campaigns/${id}/stats`, { params }),
};

// Ad Serve APIs
export const adServeAPI = {
  getStats: (params) => api.get('/ad-serve/stats', { params }),
};

// Admin APIs
export const adminAPI = {
  getOverview: () => api.get('/admin/overview'),
  getPendingWebsites: () => api.get('/admin/websites/pending'),
  moderateWebsite: (id, data) => api.put(`/admin/websites/${id}/moderate`, data),
  getPendingCreatives: () => api.get('/admin/creatives/pending'),
  moderateCreative: (id, data) => api.put(`/admin/creatives/${id}/moderate`, data),
  getBlockedIPs: () => api.get('/admin/blocked-ips'),
  blockIP: (data) => api.post('/admin/blocked-ips', data),
  unblockIP: (id) => api.delete(`/admin/blocked-ips/${id}`),
};

export default api;
