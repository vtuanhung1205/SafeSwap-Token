import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
console.log('API Base URL:', API_BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor - no need to add auth headers for session-based auth
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - simplified for session-based auth
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle session expiration
    if (error.response?.status === 401) {
      // Clear any local auth state
      console.log('Session expired or invalid');
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  googleAuth: (googleData) => 
    api.post('/auth/google', googleData),
  
  getProfile: () => 
    api.get('/auth/profile'),
  
  updateProfile: (data) => 
    api.put('/auth/profile', data),
  
  logout: () => 
    api.post('/auth/logout'),
  
  getAuthStatus: () => 
    api.get('/auth/status'),
    
  validateSession: () =>
    api.get('/auth/validate'),
};

export const walletAPI = {
  connect: (address, publicKey) => 
    api.post('/wallet/connect', { address, publicKey }),
  
  disconnect: () => 
    api.post('/wallet/disconnect'),
  
  getInfo: () => 
    api.get('/wallet/info'),
  
  getBalance: () => 
    api.get('/wallet/balance'),
  
  getTransactions: (limit = 10) => 
    api.get(`/wallet/transactions?limit=${limit}`),
};

export const swapAPI = {
  getQuote: (fromToken, toToken, amount) => 
    api.post('/swap/quote', { fromToken, toToken, amount }),
  
  executeSwap: (swapData) => 
    api.post('/swap/execute', swapData),
  
  getHistory: (limit = 20) => 
    api.get(`/swap/history?limit=${limit}`),
  
  getStats: () => 
    api.get('/swap/stats'),
};

export const priceAPI = {
  getAllPrices: () => 
    api.get('/price/all'),
  
  getTokenPrice: (symbol) => 
    api.get(`/price/token/${symbol}`),
  
  getExchangeRate: (fromToken, toToken) => 
    api.get(`/price/exchange-rate?from=${fromToken}&to=${toToken}`),
  
  analyzeToken: (tokenAddress) => 
    api.post('/price/analyze', { tokenAddress }),
};

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    if (data && data.message) {
      return data.message;
    }
    
    switch (status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Access forbidden.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict. This resource already exists.';
      case 422:
        return 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Request failed with status ${status}.`;
    }
  } else if (error.request) {
    // Request was made but no response received
    return 'Network error. Please check your connection.';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred.';
  }
}; 