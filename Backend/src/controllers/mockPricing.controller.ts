import { Request, Response } from 'express';
import { mockDB } from '@/services/mockDatabase.service';
import { logger } from '@/utils/logger';

export class MockPricingController {

  // Get all token prices
  public getAllTokenPrices = async (req: Request, res: Response) => {
    try {
      const { limit = 50, offset = 0, sortBy = 'market_cap', order = 'desc' } = req.query;

      const result = await mockDB.findAllTokenPrices({
        limit: Number(limit),
        offset: Number(offset),
        sortBy: sortBy as string,
        order: order as 'asc' | 'desc'
      });

      res.status(200).json({
        success: true,
        data: {
          tokens: result.tokens,
          pagination: {
            total: result.total,
            limit: Number(limit),
            offset: Number(offset),
            pages: Math.ceil(result.total / Number(limit))
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching token prices:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch token prices',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Get specific token price
  public getTokenPrice = async (req: Request, res: Response): Promise<void> => {
    try {
      const { symbol } = req.params;
      
      const tokenPrice = await mockDB.findTokenBySymbol(symbol);

      if (!tokenPrice) {
        res.status(404).json({
          success: false,
          message: `Token ${symbol} not found`,
          timestamp: new Date().toISOString()
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: tokenPrice,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error fetching price for ${req.params.symbol}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch token price',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Get market overview
  public getMarketOverview = async (req: Request, res: Response) => {
    try {
      const stats = await mockDB.getMarketStats();
      const allTokens = await mockDB.findAllTokenPrices({ sortBy: 'change_24h', order: 'desc' });

      const topGainers = allTokens.tokens.slice(0, 5);
      const topLosers = allTokens.tokens.slice(-5).reverse();

      res.status(200).json({
        success: true,
        data: {
          total_market_cap: stats.total_market_cap,
          total_volume_24h: stats.total_volume_24h,
          avg_change_24h: stats.avg_change_24h,
          top_gainers: topGainers,
          top_losers: topLosers,
          last_updated: new Date().toISOString()
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching market overview:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch market overview',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Get trending tokens
  public getTrendingTokens = async (req: Request, res: Response) => {
    try {
      const result = await mockDB.findAllTokenPrices({
        sortBy: 'change_24h',
        order: 'desc',
        limit: 10
      });

      res.status(200).json({
        success: true,
        data: result.tokens,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching trending tokens:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch trending tokens',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Get historical price data (mock)
  public getHistoricalData = async (req: Request, res: Response): Promise<void> => {
    try {
      const { symbol } = req.params;
      const { period = '24h', interval = '1h' } = req.query;

      // Check if token exists
      const token = await mockDB.findTokenBySymbol(symbol);
      if (!token) {
        res.status(404).json({
          success: false,
          message: `Token ${symbol} not found`,
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Generate mock historical data
      const mockHistoricalData = this.generateMockHistoricalData(
        token.price, 
        period as string, 
        interval as string
      );

      res.status(200).json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          period,
          interval,
          data: mockHistoricalData
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error(`Error fetching historical data for ${req.params.symbol}:`, error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch historical data',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Helper method to generate mock historical data
  private generateMockHistoricalData(basePrice: number, period: string, interval: string) {
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

  // Get portfolio prices (authenticated)
  public getPortfolioPrices = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date().toISOString()
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
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching portfolio prices:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch portfolio prices',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Add token to watchlist
  public addToWatchlist = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { tokenSymbol } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date().toISOString()
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
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error adding to watchlist:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add to watchlist',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Remove token from watchlist
  public removeFromWatchlist = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { tokenId } = req.params;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date().toISOString()
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
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error removing from watchlist:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove from watchlist',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Get user's watchlist
  public getWatchlist = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          timestamp: new Date().toISOString()
        });
        return;
      }

      // Mock watchlist for demo
      const mockWatchlist = ['APT', 'BTC', 'ETH', 'USDT'];
      const watchlistPrices = [];
      
      for (const symbol of mockWatchlist) {
        const token = await mockDB.findTokenBySymbol(symbol);
        if (token) {
          watchlistPrices.push(token);
        }
      }

      res.status(200).json({
        success: true,
        data: watchlistPrices,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error fetching watchlist:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch watchlist',
        timestamp: new Date().toISOString()
      });
    }
  };
}
