const { AptosClient, TxnBuilderTypes, BCS } = require('aptos');
const { Token } = require('../models/Token.model');
const { LiquidityPool } = require('../models/LiquidityPool.model');
const { SwapTransaction } = require('../models/SwapTransaction.model');
const { logger } = require('../utils/logger');
const createError = require('http-errors');

class SafeSwapDexService {
  constructor() {
    this.network = process.env.APTOS_NETWORK || 'testnet';
    this.nodeUrl = process.env.APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com/v1';
    this.client = new AptosClient(this.nodeUrl);
    
    // SafeSwap DEX contract addresses
    this.safeswapConfig = {
      name: 'SafeSwap',
      address: '0x1234567890123456789012345678901234567890123456789012345678901234', // Mock address
      router: 'safeswap_router',
      factory: 'safeswap_factory',
      pools: 'safeswap_pools',
      pairs: 'safeswap_pairs',
      mainnet: false, // Currently testnet
      version: '1.0.0'
    };

    // SafeSwap token (SAFESWAP)
    this.safeswapToken = {
      symbol: 'SAFESWAP',
      name: 'SafeSwap Token',
      address: '0x1234567890123456789012345678901234567890123456789012345678901234::safeswap_coin::SafeSwapCoin',
      decimals: 8,
      totalSupply: 1000000000, // 1 billion tokens
      isNative: false
    };

    // Common token pairs on SafeSwap
    this.commonPairs = [
      {
        pair: 'APT/USDC',
        token0: '0x1::aptos_coin::AptosCoin',
        token1: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
        poolAddress: '0x1234567890123456789012345678901234567890123456789012345678901234::safeswap_pools::Pool<0x1::aptos_coin::AptosCoin, 0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>',
        fee: 0.003, // 0.3%
        isActive: true
      },
      {
        pair: 'APT/SAFESWAP',
        token0: '0x1::aptos_coin::AptosCoin',
        token1: this.safeswapToken.address,
        poolAddress: '0x1234567890123456789012345678901234567890123456789012345678901234::safeswap_pools::Pool<0x1::aptos_coin::AptosCoin, 0x1234567890123456789012345678901234567890123456789012345678901234::safeswap_coin::SafeSwapCoin>',
        fee: 0.003,
        isActive: true
      },
      {
        pair: 'USDC/SAFESWAP',
        token0: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
        token1: this.safeswapToken.address,
        poolAddress: '0x1234567890123456789012345678901234567890123456789012345678901234::safeswap_pools::Pool<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC, 0x1234567890123456789012345678901234567890123456789012345678901234::safeswap_coin::SafeSwapCoin>',
        fee: 0.003,
        isActive: true
      }
    ];
  }

  /**
   * Get SafeSwap DEX information
   */
  getDexInfo() {
    return {
      name: this.safeswapConfig.name,
      address: this.safeswapConfig.address,
      version: this.safeswapConfig.version,
      network: this.network,
      token: this.safeswapToken,
      totalPairs: this.commonPairs.length,
      activePairs: this.commonPairs.filter(p => p.isActive).length
    };
  }

  /**
   * Get all liquidity pools
   */
  async getLiquidityPools() {
    try {
      // In a real implementation, this would query the SafeSwap factory contract
      // For now, we'll return the common pairs
      const pools = await Promise.all(
        this.commonPairs.map(async (pair) => {
          const pool = await LiquidityPool.findOne({ 
            poolAddress: pair.poolAddress 
          });

          if (pool) {
            return {
              ...pair,
              reserve0: pool.reserve0,
              reserve1: pool.reserve1,
              totalSupply: pool.totalSupply,
              volume24h: pool.volume24h,
              fees24h: pool.fees24h,
              lastUpdated: pool.lastUpdated
            };
          }

          // Return default values if pool not found
          return {
            ...pair,
            reserve0: 0,
            reserve1: 0,
            totalSupply: 0,
            volume24h: 0,
            fees24h: 0,
            lastUpdated: new Date()
          };
        })
      );

      return pools;
    } catch (error) {
      logger.error('Failed to get liquidity pools:', error);
      return [];
    }
  }

