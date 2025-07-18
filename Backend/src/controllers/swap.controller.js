const { SwapTransaction } = require('../models/SwapTransaction.model');
const { Wallet } = require('../models/Wallet.model');
const { ScamDetectionService } = require('../services/scamDetection.service');
const { AptosService } = require('../services/aptos.service');
const { PriceFeedService } = require('../services/priceFeed.service');
const { createError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const scamDetectionService = new ScamDetectionService();
const aptosService = new AptosService();
const priceFeedService = new PriceFeedService();

class SwapController {
  async getQuote(req, res, next) {
    try {
      const { fromToken, toToken, amount } = req.body;

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

      // Use the new Aptos service to calculate swap rates
      let swapQuote;
      try {
        swapQuote = await aptosService.calculateSwapRates({
          fromToken,
          toToken,
          amount: fromAmount
        });
      } catch (error) {
        logger.error(`Failed to calculate swap rates using primary method: ${error.message}`);
        
        // Fallback to simple calculation if Aptos service fails
        try {
          const fromPriceData = await priceFeedService.getPrice(fromToken);
          const toPriceData = await priceFeedService.getPrice(toToken);
          
          if (!fromPriceData || !toPriceData) {
            return res.status(400).json({
              success: false,
              message: 'Fallback failed: Unable to get price for one or both tokens.',
              data: null
            });
          }
          
          const exchangeRate = fromPriceData.price / toPriceData.price;
          const fee = fromAmount * 0.003;
          const outputAmount = (fromAmount - fee) * exchangeRate;
          
          swapQuote = {
            quoteId: `q_${Date.now()}_fallback_${Math.floor(Math.random() * 1000)}`,
            fromToken,
            toToken,
            fromAmount,
            toAmount: outputAmount,
            exchangeRate,
            fee,
            expiresAt: new Date(Date.now() + 30000).toISOString()
          };
        } catch (fallbackError) {
          logger.error(`Fallback method for getQuote also failed: ${fallbackError.message}`);
          // Ném lỗi ra ngoài để middleware xử lý lỗi chung có thể bắt được
          return next(fallbackError);
        }
      }

      // Get current prices for additional info
      const fromPriceInfo = (await priceFeedService.getPrice(fromToken)) || { symbol: fromToken, price: 0 };
      const toPriceInfo = (await priceFeedService.getPrice(toToken)) || { symbol: toToken, price: 0 };

      res.json({
        success: true,
        data: {
          quote: {
            quoteId: swapQuote.quoteId,
            fromToken,
            toToken,
            fromAmount,
            toAmount: swapQuote.toAmount,
            exchangeRate: swapQuote.exchangeRate,
            fee: swapQuote.fee,
            feeRate: 0.003, // 0.3%
            priceImpact: 0.1, // Simulated price impact
            slippage: 0.5, // Default slippage
            estimatedGas: 100, // Simulated gas cost
            expiresAt: swapQuote.expiresAt
          },
          prices: {
            [fromToken]: fromPriceInfo,
            [toToken]: toPriceInfo,
          },
        },
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
      } = req.body;

      // Validation
      if (!fromToken || !toToken || !fromAmount || !toAmount || !quoteId) {
        throw createError(400, 'All swap parameters are required');
      }

      // Get user wallet
      const wallet = await Wallet.findOne({ userId });
      if (!wallet || !wallet.isConnected) {
        throw createError(400, 'No connected wallet found');
      }

      // Scam detection
      const scamRisk = await scamDetectionService.analyzeTransaction({
        fromToken,
        toToken,
        amount: fromAmount,
        walletAddress: wallet.address,
      });

      if (scamRisk.isScam) {
        throw createError(403, `Transaction blocked: ${scamRisk.reason}`);
      }

      // Create swap transaction payload using Aptos service
      const transactionPayload = await aptosService.createSwapTransactionPayload({
        fromToken,
        toToken,
        fromAmount: parseFloat(fromAmount),
        toAmount: parseFloat(toAmount),
        slippage
      });

      // Calculate exchange rate
      const exchangeRate = parseFloat(toAmount) / parseFloat(fromAmount);

      // Create transaction record
      const transaction = new SwapTransaction({
        userId,
        fromToken: fromToken.toUpperCase(),
        toToken: toToken.toUpperCase(),
        fromAmount: parseFloat(fromAmount),
        toAmount: parseFloat(toAmount),
        exchangeRate,
        transactionHash: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Simulated hash
        status: 'pending',
        walletAddress: wallet.address,
        scamRisk: scamRisk.riskScore,
        metadata: {
          quoteId,
          slippage,
          gasLimit: 100,
          gasPrice: 100,
          payload: transactionPayload
        },
      });

      await transaction.save();

      // Simulate transaction processing
      setTimeout(async () => {
        try {
          // Simulate success/failure (95% success rate)
          const isSuccess = Math.random() > 0.05;
          
          if (isSuccess) {
            await transaction.markAsCompleted();
            logger.info(`Swap completed: ${transaction._id}`);
          } else {
            transaction.status = 'failed';
            transaction.failureReason = 'Insufficient liquidity';
            await transaction.save();
            logger.warn(`Swap failed: ${transaction._id}`);
          }
        } catch (error) {
          logger.error('Error updating transaction status:', error);
        }
      }, 3000); // 3 second delay

      logger.info(`Swap initiated for user ${userId}: ${fromAmount} ${fromToken} -> ${toAmount} ${toToken}`);

      res.json({
        success: true,
        message: 'Swap transaction initiated',
        data: {
          transaction: {
            id: transaction._id,
            transactionHash: transaction.transactionHash,
            status: transaction.status,
            fromToken: transaction.fromToken,
            toToken: transaction.toToken,
            fromAmount: transaction.fromAmount,
            toAmount: transaction.toAmount,
            exchangeRate: transaction.exchangeRate,
            scamRisk: transaction.scamRisk,
            createdAt: transaction.createdAt,
          },
          // Include the transaction payload that would be sent to the blockchain
          payload: transactionPayload
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSwapHistory(req, res, next) {
    try {
      const userId = req.userId;
      const {
        page = 1,
        limit = 20,
        status,
        fromToken,
        toToken,
        sort = '-createdAt',
      } = req.query;

      const filters = { userId };
      if (status) filters.status = status;
      if (fromToken) filters.fromToken = fromToken.toUpperCase();
      if (toToken) filters.toToken = toToken.toUpperCase();

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort,
        lean: true,
      };

      const transactions = await SwapTransaction.paginate(filters, options);

      res.json({
        success: true,
        data: {
          transactions: transactions.docs,
          pagination: {
            totalDocs: transactions.totalDocs,
            totalPages: transactions.totalPages,
            page: transactions.page,
            limit: transactions.limit,
            hasNext: transactions.hasNextPage,
            hasPrev: transactions.hasPrevPage,
          },
        },
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
        userId,
      });

      if (!transaction) {
        throw createError(404, 'Transaction not found');
      }

      res.json({
        success: true,
        data: { transaction },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSwapDetails(req, res, next) {
    try {
      const { transactionId } = req.params;
      const userId = req.userId;

      const transaction = await SwapTransaction.findOne({
        _id: transactionId,
        userId,
      }).lean();

      if (!transaction) {
        throw createError(404, 'Transaction not found');
      }

      // If this is a real blockchain transaction, we would fetch additional details
      // from the blockchain using the transaction hash
      let onChainDetails = {};
      
      if (transaction.transactionHash && !transaction.transactionHash.startsWith('sim_')) {
        try {
          // Try to get on-chain transaction details
          onChainDetails = await aptosService.getTransaction(transaction.transactionHash);
        } catch (error) {
          logger.error(`Failed to get on-chain details for ${transaction.transactionHash}:`, error.message);
          // Continue without on-chain details
        }
      }

      res.json({
        success: true,
        data: {
          transaction,
          onChainDetails
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelSwap(req, res, next) {
    try {
      const { transactionId } = req.params;
      const userId = req.userId;

      const transaction = await SwapTransaction.findOne({
        _id: transactionId,
        userId,
        status: 'pending',
      });

      if (!transaction) {
        throw createError(404, 'Pending transaction not found');
      }

      transaction.status = 'cancelled';
      transaction.updatedAt = new Date();
      await transaction.save();

      logger.info(`Swap cancelled: ${transactionId} by user ${userId}`);

      res.json({
        success: true,
        message: 'Transaction cancelled successfully',
        data: { transactionId },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSwapStats(req, res, next) {
    try {
      const userId = req.userId;

      // Get user's transaction stats
      const stats = await SwapTransaction.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalFromAmount: { $sum: '$fromAmount' },
            totalToAmount: { $sum: '$toAmount' },
          },
        },
      ]);

      // Format stats by status
      const formattedStats = {
        total: 0,
        completed: 0,
        pending: 0,
        failed: 0,
        cancelled: 0,
        totalFromAmount: 0,
        totalToAmount: 0,
      };

      stats.forEach((stat) => {
        formattedStats[stat._id] = stat.count;
        formattedStats.total += stat.count;

        if (stat._id === 'completed') {
          formattedStats.totalFromAmount = stat.totalFromAmount;
          formattedStats.totalToAmount = stat.totalToAmount;
        }
      });

      // Get most used tokens
      const tokenStats = await SwapTransaction.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: {
              fromToken: '$fromToken',
              toToken: '$toToken',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]);

      const tokenPairs = tokenStats.map((stat) => ({
        fromToken: stat._id.fromToken,
        toToken: stat._id.toToken,
        count: stat.count,
      }));

      // Calculate success rate
      const successRate =
        formattedStats.total > 0
          ? (formattedStats.completed / formattedStats.total) * 100
          : 0;

      res.json({
        success: true,
        data: {
          stats: formattedStats,
          successRate: parseFloat(successRate.toFixed(2)),
          mostUsedTokenPairs: tokenPairs,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // New method to calculate swap rates
  async calculateSwapRates(req, res, next) {
    try {
      const { fromToken, toToken, amount } = req.body;

      if (!fromToken || !toToken || !amount) {
        throw createError(400, 'fromToken, toToken, and amount are required');
      }

      const fromAmount = parseFloat(amount);
      if (fromAmount <= 0) {
        throw createError(400, 'Amount must be greater than 0');
      }

      const rates = await aptosService.calculateSwapRates({
        fromToken,
        toToken,
        amount: fromAmount
      });

      res.json({
        success: true,
        data: rates
      });
    } catch (error) {
      next(error);
    }
  }

  // New method to create swap transaction payload
  async createSwapTransaction(req, res, next) {
    try {
      const { fromToken, toToken, fromAmount, toAmount, slippage } = req.body;

      if (!fromToken || !toToken || !fromAmount || !toAmount) {
        throw createError(400, 'fromToken, toToken, fromAmount, and toAmount are required');
      }

      const payload = await aptosService.createSwapTransactionPayload({
        fromToken,
        toToken,
        fromAmount: parseFloat(fromAmount),
        toAmount: parseFloat(toAmount),
        slippage: slippage || 0.5
      });

      res.json({
        success: true,
        data: {
          payload
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { SwapController };
