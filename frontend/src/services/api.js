import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
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
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Admin APIs
export const adminAPI = {
  login: (credentials) => api.post('/admin/login', credentials),
  uploadCSV: (formData) => api.post('/admin/upload-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getStudents: () => api.get('/admin/students'),
  getAnnouncement: () => api.get('/admin/announcement'),
  updateAnnouncement: (content) => api.put('/admin/announcement', { content })
};

// Student APIs
export const studentAPI = {
  sendOTP: (phone) => api.post('/student/send-otp', { phone }),
  verifyOTP: (phone, otp) => api.post('/student/verify-otp', { phone, otp }),
  getProfile: () => api.get('/student/profile'),
  getAnnouncement: () => api.get('/student/announcement')
};

export default api;
