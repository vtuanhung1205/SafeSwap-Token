const { LiquidityPool } = require('../models/LiquidityPool.model');
const { Wallet } = require('../models/Wallet.model');
const { User } = require('../models/User.model');
const { SafeSwapDexService } = require('../services/safeswapDex.service');
const { createError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const safeswapService = new SafeSwapDexService();

class LiquidityController {
  async addLiquidity(req, res, next) {
    try {
      const userId = req.userId;
      const { token0, token1, amount0, amount1, minLiquidity = 0 } = req.body;

      // Validation
      if (!token0 || !token1 || !amount0 || !amount1) {
        throw createError(400, 'token0, token1, amount0, and amount1 are required');
      }

      // Get user's default wallet
      const user = await User.findById(userId);
      if (!user || !user.defaultWalletId) {
        throw createError(400, 'No default wallet found. Please connect a wallet first.');
      }

      const wallet = await Wallet.validateOwnership(user.defaultWalletId, userId);
      if (!wallet || !wallet.isConnected) {
        throw createError(400, 'Default wallet is not connected. Please reconnect your wallet.');
      }

      // Validate token pair exists on SafeSwap
      if (!safeswapService.validateTokenPair(token0, token1)) {
        throw createError(400, 'Token pair not supported on SafeSwap');
      }

      // Create add liquidity payload
      let payload;
      try {
        payload = await safeswapService.addLiquidity(token0, token1, amount0, amount1, minLiquidity);
      } catch (error) {
        logger.error('Failed to create add liquidity payload:', error);
        throw createError(400, error.message || 'Failed to create liquidity transaction');
      }

      // Create liquidity transaction record
      const transaction = {
        userId,
        walletAddress: wallet.address,
        type: 'add_liquidity',
        token0,
        token1,
        amount0: parseFloat(amount0),
        amount1: parseFloat(amount1),
        minLiquidity: parseFloat(minLiquidity),
        status: 'pending',
        transactionHash: `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`,
        createdAt: new Date()
      };

      res.json({
        success: true,
        message: 'Add liquidity transaction created successfully',
        data: {
          transaction,
          payload
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async removeLiquidity(req, res, next) {
    try {
      const userId = req.userId;
      const { token0, token1, liquidity, minAmount0, minAmount1 } = req.body;

      // Validation
      if (!token0 || !token1 || !liquidity || !minAmount0 || !minAmount1) {
        throw createError(400, 'token0, token1, liquidity, minAmount0, and minAmount1 are required');
      }

      // Get user's default wallet
      const user = await User.findById(userId);
      if (!user || !user.defaultWalletId) {
        throw createError(400, 'No default wallet found. Please connect a wallet first.');
      }

      const wallet = await Wallet.validateOwnership(user.defaultWalletId, userId);
      if (!wallet || !wallet.isConnected) {
        throw createError(400, 'Default wallet is not connected. Please reconnect your wallet.');
      }

      // Validate token pair exists on SafeSwap
      if (!safeswapService.validateTokenPair(token0, token1)) {
        throw createError(400, 'Token pair not supported on SafeSwap');
      }

      // Create remove liquidity payload
      let payload;
      try {
        payload = await safeswapService.removeLiquidity(token0, token1, liquidity, minAmount0, minAmount1);
      } catch (error) {
        logger.error('Failed to create remove liquidity payload:', error);
        throw createError(400, error.message || 'Failed to create liquidity transaction');
      }

      // Create liquidity transaction record
      const transaction = {
        userId,
        walletAddress: wallet.address,
        type: 'remove_liquidity',
        token0,
        token1,
        liquidity: parseFloat(liquidity),
        minAmount0: parseFloat(minAmount0),
        minAmount1: parseFloat(minAmount1),
        status: 'pending',
        transactionHash: `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`,
        createdAt: new Date()
      };

      res.json({
        success: true,
        message: 'Remove liquidity transaction created successfully',
        data: {
          transaction,
          payload
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getLiquidityPools(req, res, next) {
    try {
      const pools = await safeswapService.getLiquidityPools();
      
      res.json({
        success: true,
        data: { 
          pools,
          totalPools: pools.length,
          activePools: pools.filter(p => p.isActive).length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getPoolInfo(req, res, next) {
    try {
      const { poolAddress } = req.params;
      
      const reserves = await safeswapService.getPoolReserves(poolAddress);
      
      res.json({
        success: true,
        data: { 
          poolAddress,
          reserves
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserPositions(req, res, next) {
    try {
      const userId = req.userId;
      const user = await User.findById(userId);
      
      if (!user || !user.defaultWalletId) {
        return res.json({
          success: true,
          data: { positions: [] }
        });
      }

      const wallet = await Wallet.validateOwnership(user.defaultWalletId, userId);
      const positions = await safeswapService.getUserPositions(wallet.address);
      
      res.json({
        success: true,
        data: { positions }
      });
    } catch (error) {
      next(error);
    }
  }

  async getLiquidityStats(req, res, next) {
    try {
      const stats = await safeswapService.getDexStats();
      
      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { LiquidityController }; 