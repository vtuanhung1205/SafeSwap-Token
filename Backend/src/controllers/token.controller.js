const coinGeckoService = require('../services/coinGecko.service');
const { logger } = require('../utils/logger');

/**
 * Token Controller - Quản lý token list và price data từ CoinGecko
 * Tối ưu cho production, sử dụng cache để giảm API calls
 */
class TokenController {
  /**
   * Lấy danh sách tất cả tokens
   * @route GET /api/tokens/all
   */
  async getAllTokens(req, res) {
    try {
      const tokens = await coinGeckoService.getAllTokens();
      
      res.status(200).json({
        success: true,
        message: 'Tokens retrieved successfully',
        data: {
          tokens,
          count: tokens.length,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error getting all tokens:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get tokens',
        error: error.message
      });
    }
  }

  /**
   * Lấy danh sách tokens theo platform
   * @route GET /api/tokens/platform/:platform
   */
  async getTokensByPlatform(req, res) {
    try {
      const { platform = 'aptos' } = req.params;
      const tokens = await coinGeckoService.getTokensByPlatform(platform);
      
      res.status(200).json({
        success: true,
        message: `${platform} tokens retrieved successfully`,
        data: {
          platform,
          tokens,
          count: tokens.length,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error(`Error getting ${req.params.platform} tokens:`, error.message);
      res.status(500).json({
        success: false,
        message: `Failed to get ${req.params.platform} tokens`,
        error: error.message
      });
    }
  }

  /**
   * Lấy thông tin chi tiết của một token
   * @route GET /api/tokens/:tokenId
   */
  async getTokenInfo(req, res) {
    try {
      const { tokenId } = req.params;
      const tokenInfo = await coinGeckoService.getTokenInfo(tokenId);
      
      res.status(200).json({
        success: true,
        message: 'Token info retrieved successfully',
        data: tokenInfo
      });
    } catch (error) {
      logger.error(`Error getting token info for ${req.params.tokenId}:`, error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get token info',
        error: error.message
      });
    }
  }

  /**
   * Lấy giá của một token
   * @route GET /api/tokens/:tokenId/price
   */
  async getTokenPrice(req, res) {
    try {
      const { tokenId } = req.params;
      const { currency = 'usd' } = req.query;
      
      const priceData = await coinGeckoService.getTokenPrice(tokenId, currency);
      
      res.status(200).json({
        success: true,
        message: 'Token price retrieved successfully',
        data: priceData
      });
    } catch (error) {
      logger.error(`Error getting price for ${req.params.tokenId}:`, error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get token price',
        error: error.message
      });
    }
  }

  /**
   * Lấy giá của nhiều tokens cùng lúc
   * @route POST /api/tokens/prices
   */
  async getMultipleTokenPrices(req, res) {
    try {
      const { tokenIds, currency = 'usd' } = req.body;
      
      if (!tokenIds || !Array.isArray(tokenIds) || tokenIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Token IDs array is required'
        });
      }

      const prices = await coinGeckoService.getMultipleTokenPrices(tokenIds, currency);
      
      res.status(200).json({
        success: true,
        message: 'Token prices retrieved successfully',
        data: {
          prices,
          count: Object.keys(prices).length,
          currency,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error getting multiple token prices:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get token prices',
        error: error.message
      });
    }
  }

  /**
   * Tìm kiếm tokens
   * @route GET /api/tokens/search
   */
  async searchTokens(req, res) {
    try {
      const { query } = req.query;
      
      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const results = await coinGeckoService.searchTokens(query);
      
      res.status(200).json({
        success: true,
        message: 'Search completed successfully',
        data: {
          query,
          results,
          count: results.length,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error searching tokens:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to search tokens',
        error: error.message
      });
    }
  }

  /**
   * Lấy trending tokens
   * @route GET /api/tokens/trending
   */
  async getTrendingTokens(req, res) {
    try {
      const trending = await coinGeckoService.getTrendingTokens();
      
      res.status(200).json({
        success: true,
        message: 'Trending tokens retrieved successfully',
        data: {
          trending,
          count: trending.length,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error getting trending tokens:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get trending tokens',
        error: error.message
      });
    }
  }

  /**
   * Health check cho CoinGecko service
   * @route GET /api/tokens/health
   */
  async healthCheck(req, res) {
    try {
      const isHealthy = await coinGeckoService.healthCheck();
      
      res.status(200).json({
        success: true,
        data: {
          status: isHealthy ? 'healthy' : 'unhealthy',
          service: 'CoinGecko API',
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error in token health check:', error.message);
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error.message
      });
    }
  }

  /**
   * Clear cache của CoinGecko service
   * @route POST /api/tokens/clear-cache
   */
  async clearCache(req, res) {
    try {
      coinGeckoService.clearCache();
      
      res.status(200).json({
        success: true,
        message: 'Cache cleared successfully',
        data: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error clearing cache:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to clear cache',
        error: error.message
      });
    }
  }
}

module.exports = new TokenController(); 