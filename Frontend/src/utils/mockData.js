// Mock data for demo purposes
export const mockSwapHistory = [
  {
    _id: '1',
    fromToken: 'BTC',
    toToken: 'ETH',
    fromAmount: 0.5,
    toAmount: 8.2,
    usdValue: 31500,
    status: 'completed',
    scamRisk: 15,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    _id: '2',
    fromToken: 'ETH',
    toToken: 'USDT',
    fromAmount: 2.5,
    toAmount: 6250,
    usdValue: 6250,
    status: 'completed',
    scamRisk: 5,
    createdAt: '2024-01-14T14:22:00Z'
  },
  {
    _id: '3',
    fromToken: 'APT',
    toToken: 'BTC',
    fromAmount: 1000,
    toAmount: 0.125,
    usdValue: 7875,
    status: 'pending',
    scamRisk: 25,
    createdAt: '2024-01-13T09:15:00Z'
  },
  {
    _id: '4',
    fromToken: 'USDC',
    toToken: 'ETH',
    fromAmount: 5000,
    toAmount: 2.0,
    usdValue: 5000,
    status: 'completed',
    scamRisk: 8,
    createdAt: '2024-01-12T16:45:00Z'
  },
  {
    _id: '5',
    fromToken: 'DOGE',
    toToken: 'USDT',
    fromAmount: 50000,
    toToken: 'USDT',
    toAmount: 4200,
    usdValue: 4200,
    status: 'failed',
    scamRisk: 85,
    createdAt: '2024-01-11T11:30:00Z'
  },
  {
    _id: '6',
    fromToken: 'SOL',
    toToken: 'BTC',
    fromAmount: 25,
    toAmount: 0.025,
    usdValue: 1575,
    status: 'completed',
    scamRisk: 12,
    createdAt: '2024-01-10T13:20:00Z'
  },
  {
    _id: '7',
    fromToken: 'ADA',
    toToken: 'ETH',
    fromAmount: 2000,
    toAmount: 0.8,
    usdValue: 2000,
    status: 'completed',
    scamRisk: 18,
    createdAt: '2024-01-09T08:10:00Z'
  },
  {
    _id: '8',
    fromToken: 'MATIC',
    toToken: 'USDC',
    fromAmount: 1500,
    toAmount: 1275,
    usdValue: 1275,
    status: 'pending',
    scamRisk: 35,
    createdAt: '2024-01-08T15:55:00Z'
  }
];

export const mockStats = {
  totalSwaps: 47,
  totalVolume: 125420.50,
  successRate: 85.1,
  avgAmount: 2668.95
};

export const mockPrices = {
  BTC: { price: 63000, change24h: 2.5 },
  ETH: { price: 2500, change24h: -1.2 },
  APT: { price: 7.85, change24h: 5.8 },
  USDT: { price: 1.0, change24h: 0.1 },
  USDC: { price: 1.0, change24h: 0.0 },
  SOL: { price: 63, change24h: 3.2 },
  ADA: { price: 1.0, change24h: -0.8 },
  MATIC: { price: 0.85, change24h: 1.5 },
  DOGE: { price: 0.084, change24h: -2.1 }
};

export const mockUser = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=06b6d4&color=fff&size=128',
  walletAddress: '0x1234567890abcdef1234567890abcdef12345678'
};

// Mock API functions
export const mockAPI = {
  getSwapHistory: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            swaps: mockSwapHistory,
            total: mockSwapHistory.length
          }
        });
      }, 500); // Simulate API delay
    });
  },

  getSwapStats: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: mockStats
        });
      }, 300);
    });
  },

  getPrices: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: mockPrices
        });
      }, 200);
    });
  }
};

// Helper function to generate random swap data
export const generateRandomSwap = () => {
  const tokens = ['BTC', 'ETH', 'APT', 'USDT', 'USDC', 'SOL', 'ADA', 'MATIC', 'DOGE'];
  const statuses = ['completed', 'pending', 'failed'];
  const fromToken = tokens[Math.floor(Math.random() * tokens.length)];
  let toToken;
  do {
    toToken = tokens[Math.floor(Math.random() * tokens.length)];
  } while (toToken === fromToken);

  const fromAmount = Math.random() * 100;
  const toAmount = Math.random() * 1000;
  const usdValue = Math.random() * 10000;
  const scamRisk = Math.floor(Math.random() * 100);
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    _id: Date.now().toString(),
    fromToken,
    toToken,
    fromAmount: parseFloat(fromAmount.toFixed(6)),
    toAmount: parseFloat(toAmount.toFixed(6)),
    usdValue: parseFloat(usdValue.toFixed(2)),
    status,
    scamRisk,
    createdAt: new Date().toISOString()
  };
}; 