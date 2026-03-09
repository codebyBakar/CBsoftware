import axios from 'axios';

export const API = axios.create({
  baseURL: 'http://localhost:9100', // Make sure this has /api
  withCredentials: true,
});

// Add token interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);