import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
console.log('API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Changed from 'authToken' to 'token'
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle JWT token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle JWT token expiration
    if (error.response?.status === 401) {
      localStorage.removeItem('token'); // Changed from 'authToken' to 'token'
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  // Google OAuth Login
  googleLogin: (googleData) => 
    api.post('/auth/google', googleData),
  
  // Get user profile
  getProfile: () => 
    api.get('/auth/profile'),
  
  // Update user profile
  updateProfile: (data) => 
    api.put('/auth/profile', data),
  
  // Logout
  logout: () => 
    api.post('/auth/logout'),
};

// Wallet API
export const walletAPI = {
  // Connect wallet
  connect: (address, publicKey) => {
    console.log("API: Connecting wallet with data:", { address, publicKey });
    return api.post('/wallet/connect', { address, publicKey });
  },
  
  // Disconnect wallet
  disconnect: () => 
    api.post('/wallet/disconnect'),
  
  // Get current user's wallet info
  getInfo: () => 
    api.get('/wallet/info'),
  
  // Get user's transactions
  getTransactions: (params = {}) => 
    api.get('/transactions', { params }),
};

// Transaction API
export const transactionAPI = {
  // Get user transactions
  getUserTransactions: (params = {}) => 
    api.get('/transactions', { params }),
};

// System API
export const systemAPI = {
  // Health check
  health: () => 
    api.get('/health'),
};

// Error handling utility
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
}; 