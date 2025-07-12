import axios from 'axios';
import cron from 'node-cron';
import { TokenPrice } from '@/models/TokenPrice.model';
import { logger } from '@/utils/logger';

export class PriceFeedService {
  private readonly coingeckoApiKey: string;
  private readonly coinmarketcapApiKey: string;
  private readonly supportedTokens: string[] = ['bitcoin', 'ethereum', 'aptos', 'tether', 'usd-coin'];

  constructor() {
    this.coingeckoApiKey = process.env.COINGECKO_API_KEY || '';
    this.coinmarketcapApiKey = process.env.COINMARKETCAP_API_KEY || '';
  }

  public initialize(): void {
    // Fetch prices immediately on startup
    this.fetchAllPrices();
    
    // Schedule price updates every 30 seconds
    cron.schedule('*/30 * * * * *', async () => {
      try {
        await this.fetchAllPrices();
      } catch (error) {
        logger.error('Scheduled price fetch failed:', error);
      }
    });

    logger.info('💰 PriceFeedService initialized with 30-second intervals');
  }

  public async fetchAllPrices(): Promise<void> {
    try {
      const priceData = await this.fetchFromCoingecko();
      await this.updatePricesInDatabase(priceData);
      logger.info(`📊 Updated prices for ${priceData.length} tokens`);
    } catch (error) {
      logger.error('Failed to fetch prices:', error);
    }
  }

  private async fetchFromCoingecko(): Promise<any[]> {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
        params: {
          ids: this.supportedTokens.join(','),
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_24hr_vol: true,
          include_market_cap: true,
        },
        headers: {
          'X-CG-Demo-API-Key': this.coingeckoApiKey,
        },
        timeout: 10000,
      });

      return this.formatCoingeckoResponse(response.data);
    } catch (error) {
      logger.error('Coingecko API error:', error);
      throw error;
    }
  }

  private formatCoingeckoResponse(data: any): any[] {
    const formattedData: any[] = [];

    for (const [tokenId, priceInfo] of Object.entries(data)) {
      const info = priceInfo as any;
      formattedData.push({
        symbol: this.getSymbolFromId(tokenId),
        name: this.getNameFromId(tokenId),
        price: info.usd || 0,
        change24h: info.usd_24h_change || 0,
        volume24h: info.usd_24h_vol || 0,
        marketCap: info.usd_market_cap || 0,
        lastUpdated: new Date(),
      });
    }

    return formattedData;
  }

  private getSymbolFromId(tokenId: string): string {
    const idToSymbol: { [key: string]: string } = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'aptos': 'APT',
      'tether': 'USDT',
      'usd-coin': 'USDC',
    };
    return idToSymbol[tokenId] || tokenId.toUpperCase();
  }

  private getNameFromId(tokenId: string): string {
    const idToName: { [key: string]: string } = {
      'bitcoin': 'Bitcoin',
      'ethereum': 'Ethereum',
      'aptos': 'Aptos',
      'tether': 'Tether',
      'usd-coin': 'USD Coin',
    };
    return idToName[tokenId] || tokenId;
  }

  private async updatePricesInDatabase(priceData: any[]): Promise<void> {
    try {
      for (const tokenData of priceData) {
        await TokenPrice.findOneAndUpdate(
          { symbol: tokenData.symbol },
          tokenData,
          { upsert: true, new: true }
        );
      }
    } catch (error) {
      logger.error('Database update failed:', error);
      throw error;
    }
  }

  public async getTokenPrice(symbol: string): Promise<any | null> {
    try {
      const tokenPrice = await TokenPrice.findOne({ symbol: symbol.toUpperCase() });
      return tokenPrice;
    } catch (error) {
      logger.error(`Failed to get price for ${symbol}:`, error);
      return null;
    }
  }

  public async getAllTokenPrices(): Promise<any[]> {
    try {
      const tokenPrices = await TokenPrice.find({});
      return tokenPrices;
    } catch (error) {
      logger.error('Failed to get all token prices:', error);
      return [];
    }
  }

  public async calculateExchangeRate(fromSymbol: string, toSymbol: string): Promise<number> {
    try {
      const fromToken = await this.getTokenPrice(fromSymbol);
      const toToken = await this.getTokenPrice(toSymbol);

      if (!fromToken || !toToken) {
        throw new Error('Token price not found');
      }

      return fromToken.price / toToken.price;
    } catch (error) {
      logger.error(`Failed to calculate exchange rate ${fromSymbol}/${toSymbol}:`, error);
      throw error;
    }
  }
} 