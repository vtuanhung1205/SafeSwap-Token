// Demo mode configuration
// Set to true to use mock data for demo purposes
// Set to false to use real API connections
export const DEMO_MODE = false;

// Demo configuration options
export const DEMO_CONFIG = {
  // Auto-login user in demo mode
  autoLogin: true,
  
  // Show demo badge in UI
  showDemoBadge: true,
  
  // Simulate API delays
  simulateApiDelay: true,
  
  // Mock data refresh intervals (in ms)
  priceUpdateInterval: 5000,
  
  // Demo user preferences
  mockUserPreferences: {
    theme: 'dark',
    language: 'en',
    notifications: true
  }
};

// Demo data endpoints
export const DEMO_ENDPOINTS = {
  prices: '/mock/prices',
  swapHistory: '/mock/swap-history',
  swapStats: '/mock/swap-stats',
  tokenAnalysis: '/mock/token-analysis'
};

// Helper function to check if we're in demo mode
export const isDemoMode = () => DEMO_MODE;

// Helper to get demo config
export const getDemoConfig = () => DEMO_CONFIG; 