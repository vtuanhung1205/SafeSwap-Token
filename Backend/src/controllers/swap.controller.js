const { SwapTransaction } = require('../models/SwapTransaction.model');
const { Wallet } = require('../models/Wallet.model');
const { User } = require('../models/User.model');
const { ScamDetectionService } = require('../services/scamDetection.service');
const { AptosBlockchainService } = require('../services/aptosBlockchain.service');
const { PriceFeedService } = require('../services/priceFeed.service');
const { createError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const scamDetectionService = new ScamDetectionService();
const aptosService = new AptosBlockchainService();
const priceFeedService = new PriceFeedService();

class SwapController {
  async getQuote(req, res, next) {
    try {
      const { fromToken, toToken, amount, dex = 'liquidswap' } = req.body;

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

      // Validate DEX
      const supportedDexes = aptosService.getSupportedDexes();
      const selectedDex = supportedDexes.find(d => d.id === dex);
      if (!selectedDex) {
        return res.status(400).json({
          success: false,
          message: `Unsupported DEX: ${dex}. Supported DEXes: ${supportedDexes.map(d => d.id).join(', ')}`,
          data: null
        });
      }

      // Get token metadata
      const fromTokenMeta = await aptosService.getTokenMetadata(fromToken);
      const toTokenMeta = await aptosService.getTokenMetadata(toToken);

      if (!fromTokenMeta || !toTokenMeta) {
        return res.status(400).json({
          success: false,
          message: 'Invalid token address',
          data: null
        });
      }

      // Calculate swap quote using real DEX
      let swapQuote;
      try {
        swapQuote = await aptosService.calculateSwapQuote(fromToken, toToken, fromAmount, dex);
      } catch (error) {
        logger.error('Failed to calculate swap quote:', error);
        return res.status(400).json({
          success: false,
          message: error.message || 'Failed to calculate swap quote',
          data: null
        });
      }

      // Get current prices
      const fromTokenPrice = await priceFeedService.getTokenPrice(fromToken);
      const toTokenPrice = await priceFeedService.getTokenPrice(toToken);

      // Calculate USD values
      const fromAmountUSD = fromTokenPrice ? fromAmount * fromTokenPrice : 0;
      const toAmountUSD = toTokenPrice ? swapQuote.outputAmount * toTokenPrice : 0;

      // Generate quote ID
      const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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
          id: selectedDex.id,
          name: selectedDex.name,
          address: selectedDex.address
        },
        priceImpact: swapQuote.priceImpact,
        fee: swapQuote.fee,
        feeRate: swapQuote.feeRate,
        poolAddress: swapQuote.poolAddress,
        reserves: swapQuote.reserves,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        createdAt: new Date()
      };

      res.json({
        success: true,
        message: 'Swap quote calculated successfully',
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
        slippage = 0.5,
        dex = 'liquidswap'
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
        // In a real app, you might want to return a confirmation request
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

      // Validate DEX
      const supportedDexes = aptosService.getSupportedDexes();
      const selectedDex = supportedDexes.find(d => d.id === dex);
      if (!selectedDex) {
        throw createError(400, `Unsupported DEX: ${dex}`);
      }

      // Get token metadata
      const fromTokenMeta = await aptosService.getTokenMetadata(fromToken);
      const toTokenMeta = await aptosService.getTokenMetadata(toToken);

      if (!fromTokenMeta || !toTokenMeta) {
        throw createError(400, 'Invalid token address');
      }

      // Create swap payload
      let swapPayload;
      try {
        swapPayload = await aptosService.createSwapPayload(fromToken, toToken, fromAmount, slippage, dex);
      } catch (error) {
        logger.error('Failed to create swap payload:', error);
        throw createError(400, error.message || 'Failed to create swap transaction');
      }

      // Estimate gas
      const estimatedGas = await aptosService.estimateGas(swapPayload);
      const gasPrice = await aptosService.getGasPrice();

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
          id: selectedDex.id,
          name: selectedDex.name,
          address: selectedDex.address
        },
        slippage,
        priceImpact: swapPayload.quote.priceImpact,
        fee: swapPayload.quote.fee,
        feeRate: swapPayload.quote.feeRate,
        poolAddress: swapPayload.quote.poolAddress,
        estimatedGas,
        gasPrice: gasPrice.gasPrice,
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

      // Submit transaction to blockchain
      let blockchainTransaction;
      try {
        blockchainTransaction = await aptosService.submitTransaction(
          wallet.address,
          swapPayload,
          estimatedGas
        );
      } catch (error) {
        logger.error('Failed to submit transaction to blockchain:', error);
        transaction.status = 'failed';
        transaction.failureReason = 'Blockchain submission failed';
        await transaction.save();
        throw createError(500, 'Failed to submit transaction to blockchain');
      }

      // Update transaction with blockchain details
      transaction.transactionHash = blockchainTransaction.hash;
      transaction.blockchainStatus = blockchainTransaction.status;
      await transaction.save();

      // Simulate transaction processing (in real app, you'd monitor the transaction)
      setTimeout(async () => {
        try {
          // Check transaction status
          const status = await aptosService.getTransactionStatus(blockchainTransaction.hash);
          
          if (status.status === 'success') {
            await transaction.markAsCompleted();
            logger.info(`Swap completed: ${transaction._id}`);
          } else {
            transaction.status = 'failed';
            transaction.failureReason = status.error || 'Transaction failed';
            await transaction.save();
            logger.warn(`Swap failed: ${transaction._id}`);
          }
        } catch (error) {
          logger.error('Error updating transaction status:', error);
        }
      }, 3000); // 3 second delay

      res.json({
        success: true,
        message: 'Swap transaction submitted successfully',
        data: {
          transactionId: transaction._id,
          transactionHash: blockchainTransaction.hash,
          status: 'pending',
          estimatedGas,
          gasPrice: gasPrice.gasPrice,
          dex: selectedDex.name
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

      // Get blockchain status if transaction hash exists
      let blockchainStatus = null;
      if (transaction.transactionHash) {
        try {
          blockchainStatus = await aptosService.getTransactionStatus(transaction.transactionHash);
        } catch (error) {
          logger.error('Failed to get blockchain status:', error);
        }
      }

      res.json({
        success: true,
        data: {
          transaction,
          blockchainStatus
        }
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

  async getSupportedDexes(req, res, next) {
    try {
      const dexes = aptosService.getSupportedDexes();
      
      res.json({
        success: true,
        data: { dexes }
      });
    } catch (error) {
      next(error);
    }
  }

  async getCommonTokens(req, res, next) {
    try {
      const tokens = aptosService.getCommonTokens();
      
      res.json({
        success: true,
        data: { tokens }
      });
    } catch (error) {
      next(error);
    }
  }

  async getLiquidityPools(req, res, next) {
    try {
      const { dex = 'liquidswap' } = req.query;
      
      const pools = await aptosService.getLiquidityPools(dex);
      
      res.json({
        success: true,
        data: { 
          pools,
          dex,
          totalPools: pools.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getPoolInfo(req, res, next) {
    try {
      const { poolAddress } = req.params;
      
      const reserves = await aptosService.getPoolReserves(poolAddress);
      
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
}

module.exports = { SwapController };
