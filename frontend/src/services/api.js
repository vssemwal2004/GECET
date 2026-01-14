import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable cookies for CSRF token
});

// Store CSRF token
let csrfToken = null;

// Fetch CSRF token
export const fetchCSRFToken = async () => {
  try {
    const response = await axios.get('http://localhost:5000/api/csrf-token', {
      withCredentials: true
    });
    csrfToken = response.data.csrfToken;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

// Add token and CSRF to requests
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token to state-changing requests
    if (['post', 'put', 'delete', 'patch'].includes(config.method)) {
      if (!csrfToken) {
        await fetchCSRFToken();
      }
      if (csrfToken) {
        config.headers['CSRF-Token'] = csrfToken;
      }
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
  async (error) => {
    // Only redirect for 401 on protected routes, NOT for OTP verification
    // Check if this is a login/OTP related endpoint - don't redirect for these
    const isAuthEndpoint = error.config?.url?.includes('/send-otp') || 
                           error.config?.url?.includes('/verify-otp') ||
                           error.config?.url?.includes('/login');
    
    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Token expired or invalid on protected routes
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    
    // Handle CSRF token errors
    if (error.response?.status === 403 && error.response?.data?.message?.includes('CSRF')) {
      // Refresh CSRF token and retry
      await fetchCSRFToken();
      const originalRequest = error.config;
      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        if (csrfToken) {
          originalRequest.headers['CSRF-Token'] = csrfToken;
        }
        return api(originalRequest);
      }
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
  getAnnouncement: () => api.get('/student/announcement'),
};

export default api;
