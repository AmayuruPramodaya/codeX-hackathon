import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
      return Promise.reject({
        message: 'Network error. Please check your connection and try again.',
        ...error
      });
    }
    
    // Handle server errors
    if (error.response.status >= 500) {
      console.error('Server error:', error.response.status, error.response.data);
      return Promise.reject({
        message: 'Server error. Please try again later.',
        ...error
      });
    }
    
    // Handle validation errors
    if (error.response.status === 400) {
      const errorData = error.response.data;
      
      // Handle field validation errors
      if (typeof errorData === 'object' && errorData !== null) {
        const fieldErrors = [];
        Object.keys(errorData).forEach(field => {
          if (Array.isArray(errorData[field])) {
            fieldErrors.push(...errorData[field]);
          } else if (typeof errorData[field] === 'string') {
            fieldErrors.push(errorData[field]);
          }
        });
        
        if (fieldErrors.length > 0) {
          return Promise.reject({
            message: fieldErrors.join(', '),
            ...error
          });
        }
      }
      
      // Handle general validation errors
      if (errorData.detail) {
        return Promise.reject({
          message: errorData.detail,
          ...error
        });
      }
    }
    
    // Handle 403 Forbidden
    if (error.response.status === 403) {
      return Promise.reject({
        message: 'You do not have permission to perform this action.',
        ...error
      });
    }
    
    // Handle 404 Not Found
    if (error.response.status === 404) {
      return Promise.reject({
        message: 'The requested resource was not found.',
        ...error
      });
    }
    
    // Default error handling
    return Promise.reject({
      message: error.response?.data?.detail || error.response?.data?.message || error.message || 'An unexpected error occurred.',
      ...error
    });
  }
);

// API endpoint functions
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login/', credentials),
  register: (userData) => api.post('/api/auth/register/', userData),
  logout: () => api.post('/api/auth/logout/'),
  refreshToken: (refreshToken) => api.post('/api/auth/refresh/', { refresh: refreshToken }),
  getProfile: () => api.get('/api/auth/user/'),
  updateProfile: (userData) => api.patch('/api/auth/user/', userData),
};

export const divisionsAPI = {
  getProvinces: () => api.get('/api/divisions/provinces/'),
  getDistricts: (provinceId) => api.get(`/api/divisions/districts/?province=${provinceId}`),
  getDSDivisions: (districtId) => api.get(`/api/divisions/ds-divisions/?district=${districtId}`),
  getGNDivisions: (dsDivisionId) => api.get(`/api/divisions/gn-divisions/?ds_division=${dsDivisionId}`),
};

export const issuesAPI = {
  getIssues: (params) => api.get('/api/issues/', { params }),
  getPublicIssues: (params) => api.get('/api/issues/public/', { params }),
  getMyIssues: (params) => api.get('/api/issues/my/', { params }),
  getEscalatedIssues: (params) => api.get('/api/issues/escalated/', { params }),
  getIssue: (id) => api.get(`/api/issues/${id}/`),
  createIssue: (formData) => api.post('/api/issues/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateIssue: (id, data) => api.patch(`/api/issues/${id}/`, data),
  deleteIssue: (id) => api.delete(`/api/issues/${id}/`),
  getIssueResponses: (issueId) => api.get(`/api/issues/${issueId}/responses/`),
  createIssueResponse: (issueId, formData) => api.post(`/api/issues/${issueId}/respond/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getIssueComments: (issueId) => api.get(`/api/issues/${issueId}/comments/`),
  createIssueComment: (issueId, data) => api.post(`/api/issues/${issueId}/comment/`, data),
};

export const dashboardAPI = {
  getStats: () => api.get('/api/dashboard/stats/'),
  getRecentIssues: () => api.get('/api/dashboard/recent-issues/'),
  getNotifications: () => api.get('/api/dashboard/notifications/'),
  markNotificationRead: (id) => api.patch(`/api/notifications/${id}/`, { is_read: true }),
};

// Export the main api instance
export { api };

// Default export
export default api;
