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
        throw createError(400, 'fromToken, toToken, and amount are required');
      }

      const fromAmount = parseFloat(amount);
      if (fromAmount <= 0) {
        throw createError(400, 'Amount must be greater than 0');
      }

      // Get current prices
      const fromPrice = priceFeedService.getPrice(fromToken);
      const toPrice = priceFeedService.getPrice(toToken);

      if (!fromPrice || !toPrice) {
        throw createError(400, 'Unable to get price for one or both tokens');
      }

      // Calculate exchange rate and amounts
      const exchangeRate = fromPrice.price / toPrice.price;
      const toAmount = fromAmount * exchangeRate;

      // Simulate fees (0.3% swap fee)
      const feeRate = 0.003;
      const fee = fromAmount * feeRate;
      const toAmountAfterFee = toAmount * (1 - feeRate);

      res.json({
        success: true,
        data: {
          quote: {
            fromToken,
            toToken,
            fromAmount,
            toAmount: parseFloat(toAmountAfterFee.toFixed(8)),
            exchangeRate: parseFloat(exchangeRate.toFixed(8)),
            fee: parseFloat(fee.toFixed(8)),
            feeRate,
            priceImpact: 0.1, // Simulated price impact
            slippage: 0.5, // Simulated slippage
            estimatedGas: 100, // Simulated gas cost
          },
          prices: {
            [fromToken]: fromPrice,
            [toToken]: toPrice,
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
        slippage = 0.5,
        deadline,
      } = req.body;

      // Validation
      if (!fromToken || !toToken || !fromAmount || !toAmount) {
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
          slippage,
          deadline,
          gasLimit: 100,
          gasPrice: 100,
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
      // Placeholder
      res.json({ success: true, details: {} });
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
      });

      if (!transaction) {
        throw createError(404, 'Transaction not found');
      }

      if (transaction.status !== 'pending') {
        throw createError(400, 'Only pending transactions can be cancelled');
      }

      transaction.status = 'cancelled';
      await transaction.save();

      logger.info(`Swap cancelled by user ${userId}: ${transactionId}`);

      res.json({
        success: true,
        message: 'Swap transaction cancelled',
        data: { transaction },
      });
    } catch (error) {
      next(error);
    }
  }

  async getSwapStats(req, res, next) {
    try {
      const userId = req.userId;
      const { period = '24h' } = req.query;

      let startDate;
      switch (period) {
        case '24h':
          startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
      }

      const stats = await SwapTransaction.aggregate([
        {
          $match: {
            userId: userId,
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            completedTransactions: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            totalVolume: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$fromAmount', 0] },
            },
            avgTransactionSize: { $avg: '$fromAmount' },
          },
        },
      ]);

      const result = stats[0] || {
        totalTransactions: 0,
        completedTransactions: 0,
        totalVolume: 0,
        avgTransactionSize: 0,
      };

      res.json({
        success: true,
        data: {
          period,
          stats: result,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { SwapController };
