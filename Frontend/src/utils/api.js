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
    const token = localStorage.getItem('authToken');
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
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // Google OAuth login/register
  googleAuth: (googleData) => 
    api.post('/auth/google', googleData),
  
  // Register new user
  register: (userData) => 
    api.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => 
    api.post('/auth/login', credentials),
  
  // Get user profile
  getProfile: () => 
    api.get('/auth/profile'),
  
  // Update user profile
  updateProfile: (data) => 
    api.put('/auth/profile', data),
  
  // Change password
  changePassword: (currentPassword, newPassword) => 
    api.put('/auth/change-password', { currentPassword, newPassword }),
  
  // Connect wallet
  connectWallet: (walletAddress, walletType) => 
    api.post('/auth/connect-wallet', { walletAddress, walletType }),
  
  // Disconnect wallet
  disconnectWallet: () => 
    api.delete('/auth/disconnect-wallet'),
  
  // Logout
  logout: () => 
    api.post('/auth/logout'),
  
  // Refresh token
  refreshToken: () => 
    api.post('/auth/refresh'),
  
  // Forgot password
  forgotPassword: (email) => 
    api.post('/auth/forgot-password', { email }),
};

// Wallet API
export const walletAPI = {
  // Get supported wallets
  getSupportedWallets: () => 
    api.get('/wallet/supported'),
  
  // Get current user's wallet info
  getInfo: () => 
    api.get('/wallet/info'),
  
  // Get user's transactions
  getTransactions: (params = {}) => 
    api.get('/transactions', { params }),
  
  // Generate new wallet
  generateWallet: () => 
    api.post('/wallet/generate'),
  
  // Import wallet
  importWallet: (privateKey) => 
    api.post('/wallet/import', { privateKey }),
  
  // Get wallet info
  getWalletInfo: (address) => 
    api.get(`/wallet/info/${address}`),
  
  // Get wallet balance
  getWalletBalance: (address) => 
    api.get(`/wallet/balance/${address}`),
  
  // Get wallet tokens
  getWalletTokens: (address) => 
    api.get(`/wallet/tokens/${address}`),
  
  // Check wallet connection
  checkConnection: (address) => 
    api.post('/wallet/check-connection', { address }),
  
  // Validate transaction
  validateTransaction: (senderAddress, toAddress, amount, tokenAddress) => 
    api.post('/wallet/validate-transaction', { senderAddress, toAddress, amount, tokenAddress }),
  
  // Estimate transaction fee
  estimateFee: (senderAddress, toAddress, amount, tokenAddress, tokenName) => 
    api.post('/wallet/estimate-fee', { senderAddress, toAddress, amount, tokenAddress, tokenName }),
  
  // Create transfer transaction
  transfer: (privateKey, toAddress, amount, tokenAddress, tokenName) => 
    api.post('/wallet/transfer', { privateKey, toAddress, amount, tokenAddress, tokenName }),
  
  // Get transaction history
  getTransactionHistory: (address, limit = 50) => 
    api.get(`/wallet/history/${address}?limit=${limit}`),
  
  // Generate wallet QR code
  generateQRCode: (address) => 
    api.post('/wallet/qr-code', { address }),
  
  // Parse wallet QR code
  parseQRCode: (qrData) => 
    api.post('/wallet/parse-qr', { qrData }),
  
  // Validate wallet address
  validateAddress: (address) => 
    api.post('/wallet/validate-address', { address }),
};

// Transaction API
export const transactionAPI = {
  // Get user transactions
  getUserTransactions: (params = {}) => 
    api.get('/transactions', { params }),
  
  // Get transaction by hash
  getTransaction: (hash) => 
    api.get(`/transactions/${hash}`),
  
  // Create new transaction
  createTransaction: (transactionData) => 
    api.post('/transactions', transactionData),
  
  // Update transaction
  updateTransaction: (hash, data) => 
    api.put(`/transactions/${hash}`, data),
  
  // Get transaction statistics
  getTransactionStats: (timeRange = '30d') => 
    api.get(`/transactions/stats/summary?timeRange=${timeRange}`),
  
  // Get transaction analytics
  getTransactionAnalytics: (params = {}) => 
    api.get('/transactions/analytics/overview', { params }),
  
  // Export transactions
  exportTransactions: (params = {}) => 
    api.get('/transactions/export/csv', { params, responseType: 'blob' }),
  
  // Monitor address transactions
  monitorAddress: (address) => 
    api.post(`/transactions/monitor/${address}`),
  
  // Stop monitoring address
  stopMonitoring: (address) => 
    api.delete(`/transactions/monitor/${address}`),
};

