const { LiquidityPool } = require('../models/LiquidityPool.model');
const { OrderBook } = require('../models/OrderBook.model');
const { Token } = require('../models/Token.model');
const { AptosBlockchainService } = require('./aptosBlockchain.service');
const { logger } = require('../utils/logger');
const createError = require('http-errors');

class DexService {
  constructor() {
    this.aptosService = new AptosBlockchainService();
    this.supportedDexes = ['liquidswap', 'pancakeswap', 'sushi'];
  }

  /**
   * Get all liquidity pools
   */
  async getLiquidityPools(filters = {}) {
    try {
      const { 
        dex, 
        chainId = 'aptos-testnet', 
        isActive = true,
        limit = 50,
        sortBy = 'volume24h',
        sortOrder = 'desc'
      } = filters;

      const query = { chainId, isActive };
      if (dex) query.dex = dex;

      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const pools = await LiquidityPool.find(query)
        .sort(sort)
        .limit(limit);

      return pools;
    } catch (error) {
      logger.error('Failed to get liquidity pools:', error);
      throw error;
    }
  }

  /**
   * Get liquidity pool by token pair
   */
  async getPoolByTokens(token0, token1) {
    try {
      const pool = await LiquidityPool.getByTokens(token0, token1);
      return pool;
    } catch (error) {
      logger.error('Failed to get pool by tokens:', error);
      throw error;
    }
  }

  /**
   * Get liquidity pool by symbols
   */
  async getPoolBySymbols(symbol0, symbol1) {
    try {
      const pool = await LiquidityPool.getBySymbols(symbol0, symbol1);
      return pool;
    } catch (error) {
      logger.error('Failed to get pool by symbols:', error);
      throw error;
    }
  }

  /**
   * Get top pools by volume
   */
  async getTopPools(limit = 20) {
    try {
      const pools = await LiquidityPool.getTopPools(limit);
      return pools;
    } catch (error) {
      logger.error('Failed to get top pools:', error);
      throw error;
    }
  }

  /**
   * Get low risk pools
   */
  async getLowRiskPools(limit = 20) {
    try {
      const pools = await LiquidityPool.getLowRiskPools(limit);
      return pools;
    } catch (error) {
      logger.error('Failed to get low risk pools:', error);
      throw error;
    }
  }

  /**
   * Update pool reserves from blockchain
   */
  async updatePoolReserves(poolId) {
    try {
      const pool = await LiquidityPool.findOne({ poolId });
      if (!pool) {
        throw createError(404, 'Pool not found');
      }

      // Get reserves from blockchain
      const reserves = await this.aptosService.getPoolReserves(pool.poolAddress);
      
      await pool.updateReserves(reserves.reserve0, reserves.reserve1);
      
      logger.info(`Updated reserves for pool ${poolId}`);
      return pool;
    } catch (error) {
      logger.error('Failed to update pool reserves:', error);
      throw error;
    }
  }

  /**
   * Get order book for a trading pair
   */
  async getOrderBook(baseToken, quoteToken) {
    try {
      const orderBook = await OrderBook.getByTokens(baseToken, quoteToken);
      if (!orderBook) {
        throw createError(404, 'Order book not found');
      }

      return orderBook.getOrderBook();
    } catch (error) {
      logger.error('Failed to get order book:', error);
      throw error;
    }
  }

  /**
   * Get order book by symbols
   */
  async getOrderBookBySymbols(baseSymbol, quoteSymbol) {
    try {
      const orderBook = await OrderBook.getBySymbols(baseSymbol, quoteSymbol);
      if (!orderBook) {
        throw createError(404, 'Order book not found');
      }

      return orderBook.getOrderBook();
    } catch (error) {
      logger.error('Failed to get order book by symbols:', error);
      throw error;
    }
  }

  /**
   * Update order book from blockchain
   */
  async updateOrderBook(poolId) {
    try {
      const orderBook = await OrderBook.findOne({ poolId });
      if (!orderBook) {
        throw createError(404, 'Order book not found');
      }

      // Get order book from blockchain
      const bookData = await this.aptosService.getOrderBook(orderBook.poolAddress);
      
      await orderBook.updateOrderBook(bookData.bids, bookData.asks);
      
      logger.info(`Updated order book for pool ${poolId}`);
      return orderBook;
    } catch (error) {
      logger.error('Failed to update order book:', error);
      throw error;
    }
  }

