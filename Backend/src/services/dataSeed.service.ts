import { TokenPrice } from '@/models/TokenPrice.model';
import { logger } from '@/utils/logger';

export class DataSeedService {
  private mockTokens = [
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
    },
    {
      symbol: 'SOL',
      name: 'Solana',
      price: 98.50,
      change_24h: 7.83,
      volume_24h: 2100000000,
      market_cap: 42000000000,
      logo_url: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
      rank: 6,
      circulating_supply: 426000000,
      max_supply: 0
    },
    {
      symbol: 'XRP',
      name: 'XRP',
      price: 0.62,
      change_24h: 4.12,
      volume_24h: 1800000000,
      market_cap: 33000000000,
      logo_url: 'https://assets.coingecko.com/coins/images/44/large/xrp-symbol-white-128.png',
      rank: 7,
      circulating_supply: 53000000000,
      max_supply: 100000000000
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      price: 1.00,
      change_24h: -0.01,
      volume_24h: 3500000000,
      market_cap: 25000000000,
      logo_url: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
      rank: 8,
      circulating_supply: 25000000000,
      max_supply: 0
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      price: 0.48,
      change_24h: 2.67,
      volume_24h: 450000000,
      market_cap: 17000000000,
      logo_url: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
      rank: 9,
      circulating_supply: 35000000000,
      max_supply: 45000000000
    },
    {
      symbol: 'AVAX',
      name: 'Avalanche',
      price: 37.80,
      change_24h: -3.21,
      volume_24h: 680000000,
      market_cap: 14000000000,
      logo_url: 'https://assets.coingecko.com/coins/images/12559/large/coin-round-red.png',
      rank: 10,
      circulating_supply: 370000000,
      max_supply: 720000000
    },
    {
      symbol: 'DOGE',
      name: 'Dogecoin',
      price: 0.087,
      change_24h: 1.45,
      volume_24h: 890000000,
      market_cap: 12500000000,
      logo_url: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
      rank: 11,
      circulating_supply: 142000000000,
      max_supply: 0
    },
    {
      symbol: 'MATIC',
      name: 'Polygon',
      price: 0.92,
      change_24h: 6.12,
      volume_24h: 520000000,
      market_cap: 8500000000,
      logo_url: 'https://assets.coingecko.com/coins/images/4713/large/matic-token-icon.png',
      rank: 12,
      circulating_supply: 9200000000,
      max_supply: 10000000000
    },
    {
      symbol: 'DOT',
      name: 'Polkadot',
      price: 7.25,
      change_24h: -1.89,
      volume_24h: 310000000,
      market_cap: 9000000000,
      logo_url: 'https://assets.coingecko.com/coins/images/12171/large/polkadot.png',
      rank: 13,
      circulating_supply: 1240000000,
      max_supply: 0
    },
    {
      symbol: 'LTC',
      name: 'Litecoin',
      price: 72.50,
      change_24h: -0.85,
      volume_24h: 420000000,
      market_cap: 5400000000,
      logo_url: 'https://assets.coingecko.com/coins/images/2/large/litecoin.png',
      rank: 14,
      circulating_supply: 74500000,
      max_supply: 84000000
    },
    {
      symbol: 'LINK',
      name: 'Chainlink',
      price: 14.80,
      change_24h: 3.78,
      volume_24h: 380000000,
      market_cap: 8200000000,
      logo_url: 'https://assets.coingecko.com/coins/images/877/large/chainlink-new-logo.png',
      rank: 15,
      circulating_supply: 554000000,
      max_supply: 1000000000
    }
  ];

  async seedDatabase(): Promise<void> {
    try {
      logger.info('Starting database seeding...');
      
      // Clear existing data
      await TokenPrice.deleteMany({});
      logger.info('Cleared existing token price data');

      // Insert mock data with random price updates
      const tokensWithUpdatedPrices = this.mockTokens.map(token => ({
        ...token,
        price: this.addRandomVariation(token.price, 0.05), // ±5% variation
        change_24h: this.addRandomVariation(token.change_24h, 2), // ±2% variation
        volume_24h: this.addRandomVariation(token.volume_24h, 0.2), // ±20% variation
        last_updated: new Date()
      }));

      await TokenPrice.insertMany(tokensWithUpdatedPrices);
      logger.info(`Successfully seeded ${tokensWithUpdatedPrices.length} tokens`);

    } catch (error) {
      logger.error('Error seeding database:', error);
      throw error;
    }
  }

  async updatePrices(): Promise<void> {
    try {
      const tokens = await TokenPrice.find({});
      
      for (const token of tokens) {
        // Add random price variation (±2%)
        const newPrice = this.addRandomVariation(token.price, 0.02);
        const priceChange = ((newPrice - token.price) / token.price) * 100;
        
        token.price = newPrice;
        token.change_24h = this.addRandomVariation(token.change_24h, 1);
        token.volume_24h = this.addRandomVariation(token.volume_24h, 0.1);
        token.last_updated = new Date();
        
        await token.save();
      }

      logger.info(`Updated prices for ${tokens.length} tokens`);
    } catch (error) {
      logger.error('Error updating prices:', error);
      throw error;
    }
  }

  private addRandomVariation(value: number, maxVariationPercent: number): number {
    const variation = (Math.random() - 0.5) * 2 * maxVariationPercent;
    const newValue = value * (1 + variation);
    return Math.max(newValue, 0); // Ensure non-negative values
  }

  async getMarketStats() {
    try {
      const stats = await TokenPrice.aggregate([
        {
          $group: {
            _id: null,
            total_market_cap: { $sum: '$market_cap' },
            total_volume_24h: { $sum: '$volume_24h' },
            avg_change_24h: { $avg: '$change_24h' },
            count: { $sum: 1 }
          }
        }
      ]);

      return stats[0] || {
        total_market_cap: 0,
        total_volume_24h: 0,
        avg_change_24h: 0,
        count: 0
      };
    } catch (error) {
      logger.error('Error getting market stats:', error);
      throw error;
    }
  }
}
