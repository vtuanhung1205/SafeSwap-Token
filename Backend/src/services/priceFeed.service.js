const { logger } = require('../utils/logger');
const { createError } = require('../middleware/errorHandler');
const axios = require('axios');

class PriceFeedService {
  constructor() {
    this.coinGeckoApiUrl = 'https://api.coingecko.com/api/v3';
    this.binanceApiUrl = 'https://api.binance.com/api/v3';
    this.cache = new Map();
    this.cacheExpiry = 60000; // 1 minute
  }

  async getTokenPrice(symbol) {
    try {
      const cacheKey = `price_${symbol.toLowerCase()}`;
      const cached = this.cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }

      // Try CoinGecko first
      let price = await this.getPriceFromCoinGecko(symbol);
      
      if (!price) {
        // Fallback to Binance
        price = await this.getPriceFromBinance(symbol);
      }

      if (!price) {
        throw createError(404, `Price not found for token: ${symbol}`);
      }

      // Cache the result
      this.cache.set(cacheKey, {
        data: price,
        timestamp: Date.now()
      });

      return price;
    } catch (error) {
      logger.error(`Failed to get price for ${symbol}:`, error.message);
      throw error;
    }
  }

  async getPriceFromCoinGecko(symbol) {
    try {
      const symbolMap = {
        'APT': 'aptos',
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'USDC': 'usd-coin',
        'USDT': 'tether'
      };

      const coinId = symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
      
      const response = await axios.get(`${this.coinGeckoApiUrl}/simple/price`, {
        params: {
          ids: coinId,
          vs_currencies: 'usd',
          include_24hr_change: true,
          include_market_cap: true,
          include_24hr_vol: true
        },
        timeout: 10000
      });

      const data = response.data[coinId];
      if (!data) {
        return null;
      }

      return {
        symbol: symbol.toUpperCase(),
        price: data.usd,
        change24h: data.usd_24h_change || 0,
        marketCap: data.usd_market_cap || 0,
        volume24h: data.usd_24h_vol || 0,
        source: 'coingecko',
        timestamp: Date.now()
      };
    } catch (error) {
      logger.warn(`CoinGecko price fetch failed for ${symbol}:`, error.message);
      return null;
    }
  }

  async getPriceFromBinance(symbol) {
    try {
      const binanceSymbol = `${symbol.toUpperCase()}USDT`;
      
      const [priceResponse, statsResponse] = await Promise.all([
        axios.get(`${this.binanceApiUrl}/ticker/price`, {
          params: { symbol: binanceSymbol },
          timeout: 10000
        }),
        axios.get(`${this.binanceApiUrl}/ticker/24hr`, {
          params: { symbol: binanceSymbol },
          timeout: 10000
        })
      ]);

      const price = parseFloat(priceResponse.data.price);
      const stats = statsResponse.data;

      return {
        symbol: symbol.toUpperCase(),
        price: price,
        change24h: parseFloat(stats.priceChangePercent || 0),
        marketCap: 0, // Not available from Binance
        volume24h: parseFloat(stats.volume || 0) * price,
        source: 'binance',
        timestamp: Date.now()
      };
    } catch (error) {
      logger.warn(`Binance price fetch failed for ${symbol}:`, error.message);
      return null;
    }
  }

  async getMultiplePrices(symbols) {
    try {
      const promises = symbols.map(symbol => 
        this.getTokenPrice(symbol).catch(error => {
          logger.warn(`Failed to get price for ${symbol}:`, error.message);
          return null;
        })
      );

      const results = await Promise.allSettled(promises);
      const prices = {};

      results.forEach((result, index) => {
        const symbol = symbols[index];
        if (result.status === 'fulfilled' && result.value) {
          prices[symbol] = result.value;
        } else {
          prices[symbol] = null;
        }
      });

      return prices;
    } catch (error) {
      logger.error('Failed to get multiple prices:', error.message);
      throw createError(500, 'Failed to fetch token prices');
    }
  }

  getPrice(symbol) {
    const cached = this.cache.get(`price_${symbol.toLowerCase()}`);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    
    // Return mock data if no cached price
    const mockPrices = {
      'APT': { symbol: 'APT', price: 8.45, change24h: 2.3 },
      'USDC': { symbol: 'USDC', price: 1.0, change24h: 0.1 },
      'USDT': { symbol: 'USDT', price: 0.999, change24h: -0.1 }
    };
    
    return mockPrices[symbol.toUpperCase()] || null;
  }

  getAllPrices() {
    const allPrices = {};
    this.cache.forEach((cached, key) => {
      if (key.startsWith('price_') && Date.now() - cached.timestamp < this.cacheExpiry) {
        const symbol = cached.data.symbol;
        allPrices[symbol] = cached.data;
      }
    });
    
    // Add mock prices if cache is empty
    if (Object.keys(allPrices).length === 0) {
      return {
        'APT': { symbol: 'APT', price: 8.45, change24h: 2.3 },
        'USDC': { symbol: 'USDC', price: 1.0, change24h: 0.1 },
        'USDT': { symbol: 'USDT', price: 0.999, change24h: -0.1 }
      };
    }
    
    return allPrices;
  }

  clearCache() {
    this.cache.clear();
    logger.info('Price cache cleared');
  }

  getHealthStatus() {
    return {
      service: 'PriceFeedService',
      cacheSize: this.cache.size,
      cacheExpiry: this.cacheExpiry,
      endpoints: {
        coinGecko: this.coinGeckoApiUrl,
        binance: this.binanceApiUrl
      },
      status: 'operational'
    };
  }
}

module.exports = { PriceFeedService };
