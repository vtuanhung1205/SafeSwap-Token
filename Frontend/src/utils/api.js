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
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { accessToken } = response.data.data.tokens;
          localStorage.setItem('accessToken', accessToken);
          
          return api(original);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
      }
    }
    
    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (email, name, password, avatar) => 
    api.post('/auth/register', { email, name, password, avatar }),
  
  getProfile: () => 
    api.get('/auth/profile'),
  
  updateProfile: (data) => 
    api.put('/auth/profile', data),
  
  logout: () => 
    api.post('/auth/logout'),
  
  validateToken: () => 
    api.get('/auth/validate'),
    
  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),
    
  resetPassword: (token, password) =>
    api.post('/auth/reset-password', { token, password }),
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
  
  updateBalance: () => 
    api.post('/wallet/update-balance'),
  
  getTransactions: (limit = 25) => 
    api.get(`/wallet/transactions?limit=${limit}`),
  
  validateAddress: (address) => 
    api.post('/wallet/validate-address', { address }),
  
  fundAccount: (amount) => 
    api.post('/wallet/fund', { amount }),
};

export const priceAPI = {
  getAllPrices: () => 
    api.get('/price/all'),
  
  getTokenPrice: (symbol) => 
    api.get(`/price/token/${symbol}`),
  
  getExchangeRate: (from, to) => 
    api.get(`/price/exchange-rate?from=${from}&to=${to}`),
  
  analyzeToken: (tokenAddress, tokenName, tokenSymbol) => 
    api.post('/price/analyze', { tokenAddress, tokenName, tokenSymbol }),
  
  batchAnalyzeTokens: (tokenAddresses) => 
    api.post('/price/batch-analyze', { tokenAddresses }),
};

export const swapAPI = {
  getQuote: (fromToken, toToken, amount) => 
    api.post('/swap/quote', { fromToken, toToken, amount }),
  
  executeSwap: (fromToken, toToken, fromAmount, toAmount, quoteId) => 
    api.post('/swap/execute', { fromToken, toToken, fromAmount, toAmount, quoteId }),
  
  getHistory: (page = 1, limit = 20, status) => 
    api.get(`/swap/history?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`),
  
  getSwapDetails: (transactionId) => 
    api.get(`/swap/history/${transactionId}`),
  
  getStats: () => 
    api.get('/swap/stats'),
};

// Utility functions
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

export default api; 