  /**
   * Get pool reserves
   */
  async getPoolReserves(poolAddress) {
    try {
      const pool = await LiquidityPool.findOne({ poolAddress });
      
      if (pool) {
        return {
          reserve0: pool.reserve0,
          reserve1: pool.reserve1,
          totalSupply: pool.totalSupply,
          lastUpdated: pool.lastUpdated
        };
      }

      // Return default values
      return {
        reserve0: 0,
        reserve1: 0,
        totalSupply: 0,
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error(`Failed to get pool reserves for ${poolAddress}:`, error);
      return { reserve0: 0, reserve1: 0, totalSupply: 0, lastUpdated: new Date() };
    }
  }

  /**
   * Calculate swap quote using AMM formula
   */
  async calculateSwapQuote(fromToken, toToken, amount, slippage = 0.5) {
    try {
      // Find the pool for this token pair
      const pool = this.commonPairs.find(p => 
        (p.token0 === fromToken && p.token1 === toToken) ||
        (p.token0 === toToken && p.token1 === fromToken)
      );

      if (!pool || !pool.isActive) {
        throw new Error('No active liquidity pool found for this token pair');
      }

      // Get pool reserves
      const reserves = await this.getPoolReserves(pool.poolAddress);
      const reserveIn = pool.token0 === fromToken ? reserves.reserve0 : reserves.reserve1;
      const reserveOut = pool.token0 === fromToken ? reserves.reserve1 : reserves.reserve0;

      if (reserveIn === 0 || reserveOut === 0) {
        throw new Error('Insufficient liquidity in pool');
      }

      // Calculate output using constant product formula
      const fee = pool.fee;
      const amountInWithFee = amount * (1 - fee);
      const outputAmount = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);

      // Calculate price impact
      const priceImpact = (amount / reserveIn) * 100;

      // Calculate minimum output with slippage
      const minOutput = outputAmount * (1 - slippage / 100);

      return {
        outputAmount,
        minOutput,
        priceImpact,
        fee: amount * fee,
        feeRate: fee,
        poolAddress: pool.poolAddress,
        reserves: reserves,
        pair: pool.pair,
        dex: 'safeswap'
      };
    } catch (error) {
      logger.error('Failed to calculate swap quote:', error);
      throw error;
    }
  }

  /**
   * Create swap transaction payload for SafeSwap
   */
  async createSwapPayload(fromToken, toToken, amount, minOutput, slippage = 0.5) {
    try {
      const payload = {
        function: `${this.safeswapConfig.address}::${this.safeswapConfig.router}::swap_exact_input`,
        type_arguments: [fromToken, toToken],
        arguments: [
          amount.toString(),
          Math.floor(minOutput * (1 - slippage / 100)).toString(),
          '0', // deadline (0 = no deadline)
          '0' // recipient (0 = sender)
        ]
      };

      return payload;
    } catch (error) {
      logger.error('Failed to create SafeSwap payload:', error);
      throw error;
    }
  }

  /**
   * Add liquidity to pool
   */
  async addLiquidity(token0, token1, amount0, amount1, minLiquidity = 0) {
    try {
      const payload = {
        function: `${this.safeswapConfig.address}::${this.safeswapConfig.router}::add_liquidity`,
        type_arguments: [token0, token1],
        arguments: [
          amount0.toString(),
          amount1.toString(),
          minLiquidity.toString(),
          '0' // deadline
        ]
      };

      return payload;
    } catch (error) {
      logger.error('Failed to create add liquidity payload:', error);
      throw error;
    }
  }

  /**
   * Remove liquidity from pool
   */
  async removeLiquidity(token0, token1, liquidity, minAmount0, minAmount1) {
    try {
      const payload = {
        function: `${this.safeswapConfig.address}::${this.safeswapConfig.router}::remove_liquidity`,
        type_arguments: [token0, token1],
        arguments: [
          liquidity.toString(),
          minAmount0.toString(),
          minAmount1.toString(),
          '0' // deadline
        ]
      };

      return payload;
    } catch (error) {
      logger.error('Failed to create remove liquidity payload:', error);
      throw error;
    }
  }

