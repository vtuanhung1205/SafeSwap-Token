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

  async analyzeToken(req, res, next) {
    try {
      const { tokenAddress, tokenName, tokenSymbol } = req.body;
      const { ScamDetectionService } = require('../services/scamDetection.service');
      const scamDetectionService = new ScamDetectionService();
      
      const analysis = await scamDetectionService.analyzeToken(tokenAddress, tokenName, tokenSymbol);
      
      res.json({
        success: true,
        data: { analysis }
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

      // For now, return empty data or 501 Not Implemented since historical data requires a Timeseries DB setup for Mainnet
      const historicalData = [];

      res.json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          period: `${days} days`,
          interval,
          prices: historicalData,
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
      // In production, this would check user's price alert settings
      const alerts = [];

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

      // Real alert creation logic would go here. Returning 501 Not Implemented for Mainnet until DB schema is ready
      throw createError(501, 'Price alerts not implemented in this version');

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
      // Return empty stats until a real market aggregator is integrated
      const stats = {
        totalMarketCap: 0,
        totalVolume24h: 0,
        marketCapChange24h: 0,
        btcDominance: 0,
        ethDominance: 0,
        activeCryptocurrencies: 0,
        topGainers: [],
        topLosers: [],
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
      // Return empty array until real trending aggregator is integrated
      const trending = [];

      res.json({
        success: true,
        data: { trending },
      });
    } catch (error) {
      next(error);
    }
  }

}

module.exports = { PriceController };