  /**
   * Calculate swap quote using multiple pools
   */
  async calculateSwapQuote(fromToken, toToken, amount, slippage = 0.5) {
    try {
      // Find pools for this token pair
      const pools = await LiquidityPool.find({
        $or: [
          { token0: fromToken, token1: toToken },
          { token0: toToken, token1: fromToken }
        ],
        isActive: true
      });

      if (pools.length === 0) {
        throw createError(404, 'No liquidity pools found for this token pair');
      }

      // Calculate quotes from all pools
      const quotes = [];
      
      for (const pool of pools) {
        try {
          const quote = await this.calculateQuoteFromPool(pool, fromToken, toToken, amount);
          quotes.push({
            poolId: pool.poolId,
            dex: pool.dex,
            ...quote
          });
        } catch (error) {
          logger.warn(`Failed to calculate quote from pool ${pool.poolId}:`, error.message);
        }
      }

      if (quotes.length === 0) {
        throw createError(400, 'Unable to calculate swap quote');
      }

      // Find best quote (highest output amount)
      const bestQuote = quotes.reduce((best, current) => 
        current.outputAmount > best.outputAmount ? current : best
      );

      // Apply slippage tolerance
      const minOutputAmount = bestQuote.outputAmount * (1 - slippage / 100);

      return {
        ...bestQuote,
        minOutputAmount,
        allQuotes: quotes
      };
    } catch (error) {
      logger.error('Failed to calculate swap quote:', error);
      throw error;
    }
  }

  /**
   * Calculate quote from a specific pool
   */
  async calculateQuoteFromPool(pool, fromToken, toToken, amount) {
    try {
      const isToken0 = pool.token0 === fromToken;
      const reserveIn = isToken0 ? pool.reserve0 : pool.reserve1;
      const reserveOut = isToken0 ? pool.reserve1 : pool.reserve0;

      if (reserveIn === 0 || reserveOut === 0) {
        throw new Error('Insufficient liquidity');
      }

      // Calculate output using constant product formula
      const fee = pool.fee;
      const amountInWithFee = amount * (1 - fee);
      const outputAmount = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);

      const priceImpact = (amount / reserveIn) * 100;

      return {
        outputAmount,
        priceImpact,
        fee: amount * fee,
        feeRate: fee,
        poolAddress: pool.poolAddress,
        dex: pool.dex
      };
    } catch (error) {
      logger.error('Failed to calculate quote from pool:', error);
      throw error;
    }
  }

  /**
   * Execute swap through DEX
   */
  async executeSwap(swapData) {
    try {
      const {
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        poolId,
        slippage = 0.5,
        walletAddress
      } = swapData;

      // Validate pool exists
      const pool = await LiquidityPool.findOne({ poolId });
      if (!pool) {
        throw createError(404, 'Pool not found');
      }

      // Check if pool has sufficient liquidity
      const isToken0 = pool.token0 === fromToken;
      const reserveIn = isToken0 ? pool.reserve0 : pool.reserve1;
      
      if (fromAmount > reserveIn) {
        throw createError(400, 'Insufficient liquidity');
      }

      // Create swap transaction
      const transaction = await this.aptosService.createSwapTransaction({
        poolAddress: pool.poolAddress,
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        slippage,
        walletAddress
      });

      logger.info(`Swap executed: ${fromAmount} ${fromToken} -> ${toAmount} ${toToken}`);
      return transaction;
    } catch (error) {
      logger.error('Failed to execute swap:', error);
      throw error;
    }
  }

  /**
   * Get pool statistics
   */
  async getPoolStats(poolId) {
    try {
      const pool = await LiquidityPool.findOne({ poolId });
      if (!pool) {
        throw createError(404, 'Pool not found');
      }

      const tvl = pool.tvl;
      const volume24h = pool.volume24h;
      const fee24h = volume24h * pool.fee;

      return {
        poolId: pool.poolId,
        pair: pool.pair,
        tvl,
        volume24h,
        fee24h,
        reserve0: pool.reserve0,
        reserve1: pool.reserve1,
        price0: pool.price0,
        price1: pool.price1,
        riskScore: pool.riskScore,
        riskLevel: pool.riskLevel
      };
    } catch (error) {
      logger.error('Failed to get pool stats:', error);
      throw error;
    }
  }

  /**
   * Get DEX statistics
   */
  async getDexStats() {
    try {
      const stats = await LiquidityPool.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: '$dex',
            totalPools: { $sum: 1 },
            totalTvl: { $sum: { $multiply: ['$reserve0', '$price0'] } },
            totalVolume24h: { $sum: '$volume24h' },
            avgRiskScore: { $avg: '$riskScore' }
          }
        }
      ]);

      return stats;
    } catch (error) {
      logger.error('Failed to get DEX stats:', error);
      throw error;
    }
  }
}

module.exports = { DexService }; 