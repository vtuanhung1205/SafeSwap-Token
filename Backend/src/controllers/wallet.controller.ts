import { Request, Response, NextFunction } from 'express';
import { AptosService } from '@/services/aptos.service';
import { logger } from '@/utils/logger';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { ApiResponse } from '@/types';
import { IUser } from '@/types/user';

export class WalletController {
  private aptosService: AptosService;

  constructor() {
    this.aptosService = new AptosService();
  }

  public connectWallet = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { address, publicKey } = req.body;

    if (!address || !publicKey) {
      throw createError('Address and public key are required', 400);
    }

    try {
      const wallet = await this.aptosService.connectWallet(userId, {
        address,
        publicKey,
      });

      const response: ApiResponse = {
        success: true,
        message: 'Wallet connected successfully',
        data: { wallet },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Connect wallet failed:', error);
      throw error;
    }
  });

  public disconnectWallet = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try {
      await this.aptosService.disconnectWallet(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Wallet disconnected successfully',
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Disconnect wallet failed:', error);
      throw error;
    }
  });

  public getWalletInfo = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const wallet = await this.aptosService.getAccount(wallet.address);
    if (!wallet) return next(createError(404, 'Wallet not found'));

    // Use the renamed method
    const accountInfo = await this.aptosService.getAccount(wallet.address);

    res.json(new ApiResponse({ wallet, accountInfo }, 'Wallet information retrieved'));
  });

  public getBalance = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try {
      const wallet = await this.aptosService.getUserWallet(userId);

      if (!wallet) {
        throw createError('Wallet not found', 404);
      }

      const balance = await this.aptosService.getAccountBalance(wallet.address);

      const response: ApiResponse = {
        success: true,
        data: {
          address: wallet.address,
          balance,
          balanceFormatted: `${balance.toFixed(8)} APT`,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Get balance failed:', error);
      throw error;
    }
  });

  public updateBalance = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;

    try {
      const balance = await this.aptosService.updateWalletBalance(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Balance updated successfully',
        data: {
          balance,
          balanceFormatted: `${balance.toFixed(8)} APT`,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Update balance failed:', error);
      throw error;
    }
  });

  public getTransactionHistory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const wallet = await this.aptosService.getAccountTransactions(wallet.address, parseInt(limit as string, 10));
    if (!wallet) return next(createError(404, 'Wallet not found'));

    const { limit = '25' } = req.query;

    // Use the renamed method
    const transactions = await this.aptosService.getAccountTransactions(wallet.address, parseInt(limit as string, 10));

    res.json(new ApiResponse({ transactions }, 'Transaction history retrieved'));
  });

  public validateAddress = asyncHandler(async (req: Request, res: Response) => {
    const { address } = req.body;

    if (!address) {
      throw createError('Address is required', 400);
    }

    try {
      const isValid = await this.aptosService.validateAddress(address);

      const response: ApiResponse = {
        success: true,
        data: {
          address,
          isValid,
          message: isValid ? 'Address is valid' : 'Address is invalid',
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Validate address failed:', error);
      throw error;
    }
  });

  public fundAccount = asyncHandler(async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { amount = 10000000 } = req.body; // Default 0.1 APT

    try {
      const wallet = await this.aptosService.getUserWallet(userId);

      if (!wallet) {
        throw createError('Wallet not found', 404);
      }

      const result = await this.aptosService.fundAccount(wallet.address, amount);

      // Update wallet balance after funding
      await this.aptosService.updateWalletBalance(userId);

      const response: ApiResponse = {
        success: true,
        message: 'Account funded successfully',
        data: {
          address: wallet.address,
          amount,
          amountFormatted: `${(amount / 100000000).toFixed(8)} APT`,
          transactionHash: result.hash,
        },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Fund account failed:', error);
      throw error;
    }
  });
} 