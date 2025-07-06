import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      Cookies.remove('token');
      Cookies.remove('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
};

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (projectData) => api.post('/projects', projectData),
  update: (id, projectData) => api.put(`/projects/${id}`, projectData),
  delete: (id) => api.delete(`/projects/${id}`),
  getFiles: (id, path = '') => api.get(`/projects/${id}/files?path=${encodeURIComponent(path)}`),
  createFile: (id, fileData) => api.post(`/projects/${id}/files`, fileData),
  updateFile: (id, fileData) => api.put(`/projects/${id}/files`, fileData),
  deleteFile: (id, filePath) => api.delete(`/projects/${id}/files?path=${encodeURIComponent(filePath)}`),
};

// Issues API
export const issuesAPI = {
  getAll: (projectId) => api.get(`/projects/${projectId}/issues`),
  getById: (projectId, issueId) => api.get(`/projects/${projectId}/issues/${issueId}`),
  create: (projectId, issueData) => api.post(`/projects/${projectId}/issues`, issueData),
  update: (projectId, issueId, issueData) => api.put(`/projects/${projectId}/issues/${issueId}`, issueData),
  delete: (projectId, issueId) => api.delete(`/projects/${projectId}/issues/${issueId}`),
};

// File upload API
export const uploadAPI = {
  uploadFile: (projectId, file, path, message) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    formData.append('message', message);
    
    return api.post(`/projects/${projectId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;