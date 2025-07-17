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

    res.json(new ApiResponse({ wallet, accountInfo }, 'Wallet information retrieved'));
  });

  public connectWallet = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const { address, publicKey } = req.body;
    
    if (!address || !publicKey) {
      return next(createError(400, 'Address and publicKey are required'));
    }

    const wallet = await this.walletService.connectWallet(user._id.toString(), address, publicKey);
    res.status(201).json(new ApiResponse({ wallet }, 'Wallet connected successfully'));
  });

  public getTransactionHistory = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const wallet = await this.walletService.getWalletByUserId(user._id.toString());

    if (!wallet) {
      return next(createError(404, 'Wallet not connected for this user'));
    }

    const { limit = '25' } = req.query;
    const transactions = await this.aptosService.getAccountTransactions(wallet.address, parseInt(limit as string, 10));

    res.json(new ApiResponse({ transactions }, 'Transaction history retrieved'));
  });

  public fundTestnetWallet = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as IUser;
    const { amount } = req.body;
    const wallet = await this.walletService.getWalletByUserId(user._id.toString());

    if (!wallet) {
      return next(createError(404, 'Wallet not connected for this user'));
    }

    const transactionHash = await this.aptosService.fundAccount(wallet.address, amount || 100_000_000); // Default to 1 APT
    res.json(new ApiResponse({ transactionHash }, 'Funding transaction sent'));
  });
} 