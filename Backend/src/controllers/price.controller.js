const { TokenPrice } = require('../models/TokenPrice.model');
const { PriceFeedService } = require('../services/priceFeed.service');
const { createError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const priceFeedService = new PriceFeedService();

class PriceController {
  async getCurrentPrice(req, res, next) {
    try {
      const { symbol } = req.params;

      if (!symbol) {
        throw createError(400, 'Symbol parameter is required');
      }

      // Try to get price from service first
      let price = priceFeedService.getPrice(symbol);

      if (!price) {
        // Fallback to database
        const tokenPrice = await TokenPrice.findOne({ 
          symbol: symbol.toUpperCase() 
        });
        
        if (tokenPrice) {
          price = {
            symbol: tokenPrice.symbol,
            price: tokenPrice.price,
            change24h: tokenPrice.change24h,
            volume24h: tokenPrice.volume24h,
            marketCap: tokenPrice.marketCap,
            lastUpdated: tokenPrice.lastUpdated,
            source: 'database',
          };
        }
      }

      if (!price) {
        throw createError(404, `Price not found for symbol: ${symbol}`);
      }

      res.json({
        success: true,
        data: { price },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllPrices(req, res, next) {
    try {
      const { symbols } = req.query;

      let prices;

      if (symbols) {
        // Get specific symbols
        const symbolArray = symbols.split(',').map(s => s.trim().toUpperCase());
        prices = await priceFeedService.getMultiplePrices(symbolArray);
      } else {
        // Get all available prices
        prices = priceFeedService.getAllPrices();
      }

      res.json({
        success: true,
        data: { prices },
      });
    } catch (error) {
      next(error);
    }
  }

  async getHistoricalPrices(req, res, next) {
    try {
      const { symbol } = req.params;
      const { days = 7, interval = 'hourly' } = req.query;

      if (!symbol) {
        throw createError(400, 'Symbol parameter is required');
      }

      // For now, return mock historical data
      // In production, this would fetch from external API or database
      const mockHistoricalData = this.generateMockHistoricalData(
        symbol,
        parseInt(days)
      );

      res.json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          period: `${days} days`,
          interval,
          prices: mockHistoricalData,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updatePrice(req, res, next) {
    try {
      const { symbol } = req.params;
      const { price, change24h, volume24h, marketCap } = req.body;

      if (!symbol || price === undefined) {
        throw createError(400, 'Symbol and price are required');
      }

      const updateData = {
        symbol: symbol.toUpperCase(),
        price: parseFloat(price),
        lastUpdated: new Date(),
      };

      if (change24h !== undefined) updateData.change24h = parseFloat(change24h);
      if (volume24h !== undefined) updateData.volume24h = parseFloat(volume24h);
      if (marketCap !== undefined) updateData.marketCap = parseFloat(marketCap);

      const tokenPrice = await TokenPrice.findOneAndUpdate(
        { symbol: symbol.toUpperCase() },
        updateData,
        { upsert: true, new: true, runValidators: true }
      );

      logger.info(`Price updated for ${symbol}: ${price}`);

      res.json({
        success: true,
        message: 'Price updated successfully',
        data: { tokenPrice },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPriceAlerts(req, res, next) {
    try {
      // Mock price alerts functionality
      // In production, this would check user's price alert settings
      const alerts = [
        {
          id: 1,
          symbol: 'APT',
          type: 'above',
          targetPrice: 10.0,
          currentPrice: 8.45,
          isActive: true,
          createdAt: new Date(),
        },
        {
          id: 2,
          symbol: 'USDC',
          type: 'below',
          targetPrice: 0.99,
          currentPrice: 1.0,
          isActive: true,
          createdAt: new Date(),
        },
      ];

      res.json({
        success: true,
        data: { alerts },
      });
    } catch (error) {
      next(error);
    }
  }

  async createPriceAlert(req, res, next) {
    try {
      const { symbol, type, targetPrice } = req.body;

      if (!symbol || !type || !targetPrice) {
        throw createError(400, 'Symbol, type, and targetPrice are required');
      }

      if (!['above', 'below'].includes(type)) {
        throw createError(400, 'Type must be either "above" or "below"');
      }

      // Mock alert creation
      const alert = {
        id: Date.now(),
        symbol: symbol.toUpperCase(),
        type,
        targetPrice: parseFloat(targetPrice),
        isActive: true,
        createdAt: new Date(),
      };

      logger.info(`Price alert created: ${symbol} ${type} ${targetPrice}`);

      res.status(201).json({
        success: true,
        message: 'Price alert created successfully',
        data: { alert },
      });
    } catch (error) {
      next(error);
    }
  }

  async getMarketStats(req, res, next) {
    try {
      // Mock market statistics
      const stats = {
        totalMarketCap: 1250000000000, // $1.25T
        totalVolume24h: 45000000000, // $45B
        marketCapChange24h: 2.5,
        btcDominance: 42.3,
        ethDominance: 18.7,
        activeCryptocurrencies: 2500,
        topGainers: [
          { symbol: 'APT', change24h: 15.2 },
          { symbol: 'SUI', change24h: 12.8 },
          { symbol: 'NEAR', change24h: 8.4 },
        ],
        topLosers: [
          { symbol: 'DOGE', change24h: -8.1 },
          { symbol: 'SHIB', change24h: -6.3 },
          { symbol: 'ADA', change24h: -4.2 },
        ],
      };

      res.json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrendingTokens(req, res, next) {
    try {
      // Mock trending tokens
      const trending = [
        { symbol: 'APT', name: 'Aptos', change24h: 5.2, volume24h: 125000000 },
        { symbol: 'SUI', name: 'Sui', change24h: 3.8, volume24h: 95000000 },
        { symbol: 'ARB', name: 'Arbitrum', change24h: 2.1, volume24h: 78000000 },
        { symbol: 'OP', name: 'Optimism', change24h: 1.9, volume24h: 65000000 },
        { symbol: 'MATIC', name: 'Polygon', change24h: 1.5, volume24h: 55000000 },
      ];

      res.json({
        success: true,
        data: { trending },
      });
    } catch (error) {
      next(error);
    }
  }

  // Helper method to generate mock historical data
  generateMockHistoricalData(symbol, days) {
    const prices = [];
    const currentPrice = 8.45; // Mock current price for APT
    const now = Date.now();

    for (let i = days; i >= 0; i--) {
      const timestamp = now - i * 24 * 60 * 60 * 1000;
      const randomChange = (Math.random() - 0.5) * 0.1; // ±5% random change
      const price = currentPrice * (1 + randomChange);

      prices.push({
        timestamp,
        price: parseFloat(price.toFixed(6)),
        date: new Date(timestamp).toISOString(),
      });
    }

    return prices;
  }
}

module.exports = { PriceController };
