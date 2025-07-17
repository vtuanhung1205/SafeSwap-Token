import { Request, Response, NextFunction } from 'express';
import { WalletService } from '@/services/wallet.service';
import { AptosService } from '@/services/aptos.service';
import { IUser } from '@/models/User.model';
import { ApiResponse } from '@/types';
import { asyncHandler, createError } from '@/middleware/errorHandler';

export class WalletController {
  private walletService = new WalletService();
  private aptosService = new AptosService();

  public getWalletInfo = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const wallet = await this.walletService.getWalletByUserId(user._id.toString());
    
    if (!wallet) {
      return next(createError(404, 'Wallet not connected for this user'));
    }

    const accountInfo = await this.aptosService.getAccount(wallet.address);

    res.json({
      success: true,
      message: 'Wallet information retrieved',
      data: { wallet, accountInfo },
      timestamp: new Date().toISOString(),
    });
  });

  public connectWallet = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const { address, publicKey } = req.body;
    
    if (!address || !publicKey) {
      return next(createError(400, 'Address and publicKey are required'));
    }

    const wallet = await this.walletService.connectWallet(user._id.toString(), address, publicKey);
    res.status(201).json({
      success: true,
      message: 'Wallet connected successfully',
      data: { wallet },
      timestamp: new Date().toISOString(),
    });
  });

  public getTransactionHistory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const wallet = await this.walletService.getWalletByUserId(user._id.toString());

    if (!wallet) {
      return next(createError(404, 'Wallet not connected for this user'));
    }

    const { limit = '25' } = req.query;
    const transactions = await this.aptosService.getAccountTransactions(wallet.address, parseInt(limit as string, 10));

    res.json({
      success: true,
      message: 'Transaction history retrieved',
      data: { transactions },
      timestamp: new Date().toISOString(),
    });
  });

  public fundTestnetWallet = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const { amount } = req.body;
    const wallet = await this.walletService.getWalletByUserId(user._id.toString());

    if (!wallet) {
      return next(createError(404, 'Wallet not connected for this user'));
    }

    const transactionHash = await this.aptosService.fundAccount(wallet.address, amount || 100_000_000); // Default to 1 APT
    res.json({
      success: true,
      message: 'Funding transaction sent',
      data: { transactionHash },
      timestamp: new Date().toISOString(),
    });
  });
} 