import { Request, Response } from 'express';
import { TokenPrice } from '@/models/TokenPrice.model';
import { PriceFeedService } from '@/services/priceFeed.service';
import { logger } from '@/utils/logger';

export class PricingController {
  private priceFeedService: PriceFeedService;

  constructor() {
    this.priceFeedService = new PriceFeedService();
  }

  // Get all token prices
  getAllTokenPrices = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 50, offset = 0, sortBy = 'market_cap', order = 'desc' } = req.query;

      const prices = await TokenPrice.find({})
        .sort({ [sortBy as string]: order === 'desc' ? -1 : 1 })
        .limit(Number(limit))
        .skip(Number(offset))
        .exec();

      const total = await TokenPrice.countDocuments();

      res.status(200).json({
        success: true,
        data: {
          tokens: prices,
          pagination: {
            total,
            limit: Number(limit),
            offset: Number(offset),
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      logger.error('Error fetching token prices:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch token prices',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get specific token price
  getTokenPrice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { symbol } = req.params;
      
      const tokenPrice = await TokenPrice.findOne({ 
        symbol: symbol.toUpperCase() 
      });

      if (!tokenPrice) {
        res.status(404).json({
          success: false,
          message: `Token ${symbol} not found`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: tokenPrice
      });
    } catch (error) {
      logger.error(`Error fetching price for ${req.params.symbol}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch token price',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get historical price data
  getHistoricalData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { symbol } = req.params;
      const { period = '24h', interval = '1h' } = req.query;

      // Mock historical data for demo
      const mockHistoricalData = this.generateMockHistoricalData(symbol, period as string, interval as string);

      res.status(200).json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          period,
          interval,
          data: mockHistoricalData
        }
      });
    } catch (error) {
      logger.error(`Error fetching historical data for ${req.params.symbol}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch historical data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get market overview
  getMarketOverview = async (req: Request, res: Response): Promise<void> => {
    try {
      const totalMarketCap = await TokenPrice.aggregate([
        { $group: { _id: null, total: { $sum: "$market_cap" } } }
      ]);

      const topGainers = await TokenPrice.find({})
        .sort({ change_24h: -1 })
        .limit(5)
        .exec();

      const topLosers = await TokenPrice.find({})
        .sort({ change_24h: 1 })
        .limit(5)
        .exec();

      const mostActive = await TokenPrice.find({})
        .sort({ volume_24h: -1 })
        .limit(5)
        .exec();

      res.status(200).json({
        success: true,
        data: {
          total_market_cap: totalMarketCap[0]?.total || 0,
          top_gainers: topGainers,
          top_losers: topLosers,
          most_active: mostActive,
          last_updated: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error fetching market overview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch market overview',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get trending tokens
  getTrendingTokens = async (req: Request, res: Response): Promise<void> => {
    try {
      const trendingTokens = await TokenPrice.find({})
        .sort({ 
          change_24h: -1,
          volume_24h: -1 
        })
        .limit(10)
        .exec();

      res.status(200).json({
        success: true,
        data: trendingTokens
      });
    } catch (error) {
      logger.error('Error fetching trending tokens:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch trending tokens',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get portfolio prices (authenticated)
  getPortfolioPrices = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // Mock portfolio data for demo
      const mockPortfolio = [
        { symbol: 'APT', amount: 100, value: 1250 },
        { symbol: 'BTC', amount: 0.5, value: 21500 },
        { symbol: 'ETH', amount: 2, value: 4600 }
      ];

      res.status(200).json({
        success: true,
        data: {
          portfolio: mockPortfolio,
          total_value: mockPortfolio.reduce((sum, item) => sum + item.value, 0),
          last_updated: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error fetching portfolio prices:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch portfolio prices',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Add token to watchlist
  addToWatchlist = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { tokenSymbol } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // Mock implementation for demo
      res.status(200).json({
        success: true,
        message: `${tokenSymbol} added to watchlist`,
        data: {
          tokenSymbol,
          addedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error adding to watchlist:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add to watchlist',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Remove token from watchlist
  removeFromWatchlist = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { tokenId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // Mock implementation for demo
      res.status(200).json({
        success: true,
        message: `Token removed from watchlist`,
        data: {
          tokenId,
          removedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error removing from watchlist:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove from watchlist',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Get user's watchlist
  getWatchlist = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
        return;
      }

      // Mock watchlist for demo
      const mockWatchlist = ['APT', 'BTC', 'ETH', 'USDT'];
      const watchlistPrices = await TokenPrice.find({
        symbol: { $in: mockWatchlist }
      });

      res.status(200).json({
        success: true,
        data: watchlistPrices
      });
    } catch (error) {
      logger.error('Error fetching watchlist:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch watchlist',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Helper method to generate mock historical data
  private generateMockHistoricalData(symbol: string, period: string, interval: string) {
    const basePrice = Math.random() * 100 + 10; // Random base price between 10-110
    const data = [];
    const now = new Date();
    let intervalMs = 3600000; // 1 hour default

    switch (interval) {
      case '1m': intervalMs = 60000; break;
      case '5m': intervalMs = 300000; break;
      case '15m': intervalMs = 900000; break;
      case '1h': intervalMs = 3600000; break;
      case '4h': intervalMs = 14400000; break;
      case '1d': intervalMs = 86400000; break;
    }

    let points = 24; // Default 24 points
    switch (period) {
      case '1h': points = 60; break;
      case '24h': points = 24; break;
      case '7d': points = 7 * 24; break;
      case '30d': points = 30; break;
      case '1y': points = 365; break;
    }

    for (let i = points; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - (i * intervalMs));
      const price = basePrice + (Math.random() - 0.5) * basePrice * 0.1; // ±10% variation
      
      data.push({
        timestamp: timestamp.toISOString(),
        price: Number(price.toFixed(6)),
        volume: Math.random() * 1000000 // Random volume
      });
    }

    return data;
  }
}
