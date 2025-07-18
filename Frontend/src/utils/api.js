import axios from 'axios';
import { DEMO_MODE } from '../config/demo';

// Force demo mode to true to avoid CORS issues
const FORCE_DEMO_MODE = true;

// API Base URL (not used in demo mode but kept for reference)
const API_BASE_URL = 'https://safeswap-backend-service.onrender.com/api';
console.log('API Base URL:', API_BASE_URL);
console.log('Demo mode is ' + (DEMO_MODE || FORCE_DEMO_MODE ? 'enabled' : 'disabled'));

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and log requests
api.interceptors.request.use(
  (config) => {
    // If demo mode is forced, don't make actual API calls
    if (FORCE_DEMO_MODE) {
      console.log(`Demo mode: Would make ${config.method.toUpperCase()} request to ${config.baseURL}${config.url}`);
      // Return a dummy config that will be caught by the response interceptor
      return {
        ...config,
        _demoMode: true,
      };
    }
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the request for debugging
    console.log(`API Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`, 
      config.data ? config.data : '');
    
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and demo mode
api.interceptors.response.use(
  (response) => {
    // If this is a demo mode response, handle it specially
    if (response.config._demoMode) {
      console.log('Demo mode: Simulating successful response');
      // This will be caught by the API functions below
      return Promise.reject({ _demoMode: true });
    }
    
    console.log(`API Response: ${response.config.method.toUpperCase()} ${response.config.url}`, 
      response.data);
    return response;
  },
  async (error) => {
    // If this is a demo mode error, it's not a real error
    if (error._demoMode) {
      console.log('Demo mode: Intercepted API call');
      return Promise.reject(error);
    }
    
    console.error('API Response Error:', error.message, error.response?.data);
    
    // If CORS error or network error, suggest enabling demo mode
    if (error.message === 'Network Error' || error.message.includes('CORS')) {
      console.warn('CORS or Network Error detected. Consider enabling demo mode.');
    }
    
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

// API endpoints with demo mode fallback
export const authAPI = {
  login: (email, password) => {
    if (DEMO_MODE || FORCE_DEMO_MODE) {
      console.log('Demo mode: Simulating login for', email);
      return Promise.resolve({ 
        data: { 
          success: true, 
          data: { 
            user: { email, name: 'Demo User' },
            tokens: { accessToken: 'demo-token', refreshToken: 'demo-refresh-token' } 
          } 
        } 
      });
    }
    return api.post('/auth/login', { email, password });
  },
  
  register: (email, name, password, avatar) => {
    if (DEMO_MODE || FORCE_DEMO_MODE) {
      console.log('Demo mode: Simulating registration for', email);
      return Promise.resolve({ 
        data: { 
          success: true, 
          data: { 
            user: { email, name },
            tokens: { accessToken: 'demo-token', refreshToken: 'demo-refresh-token' } 
          } 
        } 
      });
    }
    return api.post('/auth/register', { email, name, password, avatar });
  },
  
  getProfile: () => {
    if (DEMO_MODE || FORCE_DEMO_MODE) {
      console.log('Demo mode: Simulating get profile');
      return Promise.resolve({ 
        data: { 
          success: true, 
          data: { 
            user: { 
              email: 'demo@example.com', 
              name: 'Demo User',
              avatar: '/avt1.jpg',
              createdAt: new Date().toISOString()
            }
          } 
        } 
      });
    }
    return api.get('/auth/profile');
  },
  
  updateProfile: (data) => {
    if (DEMO_MODE || FORCE_DEMO_MODE) {
      console.log('Demo mode: Simulating update profile');
      return Promise.resolve({ 
        data: { 
          success: true, 
          data: { 
            user: { 
              ...data,
              email: data.email || 'demo@example.com',
              name: data.name || 'Demo User',
              avatar: data.avatar || '/avt1.jpg',
              createdAt: new Date().toISOString()
            }
          } 
        } 
      });
    }
    return api.put('/auth/profile', data);
  },
  
  logout: () => {
    if (DEMO_MODE || FORCE_DEMO_MODE) {
      console.log('Demo mode: Simulating logout');
      return Promise.resolve({ data: { success: true } });
    }
    return api.post('/auth/logout');
  },
  
  validateToken: () => {
    if (DEMO_MODE || FORCE_DEMO_MODE) {
      console.log('Demo mode: Simulating token validation');
      return Promise.resolve({ 
        data: { 
          success: true, 
          data: { 
            user: { 
              email: 'demo@example.com', 
              name: 'Demo User',
              avatar: '/avt1.jpg',
              createdAt: new Date().toISOString()
            }
          } 
        } 
      });
    }
    return api.get('/auth/validate');
  },
    
  forgotPassword: (email) => {
    if (DEMO_MODE || FORCE_DEMO_MODE) {
      console.log('Demo mode: Simulating forgot password for', email);
      return Promise.resolve({ data: { success: true } });
    }
    return api.post('/auth/forgot-password', { email });
  },
    
  resetPassword: (token, password) => {
    if (DEMO_MODE || FORCE_DEMO_MODE) {
      console.log('Demo mode: Simulating password reset');
      return Promise.resolve({ data: { success: true } });
    }
    return api.post('/auth/reset-password', { token, password });
  },
};

// Wallet API endpoints with demo mode
export const walletAPI = {
  connect: (address, publicKey) => {
    if (DEMO_MODE || FORCE_DEMO_MODE) {
      console.log('Demo mode: Simulating wallet connection');
      return Promise.resolve({ 
        data: { 
          success: true,
          data: {
            wallet: {
              address,
              publicKey,
              balance: '1000.00',
              connected: true
            }
          }
        } 
      });
    }
    return api.post('/wallet/connect', { address, publicKey });
  },
  
  disconnect: () => {
    if (DEMO_MODE || FORCE_DEMO_MODE) {
      console.log('Demo mode: Simulating wallet disconnection');
      return Promise.resolve({ data: { success: true } });
    }
    return api.post('/wallet/disconnect');
  },
  
  getInfo: () => {
    if (DEMO_MODE || FORCE_DEMO_MODE) {
      console.log('Demo mode: Simulating get wallet info');
      return Promise.resolve({ 
        data: { 
          success: true,
          data: {
            wallet: {
              address: '0x1234...5678',
              publicKey: 'pk_1234...5678',
              balance: '1000.00',
              connected: true
            }
          }
        } 
      });
    }
    return api.get('/wallet/info');
  },
  
  getBalance: () => {
    if (DEMO_MODE || FORCE_DEMO_MODE) {
      console.log('Demo mode: Simulating get wallet balance');
      return Promise.resolve({ 
        data: { 
          success: true,
          data: {
            balance: '1000.00',
            tokens: [
              { symbol: 'ETH', balance: '10.5', value: 18750 },
              { symbol: 'USDT', balance: '500', value: 500 },
              { symbol: 'BTC', balance: '0.25', value: 7500 }
            ]
          }
        } 
      });
    }
    return api.get('/wallet/balance');
  },
  
  // Add demo mode for other wallet API functions...
};

// Price API endpoints with demo mode
export const priceAPI = {
  getAllPrices: () => {
    if (DEMO_MODE || FORCE_DEMO_MODE) {
      console.log('Demo mode: Simulating get all prices');
      // Use the mockPrices from the WebSocket hook
      return Promise.resolve({ 
        data: { 
          success: true,
          data: Object.values(require('../utils/mockData').mockPrices)
        } 
      });
    }
    return api.get('/price/all');
  },
  
  // Add demo mode for other price API functions...
};

// Swap API endpoints with demo mode
export const swapAPI = {
  getQuote: (fromToken, toToken, amount) => {
    if (DEMO_MODE || FORCE_DEMO_MODE) {
      console.log(`Demo mode: Simulating swap quote ${amount} ${fromToken} to ${toToken}`);
      const mockRate = fromToken === 'ETH' ? 1800 : 
                      fromToken === 'BTC' ? 30000 : 1;
      const toAmount = amount * mockRate;
      
      return Promise.resolve({ 
        data: { 
          success: true,
          data: {
            quoteId: 'q_' + Math.random().toString(36).substring(2, 10),
            fromToken,
            toToken,
            fromAmount: amount,
            toAmount,
            exchangeRate: mockRate,
            fee: amount * 0.003,
            priceImpact: 0.1,
            expiresAt: new Date(Date.now() + 30000).toISOString()
          }
        } 
      });
    }
    return api.post('/swap/quote', { fromToken, toToken, amount });
  },
  
  // Add demo mode for other swap API functions...
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