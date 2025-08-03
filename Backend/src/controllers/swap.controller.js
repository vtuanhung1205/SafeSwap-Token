const { SwapTransaction } = require('../models/SwapTransaction.model');
const { Wallet } = require('../models/Wallet.model');
const { User } = require('../models/User.model');
const { ScamDetectionService } = require('../services/scamDetection.service');
const { SafeSwapDexService } = require('../services/safeswapDex.service');
const { PriceFeedService } = require('../services/priceFeed.service');
const { createError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const scamDetectionService = new ScamDetectionService();
const safeswapService = new SafeSwapDexService();
const priceFeedService = new PriceFeedService();

class SwapController {
  async getQuote(req, res, next) {
    try {
      const { fromToken, toToken, amount, slippage = 0.5 } = req.body;

      // Validation
      if (!fromToken || !toToken || !amount) {
        return res.status(400).json({
          success: false,
          message: 'fromToken, toToken, and amount are required',
          data: null
        });
      }

      const fromAmount = parseFloat(amount);
      if (isNaN(fromAmount) || fromAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive number',
          data: null
        });
      }

      // Validate token pair exists on SafeSwap
      if (!safeswapService.validateTokenPair(fromToken, toToken)) {
        return res.status(400).json({
          success: false,
          message: 'Token pair not supported on SafeSwap',
          data: null
        });
      }

      // Get token metadata
      const fromTokenMeta = await this.getTokenMetadata(fromToken);
      const toTokenMeta = await this.getTokenMetadata(toToken);

      if (!fromTokenMeta || !toTokenMeta) {
        return res.status(400).json({
          success: false,
          message: 'Invalid token address',
          data: null
        });
      }

      // Calculate swap quote using SafeSwap
      let swapQuote;
      try {
        swapQuote = await safeswapService.calculateSwapQuote(fromToken, toToken, fromAmount, slippage);
      } catch (error) {
        logger.error('Failed to calculate swap quote:', error);
        return res.status(400).json({
          success: false,
          message: error.message || 'Failed to calculate swap quote',
          data: null
        });
      }

      // Get current prices
      const fromTokenPrice = await safeswapService.getTokenPrice(fromToken);
      const toTokenPrice = await safeswapService.getTokenPrice(toToken);

      // Calculate USD values
      const fromAmountUSD = fromTokenPrice ? fromAmount * fromTokenPrice : 0;
      const toAmountUSD = toTokenPrice ? swapQuote.outputAmount * toTokenPrice : 0;

      // Generate quote ID
      const quoteId = `safeswap_quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const quote = {
        quoteId,
        fromToken: {
          address: fromToken,
          symbol: fromTokenMeta.symbol,
          name: fromTokenMeta.name,
          decimals: fromTokenMeta.decimals,
          amount: fromAmount,
          amountUSD: fromAmountUSD,
          price: fromTokenPrice
        },
        toToken: {
          address: toToken,
          symbol: toTokenMeta.symbol,
          name: toTokenMeta.name,
          decimals: toTokenMeta.decimals,
          amount: swapQuote.outputAmount,
          amountUSD: toAmountUSD,
          price: toTokenPrice
        },
        dex: {
          id: 'safeswap',
          name: 'SafeSwap',
          address: safeswapService.safeswapConfig.address
        },
        priceImpact: swapQuote.priceImpact,
        fee: swapQuote.fee,
        feeRate: swapQuote.feeRate,
        poolAddress: swapQuote.poolAddress,
        reserves: swapQuote.reserves,
        pair: swapQuote.pair,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        createdAt: new Date()
      };

      res.json({
        success: true,
        message: 'SafeSwap quote calculated successfully',
        data: { quote }
      });
    } catch (error) {
      next(error);
    }
  }

  async executeSwap(req, res, next) {
    try {
      const userId = req.userId;
      const {
        fromToken,
        toToken,
        fromAmount,
        toAmount,
        quoteId,
        slippage = 0.5
      } = req.body;

      // Validation
      if (!fromToken || !toToken || !fromAmount || !toAmount || !quoteId) {
        throw createError(400, 'All swap parameters are required');
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

      // Check wallet permissions
      if (!wallet.permissions.canSwap) {
        throw createError(403, 'This wallet does not have swap permissions');
      }

      // Check transaction limits
      const limitCheck = wallet.checkTransactionLimit(parseFloat(fromAmount));
      if (!limitCheck.allowed) {
        throw createError(400, `Transaction blocked: ${limitCheck.reason}`);
      }

      // Check if confirmation is required
      const requiresConfirmation = wallet.requiresConfirmation(parseFloat(fromAmount));
      if (requiresConfirmation) {
        logger.info(`Large transaction requires confirmation: ${fromAmount} ${fromToken}`);
      }

      // Scam detection
      const scamRisk = await scamDetectionService.analyzeTransaction({
        fromToken,
        toToken,
        amount: fromAmount,
        walletAddress: wallet.address,
      });

      if (scamRisk.isScam) {
        throw createError(400, `Potential scam detected: ${scamRisk.reason}`);
      }

      // Validate token pair exists on SafeSwap
      if (!safeswapService.validateTokenPair(fromToken, toToken)) {
        throw createError(400, 'Token pair not supported on SafeSwap');
      }

      // Get token metadata
      const fromTokenMeta = await this.getTokenMetadata(fromToken);
      const toTokenMeta = await this.getTokenMetadata(toToken);

      if (!fromTokenMeta || !toTokenMeta) {
        throw createError(400, 'Invalid token address');
      }

      // Create swap payload
      let swapPayload;
      try {
        swapPayload = await safeswapService.createSwapPayload(fromToken, toToken, fromAmount, toAmount, slippage);
      } catch (error) {
        logger.error('Failed to create swap payload:', error);
        throw createError(400, error.message || 'Failed to create swap transaction');
      }

      // Estimate gas (mock for now)
      const estimatedGas = 2000;
      const gasPrice = 100;

      // Create swap transaction record
      const transaction = new SwapTransaction({
        userId,
        walletAddress: wallet.address,
        quoteId,
        fromToken: {
          address: fromToken,
          symbol: fromTokenMeta.symbol,
          name: fromTokenMeta.name,
          decimals: fromTokenMeta.decimals,
          amount: fromAmount
        },
        toToken: {
          address: toToken,
          symbol: toTokenMeta.symbol,
          name: toTokenMeta.name,
          decimals: toTokenMeta.decimals,
          amount: toAmount
        },
        dex: {
          id: 'safeswap',
          name: 'SafeSwap',
          address: safeswapService.safeswapConfig.address
        },
        slippage,
        priceImpact: swapPayload.quote?.priceImpact || 0,
        fee: swapPayload.quote?.fee || 0,
        feeRate: swapPayload.quote?.feeRate || 0.003,
        poolAddress: swapPayload.quote?.poolAddress || '',
        estimatedGas,
        gasPrice,
        status: 'pending',
        scamRisk: {
          isScam: scamRisk.isScam,
          riskScore: scamRisk.riskScore,
          reason: scamRisk.reason
        }
      });

      await transaction.save();

      // Record transaction in wallet
      await wallet.recordTransaction(parseFloat(fromAmount));

      // Submit transaction to blockchain (mock for now)
      const blockchainTransaction = {
        hash: `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`,
        status: 'submitted'
      };

      // Update transaction with blockchain details
      transaction.transactionHash = blockchainTransaction.hash;
      transaction.blockchainStatus = blockchainTransaction.status;
      await transaction.save();

      // Simulate transaction processing
      setTimeout(async () => {
        try {
          // Simulate success/failure (95% success rate)
          const isSuccess = Math.random() > 0.05;
          
          if (isSuccess) {
            await transaction.markAsCompleted();
            logger.info(`SafeSwap completed: ${transaction._id}`);
          } else {
            transaction.status = 'failed';
            transaction.failureReason = 'Insufficient liquidity';
            await transaction.save();
            logger.warn(`SafeSwap failed: ${transaction._id}`);
          }
        } catch (error) {
          logger.error('Error updating transaction status:', error);
        }
      }, 3000);

      res.json({
        success: true,
        message: 'SafeSwap transaction submitted successfully',
        data: {
          transactionId: transaction._id,
          transactionHash: blockchainTransaction.hash,
          status: 'pending',
          estimatedGas,
          gasPrice,
          dex: 'SafeSwap'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionStatus(req, res, next) {
    try {
      const { transactionId } = req.params;
      const userId = req.userId;

      const transaction = await SwapTransaction.findOne({ 
        _id: transactionId, 
        userId 
      });

      if (!transaction) {
        throw createError(404, 'Transaction not found');
      }

      res.json({
        success: true,
        data: { transaction }
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionHistory(req, res, next) {
    try {
      const userId = req.userId;
      const { page = 1, limit = 20, status } = req.query;

      const query = { userId };
      if (status) {
        query.status = status;
      }

      const transactions = await SwapTransaction.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await SwapTransaction.countDocuments(query);

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getDexInfo(req, res, next) {
    try {
      const dexInfo = safeswapService.getDexInfo();
      const stats = await safeswapService.getDexStats();
      
      res.json({
        success: true,
        data: { 
          dex: dexInfo,
          stats
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

  async getSupportedPairs(req, res, next) {
    try {
      const pairs = safeswapService.getSupportedPairs();
      
      res.json({
        success: true,
        data: { pairs }
      });
    } catch (error) {
      next(error);
    }
  }

  async getTokenDistribution(req, res, next) {
    try {
      const distribution = await safeswapService.getTokenDistribution();
      
      res.json({
        success: true,
        data: { distribution }
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

  // Helper method to get token metadata
  async getTokenMetadata(tokenAddress) {
    try {
      // Check if it's SafeSwap token
      if (tokenAddress === safeswapService.safeswapToken.address) {
        return safeswapService.safeswapToken;
      }

      // Check common tokens
      const commonTokens = {
        '0x1::aptos_coin::AptosCoin': {
          symbol: 'APT',
          name: 'Aptos',
          decimals: 8
        },
        '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC': {
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6
        },
        '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT': {
          symbol: 'USDT',
          name: 'Tether USD',
          decimals: 6
        }
      };

      return commonTokens[tokenAddress] || null;
    } catch (error) {
      logger.error(`Failed to get token metadata for ${tokenAddress}:`, error);
      return null;
    }
  }
}

module.exports = { SwapController };
