import axios from 'axios';

// Default to the backend running on port 5001 in local development (backend started on 5001)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  registerTourist: (userData) => api.post('/auth/register/tourist', userData),
  registerPolice: (userData) => api.post('/auth/register/police', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
};

// Panic API
export const panicAPI = {
  createAlert: (alertData) => api.post('/panic/alert', alertData),
  getMyAlerts: () => api.get('/panic/my-alerts'),
  getActiveAlerts: () => api.get('/panic/active'),
  updateAlertStatus: (alertId, status) => api.put(`/panic/${alertId}/status`, { status }),
  getAlertDetails: (alertId) => api.get(`/panic/${alertId}`),
  cancelAlert: (alertId) => api.delete(`/panic/${alertId}`),
};

// Dev-only helper: if unauthenticated and in development, post to /api/dev/insert_alert
export const devCreateAlert = async (alertData) => {
  if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_DEV_DB !== 'false') {
    try {
      const resp = await fetch((process.env.REACT_APP_API_URL || 'http://localhost:5001') + '/api/dev/insert_alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
      });
      return await resp.json();
    } catch (err) {
      console.error('Dev create alert failed', err);
      throw err;
    }
  }
  throw new Error('Dev create alert not available');
};

// QR API
export const qrAPI = {
  generateQR: (data) => api.post('/qr/generate', data),
  verifyQR: (qrData) => api.post('/qr/verify', { qr_data: qrData }),
  getQRHistory: () => api.get('/qr/history'),
  getCurrentQR: () => api.get('/qr/current'),
  deactivateQR: (qrId) => api.put(`/qr/${qrId}/deactivate`),
};

// Geo API
export const geoAPI = {
  createFence: (fenceData) => api.post('/geo/fence', fenceData),
  getFences: (params) => api.get('/geo/fences', { params }),
  checkLocation: (location) => api.post('/geo/check', location),
  updateFence: (fenceId, data) => api.put(`/geo/fence/${fenceId}`, data),
  deleteFence: (fenceId) => api.delete(`/geo/fence/${fenceId}`),
  getTouristHistory: (touristId, params) => api.get(`/geo/tourist/${touristId}/history`, { params }),
};

// ML API (external service)
const ML_API_URL = process.env.REACT_APP_ML_API_URL || 'http://localhost:8000';

const mlApi = axios.create({
  baseURL: ML_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const mlAPI = {
  predictRisk: (data) => mlApi.post('/predict/risk', data),
  analyzePatterns: (data) => mlApi.post('/analyze/patterns', data),
  getModelInfo: () => mlApi.get('/model/info'),
  healthCheck: () => mlApi.get('/health'),
};

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

export const setUserData = (userData) => {
  localStorage.setItem('userData', JSON.stringify(userData));
};

export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
};

// Individual exports for convenience
export const login = authAPI.login;
export const register = authAPI.register;
export const getProfile = authAPI.getProfile;

export const createAlert = panicAPI.createAlert;
export const getMyAlerts = panicAPI.getMyAlerts;
export const getActiveAlerts = panicAPI.getActiveAlerts;
export const respondToAlert = panicAPI.respondToAlert;

export const generateQR = qrAPI.generateQR;
export const scanQRCode = qrAPI.scanQRCode;
export const getQRHistory = qrAPI.getQRHistory;

export const createGeoFence = geoAPI.createGeoFence;
export const getGeoFences = geoAPI.getGeoFences;
export const deleteGeoFence = geoAPI.deleteGeoFence;
export const checkLocation = geoAPI.checkLocation;

export const getTourists = async () => {
  try {
    const response = await api.get('/tourists');
    // response.data is expected to be { success: true, data: [...] }
    return response.data;
  } catch (error) {
    console.error('Get tourists error:', error);
    return { success: false, message: error.response?.data?.message || 'Error fetching tourists' };
  }
};

export default api;