// Token API
export const tokenAPI = {
  // Get token metadata
  getTokenMetadata: (tokenAddress, tokenName) => 
    api.get(`/tokens/${tokenAddress}/${tokenName}`),
  
  // Get user token balances
  getUserTokenBalances: (address) => 
    api.get('/tokens/balances', { params: { address } }),
  
  // Get specific token balance
  getTokenBalance: (tokenAddress, tokenName, address) => 
    api.get(`/tokens/balance/${tokenAddress}/${tokenName}`, { params: { address } }),
  
  // Get popular tokens
  getPopularTokens: () => 
    api.get('/tokens/popular/list'),
  
  // Search tokens
  searchTokens: (query, limit = 10) => 
    api.get('/tokens/search', { params: { query, limit } }),
  
  // Get token price
  getTokenPrice: (tokenAddress, tokenName) => 
    api.get(`/tokens/price/${tokenAddress}/${tokenName}`),
  
  // Get token transfer history
  getTokenTransferHistory: (tokenAddress, tokenName, address, limit = 20) => 
    api.get(`/tokens/${tokenAddress}/${tokenName}/transfers`, { params: { address, limit } }),
  
  // Validate token
  validateToken: (tokenAddress, tokenName) => 
    api.post('/tokens/validate', { tokenAddress, tokenName }),
};

// User API
export const userAPI = {
  // Get user statistics
  getUserStats: () => 
    api.get('/users/stats'),
  
  // Get user dashboard
  getDashboard: () => 
    api.get('/users/dashboard'),
  
  // Update user preferences
  updatePreferences: (preferences) => 
    api.put('/users/preferences', { preferences }),
  
  // Get user risk profile
  getRiskProfile: () => 
    api.get('/users/risk-profile'),
  
  // Update user risk profile
  updateRiskProfile: (level, factors) => 
    api.put('/users/risk-profile', { level, factors }),
  
  // Get user limits
  getUserLimits: () => 
    api.get('/users/limits'),
  
  // Update user limits
  updateUserLimits: (daily, monthly, single) => 
    api.put('/users/limits', { daily, monthly, single }),
  
  // Get user sessions
  getUserSessions: () => 
    api.get('/users/sessions'),
  
  // Revoke session
  revokeSession: (token) => 
    api.delete(`/users/sessions/${token}`),
  
  // Get user API keys
  getAPIKeys: () => 
    api.get('/users/api-keys'),
  
  // Create API key
  createAPIKey: (name, permissions) => 
    api.post('/users/api-keys', { name, permissions }),
  
  // Delete API key
  deleteAPIKey: (key) => 
    api.delete(`/users/api-keys/${key}`),
  
  // Get user support tickets
  getSupportTickets: () => 
    api.get('/users/support-tickets'),
  
  // Create support ticket
  createSupportTicket: (subject, priority) => 
    api.post('/users/support-tickets', { subject, priority }),
};

// Analytics API
export const analyticsAPI = {
  // Get analytics overview
  getOverview: (timeRange = '30d') => 
    api.get('/analytics/overview', { params: { timeRange } }),
  
  // Get transaction trends
  getTrends: (period = 'daily', days = 30) => 
    api.get('/analytics/trends', { params: { period, days } }),
  
  // Get risk analysis
  getRiskAnalysis: () => 
    api.get('/analytics/risk-analysis'),
  
  // Get network statistics
  getNetworkStats: () => 
    api.get('/analytics/network-stats'),
  
  // Get platform statistics (admin only)
  getPlatformStats: () => 
    api.get('/analytics/platform-stats'),
};

// Swap API (for future implementation)
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

// Health check API
export const healthAPI = {
  checkHealth: () => 
    api.get('/health'),
};

// WebSocket connection for real-time updates
export const createWebSocketConnection = (token) => {
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
  const socket = new WebSocket(`${wsUrl}?token=${token}`);
  
  socket.onopen = () => {
    console.log('WebSocket connected');
  };
  
  socket.onclose = () => {
    console.log('WebSocket disconnected');
  };
  
  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  return socket;
};

// Error handling utility
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    if (data && data.error) {
      return data.error;
    }
    
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