// Aptos Configuration
const APTOS_CONFIG = {
  // Development: Public node (có rate limits)
  development: {
    nodeUrl: 'https://fullnode.mainnet.aptoslabs.com/v1',
    apiKey: null,
    description: 'Public Aptos node - có rate limits'
  },
  
  // Production: QuickNode hoặc Alchemy (cần API key)
  production: {
    // QuickNode endpoint (thay YOUR_API_KEY bằng API key thật)
    nodeUrl: process.env.VITE_APTOS_NODE_URL || 'https://aptos-mainnet.quiknode.pro/YOUR_API_KEY/',
    apiKey: process.env.VITE_APTOS_API_KEY,
    description: 'QuickNode/Alchemy node - không có rate limits'
  }
};

// Chọn config dựa trên environment
const isProduction = import.meta.env.PROD;
const config = isProduction ? APTOS_CONFIG.production : APTOS_CONFIG.development;

export const APTOS_NODE_URL = config.nodeUrl;
export const APTOS_API_KEY = config.apiKey;

// Helper function để tạo AptosClient với config đúng
export const createAptosClient = () => {
  const { AptosClient } = require('aptos');
  return new AptosClient(APTOS_NODE_URL);
};

// Validate config
export const validateAptosConfig = () => {
  if (isProduction && !APTOS_API_KEY) {
    console.warn('⚠️ Production mode detected but no API key provided. Using public node with rate limits.');
    return false;
  }
  return true;
};

export default APTOS_CONFIG; 