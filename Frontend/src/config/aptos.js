// Aptos Configuration for Traditional Wallet Adapters
export const APTOS_CONFIG = {
  // Network Configuration
  NETWORK: 'mainnet',
  NODE_URL: 'https://fullnode.mainnet.aptoslabs.com',
  
  // QuickNode RPC (if needed)
  QUICKNODE_RPC_URL: 'https://aptos-mainnet.public.blastapi.io',
  
  // Public Node URL
  PUBLIC_NODE_URL: 'https://fullnode.mainnet.aptoslabs.com',
  
  // Chain ID
  CHAIN_ID: 1,
  
  // Module Addresses
  MODULE_ADDRESSES: {
    LIQUIDSWAP: '0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12',
    PONTEM: '0x1::coin',
  },
  
  // Token Configuration
  TOKENS: {
    APT: {
      symbol: 'APT',
      decimals: 8,
      name: 'Aptos Coin',
    },
    USDC: {
      symbol: 'USDC',
      decimals: 6,
      name: 'USD Coin',
    },
  },
  
  // Wallet Configuration
  WALLET_CONFIG: {
    // Traditional Wallet Adapters don't need client ID
    // They work directly with wallet extensions
    SUPPORTED_WALLETS: [
      'martian',
      'pontem', 
      'rise',
      'fewcha'
    ],
    
    // Auto connect settings
    AUTO_CONNECT: true,
    
    // Network validation
    VALIDATE_NETWORK: true,
  },
  
  // API Configuration
  API_CONFIG: {
    COINGECKO_API: 'https://api.coingecko.com/api/v3',
    GEECKOTERMINAL_API: 'https://api.geckoterminal.com/api/v2',
    PANORA_API: 'https://api.panora.exchange/v1',
  },
  
  // Transaction Configuration
  TRANSACTION_CONFIG: {
    MAX_GAS: 2000,
    GAS_PRICE: 100,
    TIMEOUT_SECONDS: 30,
  },
};

// Export individual configs for convenience
export const {
  NETWORK,
  NODE_URL,
  QUICKNODE_RPC_URL,
  PUBLIC_NODE_URL,
  CHAIN_ID,
  MODULE_ADDRESSES,
  TOKENS,
  WALLET_CONFIG,
  API_CONFIG,
  TRANSACTION_CONFIG,
} = APTOS_CONFIG;

export default APTOS_CONFIG; 