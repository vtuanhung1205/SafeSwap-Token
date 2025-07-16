import { logger } from '@/utils/logger';

// In-memory data storage (thay thế MongoDB)
interface MockUser {
  id: string;
  email: string;
  password: string;
  name: string;
  avatar?: string;
  walletAddress?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface MockTokenPrice {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  market_cap: number;
  last_updated: Date;
  logo_url?: string;
  rank?: number;
  circulating_supply?: number;
  max_supply?: number;
}

class InMemoryDatabase {
  private users: MockUser[] = [];
  private tokenPrices: MockTokenPrice[] = [];
  private userIdCounter = 1;
  private tokenIdCounter = 1;

  constructor() {
    this.initializeTokenPrices();
    this.initializeSampleUsers();
  }

  // User methods
  async createUser(userData: Omit<MockUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<MockUser> {
    const user: MockUser = {
      ...userData,
      id: `user_${this.userIdCounter++}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.push(user);
    logger.info(`User created: ${user.email}`);
    return user;
  }

  async findUserByEmail(email: string): Promise<MockUser | null> {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  }

  async findUserById(id: string): Promise<MockUser | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async updateUser(id: string, updates: Partial<MockUser>): Promise<MockUser | null> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date()
    };

    return this.users[userIndex];
  }

  // Token Price methods
  async findAllTokenPrices(options?: {
    limit?: number;
    offset?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<{ tokens: MockTokenPrice[]; total: number }> {
    let sortedTokens = [...this.tokenPrices];

    // Sorting
    if (options?.sortBy) {
      sortedTokens.sort((a, b) => {
        const aVal = (a as any)[options.sortBy!];
        const bVal = (b as any)[options.sortBy!];
        
        if (options.order === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    // Pagination
    const offset = options?.offset || 0;
    const limit = options?.limit || 50;
    const paginatedTokens = sortedTokens.slice(offset, offset + limit);

    return {
      tokens: paginatedTokens,
      total: this.tokenPrices.length
    };
  }

  async findTokenBySymbol(symbol: string): Promise<MockTokenPrice | null> {
    return this.tokenPrices.find(token => 
      token.symbol.toLowerCase() === symbol.toLowerCase()
    ) || null;
  }

  async updateTokenPrice(symbol: string, updates: Partial<MockTokenPrice>): Promise<void> {
    const tokenIndex = this.tokenPrices.findIndex(token => 
      token.symbol.toLowerCase() === symbol.toLowerCase()
    );
    
    if (tokenIndex !== -1) {
      this.tokenPrices[tokenIndex] = {
        ...this.tokenPrices[tokenIndex],
        ...updates,
        last_updated: new Date()
      };
    }
  }

  async getMarketStats() {
    const totalMarketCap = this.tokenPrices.reduce((sum, token) => sum + token.market_cap, 0);
    const totalVolume24h = this.tokenPrices.reduce((sum, token) => sum + token.volume_24h, 0);
    const avgChange24h = this.tokenPrices.reduce((sum, token) => sum + token.change_24h, 0) / this.tokenPrices.length;

    return {
      total_market_cap: totalMarketCap,
      total_volume_24h: totalVolume24h,
      avg_change_24h: avgChange24h,
      count: this.tokenPrices.length
    };
  }

  // Initialize sample token data
  private initializeTokenPrices(): void {
    const sampleTokens = [
      {
        symbol: 'APT',
        name: 'Aptos',
        price: 12.50,
        change_24h: 5.24,
        volume_24h: 245000000,
        market_cap: 4500000000,
        logo_url: 'https://assets.coingecko.com/coins/images/26455/large/aptos_round.png',
        rank: 1,
        circulating_supply: 360000000,
        max_supply: 1000000000
      },
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 43000.00,
        change_24h: -2.15,
        volume_24h: 15000000000,
        market_cap: 850000000000,
        logo_url: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        rank: 2,
        circulating_supply: 19750000,
        max_supply: 21000000
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        price: 2300.00,
        change_24h: 3.45,
        volume_24h: 8500000000,
        market_cap: 276000000000,
        logo_url: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        rank: 3,
        circulating_supply: 120000000,
        max_supply: 0
      },
      {
        symbol: 'USDT',
        name: 'Tether',
        price: 1.00,
        change_24h: 0.02,
        volume_24h: 25000000000,
        market_cap: 95000000000,
        logo_url: 'https://assets.coingecko.com/coins/images/325/large/Tether-logo.png',
        rank: 4,
        circulating_supply: 95000000000,
        max_supply: 0
      },
      {
        symbol: 'BNB',
        name: 'BNB',
        price: 310.00,
        change_24h: -1.25,
        volume_24h: 1200000000,
        market_cap: 47000000000,
        logo_url: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
        rank: 5,
        circulating_supply: 153000000,
        max_supply: 200000000
      }
    ];

    this.tokenPrices = sampleTokens.map(token => ({
      ...token,
      id: `token_${this.tokenIdCounter++}`,
      last_updated: new Date()
    }));

    logger.info(`Initialized ${this.tokenPrices.length} sample tokens`);
  }

  // Initialize sample users for testing
  private async initializeSampleUsers(): Promise<void> {
    try {
      const bcrypt = require('bcryptjs');
      
      // Sample users with hashed passwords
      const sampleUsers: MockUser[] = [
        {
          id: 'user_demo',
          email: 'demo@safeswap.com',
          password: await bcrypt.hash('123456', 12), // password: 123456
          name: 'Demo User',
          avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=6366f1&color=fff',
          walletAddress: '0xa1b2c3d4e5f6789012345678901234567890abcd',
          isVerified: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        },
        {
          id: 'user_admin',
          email: 'admin@safeswap.com',
          password: await bcrypt.hash('admin123', 12), // password: admin123
          name: 'Admin User',
          avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=f59e0b&color=fff',
          walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
          isVerified: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date()
        },
        {
          id: 'user_john',
          email: 'john@example.com',
          password: await bcrypt.hash('password123', 12), // password: password123
          name: 'John Doe',
          avatar: 'https://ui-avatars.com/api/?name=John+Doe&background=10b981&color=fff',
          walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
          isVerified: true,
          createdAt: new Date('2024-02-15'),
          updatedAt: new Date()
        }
      ];

      // Add sample users to the database
      this.users = sampleUsers;
      this.userIdCounter = 4; // Start from 4 since we have 3 sample users
      
      logger.info('Sample users initialized for testing');
      logger.info('Available test accounts:');
      logger.info('1. demo@safeswap.com / 123456');
      logger.info('2. admin@safeswap.com / admin123');
      logger.info('3. john@example.com / password123');
    } catch (error) {
      logger.error('Failed to initialize sample users:', error);
    }
  }

  // Update prices with random variations (for demo)
  updatePricesRandomly(): void {
    this.tokenPrices.forEach(token => {
      // Random price variation ±2%
      const variation = (Math.random() - 0.5) * 0.04;
      token.price = Math.max(token.price * (1 + variation), 0.000001);
      
      // Random change_24h variation ±1%
      const changeVariation = (Math.random() - 0.5) * 2;
      token.change_24h += changeVariation;
      
      // Random volume variation ±10%
      const volumeVariation = (Math.random() - 0.5) * 0.2;
      token.volume_24h = Math.max(token.volume_24h * (1 + volumeVariation), 1000);
      
      token.last_updated = new Date();
    });

    logger.info('Updated token prices randomly');
  }

  // Get all data (for debugging)
  getAllData() {
    return {
      users: this.users,
      tokenPrices: this.tokenPrices
    };
  }

  // Clear all data
  clearAllData(): void {
    this.users = [];
    this.tokenPrices = [];
    this.userIdCounter = 1;
    this.tokenIdCounter = 1;
    this.initializeTokenPrices();
    logger.info('Cleared all data and reinitialized');
  }
}

// Export singleton instance
export const mockDB = new InMemoryDatabase();
