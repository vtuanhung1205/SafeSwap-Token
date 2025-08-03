const { Token } = require('../models/Token.model');
const { AptosBlockchainService } = require('../services/aptosBlockchain.service');
const { createError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const aptosService = new AptosBlockchainService();

class TokenController {
  /**
   * Get all tokens with pagination
   */
  async getAllTokens(req, res, next) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        chainId = 'aptos-testnet',
        isActive = true,
        isVerified = null,
        sortBy = 'marketCap',
        sortOrder = 'desc'
      } = req.query;

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const filter = { chainId, isActive };
      if (isVerified !== null) {
        filter.isVerified = isVerified === 'true';
      }

      const tokens = await Token.find(filter)
        .sort(sort)
        .limit(parseInt(limit))
        .skip(skip);

      const total = await Token.countDocuments(filter);

      res.json({
        success: true,
        data: {
          tokens,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get token by address
   */
  async getTokenByAddress(req, res, next) {
    try {
      const { address } = req.params;

      if (!address) {
        throw createError(400, 'Token address is required');
      }

      const token = await Token.findOne({ address });
      if (!token) {
        throw createError(404, 'Token not found');
      }

      res.json({
        success: true,
        data: { token }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get token by symbol
   */
  async getTokenBySymbol(req, res, next) {
    try {
      const { symbol } = req.params;

      if (!symbol) {
        throw createError(400, 'Token symbol is required');
      }

      const token = await Token.findOne({ symbol: symbol.toUpperCase() });
      if (!token) {
        throw createError(404, 'Token not found');
      }

      res.json({
        success: true,
        data: { token }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top gainers
   */
  async getTopGainers(req, res, next) {
    try {
      const { limit = 10, chainId = 'aptos-testnet' } = req.query;

      const tokens = await Token.getTopGainers(parseInt(limit));

      res.json({
        success: true,
        data: { tokens }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get top losers
   */
  async getTopLosers(req, res, next) {
    try {
      const { limit = 10, chainId = 'aptos-testnet' } = req.query;

      const tokens = await Token.getTopLosers(parseInt(limit));

      res.json({
        success: true,
        data: { tokens }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get tokens by market cap
   */
  async getTokensByMarketCap(req, res, next) {
    try {
      const { limit = 20, chainId = 'aptos-testnet' } = req.query;

      const tokens = await Token.getByMarketCap(parseInt(limit));

      res.json({
        success: true,
        data: { tokens }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get low risk tokens
   */
  async getLowRiskTokens(req, res, next) {
    try {
      const { limit = 20, chainId = 'aptos-testnet' } = req.query;

      const tokens = await Token.getLowRiskTokens(parseInt(limit));

      res.json({
        success: true,
        data: { tokens }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get verified tokens
   */
  async getVerifiedTokens(req, res, next) {
    try {
      const tokens = await Token.getVerifiedTokens();

      res.json({
        success: true,
        data: { tokens }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new token
   */
  async createToken(req, res, next) {
    try {
      const tokenData = req.body;

      // Validate required fields
      if (!tokenData.symbol || !tokenData.name || !tokenData.address) {
        throw createError(400, 'Symbol, name, and address are required');
      }

      // Validate Aptos address format
      if (!aptosService.isValidAddress(tokenData.address)) {
        throw createError(400, 'Invalid Aptos token address format');
      }

      // Check if token already exists
      const existingToken = await Token.findOne({ 
        $or: [
          { address: tokenData.address },
          { symbol: tokenData.symbol.toUpperCase() }
        ]
      });

      if (existingToken) {
        throw createError(409, 'Token already exists');
      }

      // Create token in database
      const token = new Token({
        symbol: tokenData.symbol.toUpperCase(),
        name: tokenData.name,
        address: tokenData.address,
        decimals: tokenData.decimals || 6,
        totalSupply: tokenData.totalSupply || 0,
        isNative: tokenData.isNative || false,
        chainId: tokenData.chainId || 'aptos-testnet',
        coingeckoId: tokenData.coingeckoId,
        price: tokenData.price || 0,
        priceUSD: tokenData.priceUSD || 0,
        change24h: tokenData.change24h || 0,
        marketCap: tokenData.marketCap || 0,
        volume24h: tokenData.volume24h || 0,
        circulatingSupply: tokenData.circulatingSupply || 0,
        maxSupply: tokenData.maxSupply || 0,
        description: tokenData.description,
        website: tokenData.website,
        twitter: tokenData.twitter,
        telegram: tokenData.telegram,
        github: tokenData.github,
        verified: tokenData.verified || false,
        riskScore: tokenData.riskScore || 50,
        riskFactors: tokenData.riskFactors || []
      });

      await token.save();

      logger.info(`Token created: ${token.symbol}`);

      res.status(201).json({
        success: true,
        message: 'Token created successfully',
        data: { token }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update token price
   */
  async updateTokenPrice(req, res, next) {
    try {
      const { address } = req.params;

      if (!address) {
        throw createError(400, 'Token address is required');
      }

      const token = await Token.findOne({ address });
      if (!token) {
        throw createError(404, 'Token not found');
      }

      // Mock price update for now
      const newPrice = Math.random() * 100;
      token.price = newPrice;
      token.priceUSD = newPrice;
      token.lastUpdated = new Date();
      
      await token.save();

      res.json({
        success: true,
        message: 'Token price updated successfully',
        data: { token }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update token scam risk
   */
  async updateTokenRisk(req, res, next) {
    try {
      const { address } = req.params;
      const { riskScore, riskFactors } = req.body;

      if (!address) {
        throw createError(400, 'Token address is required');
      }

      const token = await Token.findOne({ address });
      if (!token) {
        throw createError(404, 'Token not found');
      }

      await token.updateScamRisk(riskScore, riskFactors);

      res.json({
        success: true,
        message: 'Token risk updated successfully',
        data: { token }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify token
   */
  async verifyToken(req, res, next) {
    try {
      const { address } = req.params;

      if (!address) {
        throw createError(400, 'Token address is required');
      }

      const token = await Token.findOne({ address });
      if (!token) {
        throw createError(404, 'Token not found');
      }

      await token.verify();

      res.json({
        success: true,
        message: 'Token verified successfully',
        data: { token }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deactivate token
   */
  async deactivateToken(req, res, next) {
    try {
      const { address } = req.params;

      if (!address) {
        throw createError(400, 'Token address is required');
      }

      const token = await Token.findOne({ address });
      if (!token) {
        throw createError(404, 'Token not found');
      }

      await token.deactivate();

      res.json({
        success: true,
        message: 'Token deactivated successfully',
        data: { token }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search tokens
   */
  async searchTokens(req, res, next) {
    try {
      const { q, limit = 10 } = req.query;

      if (!q) {
        throw createError(400, 'Search query is required');
      }

      const tokens = await Token.find({
        $or: [
          { symbol: { $regex: q, $options: 'i' } },
          { name: { $regex: q, $options: 'i' } },
          { address: { $regex: q, $options: 'i' } }
        ],
        isActive: true
      })
      .limit(parseInt(limit))
      .sort({ marketCap: -1 });

      res.json({
        success: true,
        data: { tokens }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { TokenController }; 