  /**
   * Get SafeSwap token information
   */
  getSafeSwapToken() {
    return this.safeswapToken;
  }

  /**
   * Get token price from SafeSwap pools
   */
  async getTokenPrice(tokenAddress) {
    try {
      // Find pools containing this token
      const pools = this.commonPairs.filter(p => 
        p.token0 === tokenAddress || p.token1 === tokenAddress
      );

      if (pools.length === 0) {
        return null;
      }

      // Get the most liquid pool (APT pair)
      const aptPool = pools.find(p => 
        p.token0 === '0x1::aptos_coin::AptosCoin' || 
        p.token1 === '0x1::aptos_coin::AptosCoin'
      );

      if (!aptPool) {
        return null;
      }

      const reserves = await this.getPoolReserves(aptPool.poolAddress);
      
      if (aptPool.token0 === '0x1::aptos_coin::AptosCoin') {
        // Token is token1, price = reserve0 / reserve1
        return reserves.reserve0 / reserves.reserve1;
      } else {
        // Token is token0, price = reserve1 / reserve0
        return reserves.reserve1 / reserves.reserve0;
      }
    } catch (error) {
      logger.error(`Failed to get token price for ${tokenAddress}:`, error);
      return null;
    }
  }

  /**
   * Get SafeSwap statistics
   */
  async getDexStats() {
    try {
      const pools = await this.getLiquidityPools();
      
      const totalLiquidity = pools.reduce((sum, pool) => {
        const poolValue = (pool.reserve0 || 0) + (pool.reserve1 || 0);
        return sum + poolValue;
      }, 0);

      const totalVolume24h = pools.reduce((sum, pool) => {
        return sum + (pool.volume24h || 0);
      }, 0);

      const totalFees24h = pools.reduce((sum, pool) => {
        return sum + (pool.fees24h || 0);
      }, 0);

      return {
        totalLiquidity,
        totalVolume24h,
        totalFees24h,
        totalPairs: pools.length,
        activePairs: pools.filter(p => p.isActive).length
      };
    } catch (error) {
      logger.error('Failed to get DEX stats:', error);
      return {
        totalLiquidity: 0,
        totalVolume24h: 0,
        totalFees24h: 0,
        totalPairs: 0,
        activePairs: 0
      };
    }
  }

  /**
   * Get user's liquidity positions
   */
  async getUserPositions(userAddress) {
    try {
      // In a real implementation, this would query the SafeSwap contract
      // For now, we'll return mock data
      return [];
    } catch (error) {
      logger.error(`Failed to get user positions for ${userAddress}:`, error);
      return [];
    }
  }

  /**
   * Get SafeSwap token distribution
   */
  async getTokenDistribution() {
    try {
      return {
        totalSupply: this.safeswapToken.totalSupply,
        circulatingSupply: this.safeswapToken.totalSupply * 0.8, // 80% circulating
        lockedInPools: this.safeswapToken.totalSupply * 0.1, // 10% in pools
        teamReserve: this.safeswapToken.totalSupply * 0.05, // 5% team
        communityReserve: this.safeswapToken.totalSupply * 0.05 // 5% community
      };
    } catch (error) {
      logger.error('Failed to get token distribution:', error);
      return null;
    }
  }

  /**
   * Validate token pair exists
   */
  validateTokenPair(token0, token1) {
    const pair = this.commonPairs.find(p => 
      (p.token0 === token0 && p.token1 === token1) ||
      (p.token0 === token1 && p.token1 === token0)
    );
    
    return pair && pair.isActive;
  }

  /**
   * Get supported token pairs
   */
  getSupportedPairs() {
    return this.commonPairs.filter(p => p.isActive);
  }
}

module.exports = { SafeSwapDexService }; 