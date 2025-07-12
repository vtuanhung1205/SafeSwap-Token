import { Request, Response } from 'express';
import { SwapTransaction } from '@/models/SwapTransaction.model';
import { PriceFeedService } from '@/services/priceFeed.service';
import { ScamDetectionService } from '@/services/scamDetection.service';
import { AptosService } from '@/services/aptos.service';
import { logger } from '@/utils/logger';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { ApiResponse, PaginatedResponse } from '@/types';

export class SwapController {
  private priceFeedService: PriceFeedService;
  private scamDetectionService: ScamDetectionService;
  private aptosService: AptosService;

  constructor() {
    this.priceFeedService = new PriceFeedService();
    this.scamDetectionService = new ScamDetectionService();
    this.aptosService = new AptosService();
  }

  public getSwapQuote = asyncHandler(async (req: Request, res: Response) => {
    const { fromToken, toToken, amount } = req.body;

    if (!fromToken || !toToken || !amount) {
      throw createError('From token, to token, and amount are required', 400);
    }

    if (amount <= 0) {
      throw createError('Amount must be greater than 0', 400);
    }

    try {
      // Get exchange rate
      const exchangeRate = await this.priceFeedService.calculateExchangeRate(
        fromToken,
        toToken
      );

      const estimatedReceive = parseFloat(amount) * exchangeRate;

      // Get token prices for additional info
      const fromTokenPrice = await this.priceFeedService.getTokenPrice(fromToken);
      const toTokenPrice = await this.priceFeedService.getTokenPrice(toToken);

      // Calculate USD values
      const fromUsdValue = fromTokenPrice ? parseFloat(amount) * fromTokenPrice.price : 0;
      const toUsdValue = toTokenPrice ? estimatedReceive * toTokenPrice.price : 0;

      // Calculate price impact (simplified)
      const priceImpact = Math.abs(fromUsdValue - toUsdValue) / fromUsdValue * 100;

      // Mock fee calculation (in real implementation, this would be more complex)
      const fee = parseFloat(amount) * 0.003; // 0.3% fee
      const feeUsd = fromTokenPrice ? fee * fromTokenPrice.price : 0;

      const response: ApiResponse = {
        success: true,
        data: {
          quote: {
            fromToken,
            toToken,
            fromAmount: parseFloat(amount),
            toAmount: estimatedReceive,
            exchangeRate,
            fromUsdValue,
            toUsdValue,
            priceImpact,
            fee,
            feeUsd,
            estimatedGas: 0.001, // Mock gas fee
            minimumReceived: estimatedReceive * 0.98, // 2% slippage tolerance
            validUntil: new Date(Date.now() + 30 * 1000).toISOString(), // 30 seconds
          },
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get swap quote failed:', error);
      throw error;
    }
  });

  public executeSwap = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { fromToken, toToken, fromAmount, toAmount, quoteId } = req.body;

    if (!fromToken || !toToken || !fromAmount || !toAmount) {
      throw createError('All swap parameters are required', 400);
    }

    try {
      // Check if user has connected wallet
      const wallet = await this.aptosService.getUserWallet(userId);
      if (!wallet || !wallet.isConnected) {
        throw createError('Wallet not connected', 400);
      }

      // Perform scam detection on destination token
      const scamAnalysis = await this.scamDetectionService.analyzeToken(
        toToken,
        undefined,
        toToken
      );

      if (scamAnalysis.isScam && scamAnalysis.riskScore > 80) {
        throw createError(
          `High risk token detected: ${scamAnalysis.reasons.join(', ')}`,
          400
        );
      }

      // Mock transaction hash (in real implementation, this would be the actual transaction)
      const transactionHash = `0x${Math.random().toString(16).substring(2, 66)}`;

      // Create swap transaction record
      const swapTransaction = new SwapTransaction({
        userId,
        fromToken,
        toToken,
        fromAmount: parseFloat(fromAmount),
        toAmount: parseFloat(toAmount),
        exchangeRate: parseFloat(toAmount) / parseFloat(fromAmount),
        transactionHash,
        status: 'pending',
        scamRisk: scamAnalysis.riskScore,
      });

      await swapTransaction.save();

      // Mock transaction execution (in real implementation, this would interact with DEX)
      setTimeout(async () => {
        try {
          // Simulate transaction completion
          swapTransaction.status = 'completed';
          await swapTransaction.save();
          
          // Update wallet balance
          await this.aptosService.updateWalletBalance(userId);
          
          logger.info(`Swap completed: ${transactionHash}`);
        } catch (error) {
          logger.error('Swap completion failed:', error);
          swapTransaction.status = 'failed';
          await swapTransaction.save();
        }
      }, 5000); // 5 second delay to simulate transaction processing

      const response: ApiResponse = {
        success: true,
        message: 'Swap initiated successfully',
        data: {
          transaction: {
            id: swapTransaction._id,
            hash: transactionHash,
            fromToken,
            toToken,
            fromAmount: parseFloat(fromAmount),
            toAmount: parseFloat(toAmount),
            status: swapTransaction.status,
            scamRisk: scamAnalysis.riskScore,
            scamWarning: scamAnalysis.riskScore > 50 ? scamAnalysis.reasons : null,
            createdAt: swapTransaction.createdAt,
          },
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Execute swap failed:', error);
      throw error;
    }
  });

  public getSwapHistory = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { page = 1, limit = 20, status } = req.query;

    try {
      const filter: any = { userId };
      if (status) {
        filter.status = status;
      }

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
      const total = await SwapTransaction.countDocuments(filter);

      const transactions = await SwapTransaction.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit as string));

      const response: PaginatedResponse = {
        success: true,
        data: { transactions },
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          totalPages: Math.ceil(total / parseInt(limit as string)),
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get swap history failed:', error);
      throw error;
    }
  });

  public getSwapDetails = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { transactionId } = req.params;

    try {
      const transaction = await SwapTransaction.findOne({
        _id: transactionId,
        userId,
      });

      if (!transaction) {
        throw createError('Transaction not found', 404);
      }

      const response: ApiResponse = {
        success: true,
        data: { transaction },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get swap details failed:', error);
      throw error;
    }
  });

  public getSwapStats = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try {
      const stats = await SwapTransaction.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: null,
            totalSwaps: { $sum: 1 },
            completedSwaps: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
            },
            failedSwaps: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
            },
            pendingSwaps: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
            },
            totalVolume: { $sum: '$fromAmount' },
            averageScamRisk: { $avg: '$scamRisk' },
          },
        },
      ]);

      const result = stats[0] || {
        totalSwaps: 0,
        completedSwaps: 0,
        failedSwaps: 0,
        pendingSwaps: 0,
        totalVolume: 0,
        averageScamRisk: 0,
      };

      const response: ApiResponse = {
        success: true,
        data: { stats: result },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get swap stats failed:', error);
      throw error;
    }
  });
} 