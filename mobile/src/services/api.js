/**
 * WaselX API Service — Mobile
 * Axios instance with token auth, auto-refresh interceptor
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
// ─── API CONFIGURATION ──────────────────────────────────────────
// 1. FOR EMULATORS: 
//    Android: http://10.0.2.2:3000/api
//    iOS: http://localhost:3000/api
// 2. FOR PHYSICAL DEVICES:
//    Use your machine's local IP (e.g., http://192.168.1.10:3000/api)

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api' : 'http://localhost:3000/api';
// ⚠️ CHANGE THIS to your machine IP for physical device testing:
// const BASE_URL = 'http://192.168.1.xxx:3000/api'; 

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Attach access token ──────────────────────────────────────
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Handle token expiry (auto-refresh) ───────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then((token) => { original.headers.Authorization = `Bearer ${token}`; return api(original); });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const newToken = data.data.accessToken;
        await AsyncStorage.setItem('accessToken', newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (err) {
        processQueue(err, null);
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        // Navigate to login — handled by auth store
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getMe: () => api.get('/auth/me'),
  updateFcmToken: (fcmToken) => api.patch('/auth/fcm-token', { fcmToken }),
};

// ─── Shipments API ────────────────────────────────────────────
export const shipmentsAPI = {
  create: (data) => api.post('/shipments', data),
  list: (params) => api.get('/shipments', { params }),
  get: (id) => api.get(`/shipments/${id}`),
  updateStatus: (id, status, notes) => api.patch(`/shipments/${id}/status`, { status, notes }),
  cancel: (id) => api.delete(`/shipments/${id}`),
};

// ─── Bids API ─────────────────────────────────────────────────
export const bidsAPI = {
  submit: (data) => api.post('/bids', data),
  getForShipment: (shipmentId) => api.get(`/bids/shipment/${shipmentId}`),
  getMyBids: () => api.get('/bids/my'),
  accept: (id) => api.patch(`/bids/${id}/accept`),
  reject: (id) => api.patch(`/bids/${id}/reject`),
};

// ─── Tracking API ─────────────────────────────────────────────
export const trackingAPI = {
  pushLocation: (data) => api.post('/tracking/update', data),
  getLog: (shipmentId) => api.get(`/tracking/shipment/${shipmentId}`),
};

export default api;
