export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  googleId?: string;
  walletAddress?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  _id: string;
  userId: string;
  address: string;
  publicKey: string;
  chainId: string;
  balance: number;
  isConnected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: Date;
}

export interface SwapTransaction {
  _id: string;
  userId: string;
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  transactionHash: string;
  status: 'pending' | 'completed' | 'failed';
  scamRisk: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScamDetectionResult {
  tokenAddress: string;
  riskScore: number;
  confidence: number;
  reasons: string[];
  isScam: boolean;
  checkedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: string;
}

export interface PriceUpdateMessage extends WebSocketMessage {
  type: 'price_update';
  data: {
    symbol: string;
    price: number;
    change24h: number;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}