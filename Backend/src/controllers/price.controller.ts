import { Request, Response } from 'express';
import { PriceFeedService } from '@/services/priceFeed.service';
import { ScamDetectionService } from '@/services/scamDetection.service';
import { logger } from '@/utils/logger';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { ApiResponse } from '@/types';

export class PriceController {
  private priceFeedService: PriceFeedService;
  private scamDetectionService: ScamDetectionService;

  constructor() {
    this.priceFeedService = new PriceFeedService();
    this.scamDetectionService = new ScamDetectionService();
  }

  public getAllPrices = asyncHandler(async (req: Request, res: Response) => {
    try {
      const prices = await this.priceFeedService.getAllTokenPrices();

      const response: ApiResponse = {
        success: true,
        data: {
          prices,
          count: prices.length,
          lastUpdated: prices.length > 0 ? prices[0].lastUpdated : new Date(),
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get all prices failed:', error);
      throw error;
    }
  });

  public getTokenPrice = asyncHandler(async (req: Request, res: Response) => {
    const { symbol } = req.params;

    if (!symbol) {
      throw createError('Token symbol is required', 400);
    }

    try {
      const price = await this.priceFeedService.getTokenPrice(symbol);

      if (!price) {
        throw createError('Token price not found', 404);
      }

      const response: ApiResponse = {
        success: true,
        data: { price },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error(`Get token price failed for ${symbol}:`, error);
      throw error;
    }
  });

  public getExchangeRate = asyncHandler(async (req: Request, res: Response) => {
    const { from, to } = req.query;

    if (!from || !to) {
      throw createError('From and to symbols are required', 400);
    }

    try {
      const rate = await this.priceFeedService.calculateExchangeRate(
        from as string,
        to as string
      );

      const fromPrice = await this.priceFeedService.getTokenPrice(from as string);
      const toPrice = await this.priceFeedService.getTokenPrice(to as string);

      const response: ApiResponse = {
        success: true,
        data: {
          from: from as string,
          to: to as string,
          rate,
          fromPrice: fromPrice?.price || 0,
          toPrice: toPrice?.price || 0,
          lastUpdated: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error(`Get exchange rate failed for ${from}/${to}:`, error);
      throw error;
    }
  });

  public analyzeToken = asyncHandler(async (req: Request, res: Response) => {
    const { tokenAddress, tokenName, tokenSymbol } = req.body;

    if (!tokenAddress) {
      throw createError('Token address is required', 400);
    }

    try {
      const analysis = await this.scamDetectionService.analyzeToken(
        tokenAddress,
        tokenName,
        tokenSymbol
      );

      const response: ApiResponse = {
        success: true,
        data: { analysis },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error(`Token analysis failed for ${tokenAddress}:`, error);
      throw error;
    }
  });

  public batchAnalyzeTokens = asyncHandler(async (req: Request, res: Response) => {
    const { tokenAddresses } = req.body;

    if (!tokenAddresses || !Array.isArray(tokenAddresses)) {
      throw createError('Token addresses array is required', 400);
    }

    if (tokenAddresses.length > 10) {
      throw createError('Maximum 10 tokens can be analyzed at once', 400);
    }

    try {
      const analyses = await this.scamDetectionService.batchAnalyzeTokens(tokenAddresses);

      const response: ApiResponse = {
        success: true,
        data: {
          analyses,
          count: analyses.length,
          summary: {
            totalTokens: analyses.length,
            scamTokens: analyses.filter(a => a.isScam).length,
            safeTokens: analyses.filter(a => !a.isScam).length,
            averageRiskScore: analyses.reduce((sum, a) => sum + a.riskScore, 0) / analyses.length,
          },
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Batch token analysis failed:', error);
      throw error;
    }
  });
} 