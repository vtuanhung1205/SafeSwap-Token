// Aptos Configuration
export const APTOS_CONFIG = {
  // Public endpoint (fallback)
  PUBLIC_NODE_URL: "https://fullnode.mainnet.aptoslabs.com",
  
  // QuickNode RPC endpoint (for blockchain calls)
  QUICKNODE_RPC_URL: process.env.VITE_QUICKNODE_URL || "https://responsive-weathered-hill.aptos-mainnet.quiknode.pro/b363dcabb59e76d6355f22f77644f3a924bce229",
  
  // Use QuickNode RPC if available, otherwise fallback to public
  NODE_URL: process.env.VITE_QUICKNODE_URL || "https://responsive-weathered-hill.aptos-mainnet.quiknode.pro/b363dcabb59e76d6355f22f77644f3a924bce229",
  
  // Aptos Connect configuration (for wallet connection)
  APTOS_CONNECT: {
    baseUrl: "https://aptosconnect.app/prompt/",
    clientId: process.env.VITE_APTOS_CONNECT_CLIENT_ID || "demo-client-id", // Add client ID
    dappName: "SafeSwap",
    dappUrl: process.env.VITE_DAPP_URL || "https://safeswap-frontend.onrender.com",
    callbackUrl: process.env.VITE_CALLBACK_URL || "https://safeswap-frontend.onrender.com/aptos-connect-callback",
    chainId: "1", // Mainnet
    network: "mainnet"
  },
  
  // Network configuration
  NETWORK: "mainnet",
  CHAIN_ID: "1"
};

// Validate Aptos configuration
export const validateAptosConfig = () => {
  if (!APTOS_CONFIG.NODE_URL) {
    throw new Error("Aptos node URL is not configured");
  }
  
  console.log("Aptos Config:", {
    nodeUrl: APTOS_CONFIG.NODE_URL,
    network: APTOS_CONFIG.NETWORK,
    chainId: APTOS_CONFIG.CHAIN_ID,
    usingQuickNode: APTOS_CONFIG.NODE_URL.includes('quicknode'),
    aptosConnect: APTOS_CONFIG.APTOS_CONNECT
  });
  
  return true;
};

// Get AptosClient with QuickNode support
export const getAptosClient = () => {
  const { AptosClient } = require('aptos');
  return new AptosClient(APTOS_CONFIG.NODE_URL);
};

// Create Aptos Connect URL with proper client ID
export const createAptosConnectUrl = () => {
  const request = {
    type: 'connect',
    clientId: APTOS_CONFIG.APTOS_CONNECT.clientId,
    chainId: APTOS_CONFIG.APTOS_CONNECT.chainId,
    dappName: APTOS_CONFIG.APTOS_CONNECT.dappName,
    dappUrl: APTOS_CONFIG.APTOS_CONNECT.dappUrl,
    callbackUrl: APTOS_CONFIG.APTOS_CONNECT.callbackUrl
  };
  
  const encodedRequest = btoa(JSON.stringify(request));
  return `${APTOS_CONFIG.APTOS_CONNECT.baseUrl}?request=${encodedRequest}`;
};

// QuickNode specific utilities
export const QUICKNODE_UTILS = {
  // Check if using QuickNode
  isUsingQuickNode: () => APTOS_CONFIG.NODE_URL.includes('quicknode'),
  
  // Get endpoint info
  getEndpointInfo: () => ({
    url: APTOS_CONFIG.NODE_URL,
    isQuickNode: APTOS_CONFIG.NODE_URL.includes('quicknode'),
    network: APTOS_CONFIG.NETWORK,
    rpcType: 'QuickNode RPC Endpoint'
  }),
  
  // Enhanced error handling for QuickNode
  handleQuickNodeError: (error) => {
    if (APTOS_CONFIG.NODE_URL.includes('quicknode')) {
      console.error('QuickNode RPC Error:', error);
      return {
        type: 'quicknode_rpc_error',
        message: error.message,
        retry: true
      };
    }
    return {
      type: 'general_error',
      message: error.message,
      retry: false
    };
  }
};

// Aptos Connect utilities
export const APTOS_CONNECT_UTILS = {
  // Get Aptos Connect info
  getConnectInfo: () => ({
    baseUrl: APTOS_CONFIG.APTOS_CONNECT.baseUrl,
    clientId: APTOS_CONFIG.APTOS_CONNECT.clientId,
    dappName: APTOS_CONFIG.APTOS_CONNECT.dappName,
    dappUrl: APTOS_CONFIG.APTOS_CONNECT.dappUrl,
    callbackUrl: APTOS_CONFIG.APTOS_CONNECT.callbackUrl,
    serviceType: 'Aptos Connect Wallet Service'
  }),
  
  // Create connect URL
  createConnectUrl: createAptosConnectUrl,
  
  // Handle Aptos Connect errors
  handleConnectError: (error) => {
    console.error('Aptos Connect Error:', error);
    return {
      type: 'aptos_connect_error',
      message: error.message,
      retry: true
    };
  },
  
  // Validate Aptos Connect configuration
  validateConfig: () => {
    const required = ['clientId', 'dappName', 'dappUrl', 'callbackUrl'];
    const missing = required.filter(key => !APTOS_CONFIG.APTOS_CONNECT[key]);
    
    if (missing.length > 0) {
      console.warn('Missing Aptos Connect configuration:', missing);
      return false;
    }
    
    return true;
  }
}; 