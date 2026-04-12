/**
 * WaselX Admin — API Service Layer
 * Centralized Axios instance with auth interceptors
 */
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('waselx_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('waselx_admin_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

export const usersAPI = {
  list: (params) => api.get('/users', { params }),
  get: (id) => api.get(`/users/${id}`),
  updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
  updateVerify: (id, data) => api.patch(`/users/${id}/verify`, data),
};

export const shipmentsAPI = {
  list: (params) => api.get('/shipments', { params }),
  get: (id) => api.get(`/shipments/${id}`),
};

export const bidsAPI = {
  forShipment: (id) => api.get(`/bids/shipment/${id}`),
};

export const adminAPI = {
  analytics: () => api.get('/admin/analytics'),
  getCommission: () => api.get('/admin/commission'),
  updateCommission: (rate) => api.patch('/admin/commission', { rate }),
  marketplace: () => api.get('/admin/marketplace'),
  manualAssign: (data) => api.post('/admin/manual-assign', data),
  activity: () => api.get('/admin/activity'),
};

export default api;
