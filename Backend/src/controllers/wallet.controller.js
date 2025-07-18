const { Wallet } = require('../models/Wallet.model');
const { WalletService } = require('../services/wallet.service');
const { AptosService } = require('../services/aptos.service');
const { createError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const walletService = new WalletService();
const aptosService = new AptosService();

class WalletController {
  async connectWallet(req, res, next) {
    try {
      const { address, publicKey, signature } = req.body;
      const userId = req.userId;

      // Validation
      if (!address || !publicKey) {
        throw createError(400, 'Wallet address and public key are required');
      }

      // Validate address format
      const isValidAddress = await aptosService.validateAddress(address);
      if (!isValidAddress) {
        throw createError(400, 'Invalid wallet address format');
      }

      // Connect wallet using Aptos service
      const wallet = await aptosService.connectWallet(userId, {
        address,
        publicKey,
        signature,
      });

      logger.info(`Wallet connected for user ${userId}: ${address}`);

      res.json({
        success: true,
        message: 'Wallet connected successfully',
        data: { wallet },
      });
    } catch (error) {
      next(error);
    }
  }

  async disconnectWallet(req, res, next) {
    try {
      const userId = req.userId;

      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw createError(404, 'No wallet found for this user');
      }

      await wallet.disconnect();

      logger.info(`Wallet disconnected for user ${userId}`);

      res.json({
        success: true,
        message: 'Wallet disconnected successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async getWalletInfo(req, res, next) {
    try {
      const userId = req.userId;

      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw createError(404, 'No wallet found for this user');
      }

      // Get updated balance
      const currentBalance = await aptosService.getAccountBalance(wallet.address);
      await wallet.updateBalance(currentBalance);

      res.json({
        success: true,
        data: { wallet },
      });
    } catch (error) {
      next(error);
    }
  }

  async getBalance(req, res, next) {
    try {
      const userId = req.userId;
      const { coinType } = req.query;

      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw createError(404, 'No wallet found for this user');
      }

      let balance;
      if (coinType) {
        balance = await aptosService.getTokenBalance(wallet.address, coinType);
      } else {
        balance = await aptosService.getAccountBalance(wallet.address);
      }

      // Update wallet balance in database
      await wallet.updateBalance(balance);

      res.json({
        success: true,
        data: {
          address: wallet.address,
          balance,
          coinType: coinType || '0x1::aptos_coin::AptosCoin',
          lastUpdated: new Date(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionHistory(req, res, next) {
    try {
      const userId = req.userId;
      const { limit = 25, offset = 0 } = req.query;

      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw createError(404, 'No wallet found for this user');
      }

      const transactions = await aptosService.getTransactionHistory(
        wallet.address,
        parseInt(limit)
      );

      res.json({
        success: true,
        data: {
          transactions,
          address: wallet.address,
          count: transactions.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAccountResources(req, res, next) {
    try {
      const userId = req.userId;

      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw createError(404, 'No wallet found for this user');
      }

      const resources = await aptosService.getAccountResources(wallet.address);

      res.json({
        success: true,
        data: {
          address: wallet.address,
          resources,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async validateAddress(req, res, next) {
    try {
      const { address } = req.params;

      if (!address) {
        throw createError(400, 'Address parameter is required');
      }

      const isValid = await aptosService.validateAddress(address);

      res.json({
        success: true,
        data: {
          address,
          isValid,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async fundAccount(req, res, next) {
    try {
      const userId = req.userId;
      const { amount } = req.body;

      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw createError(404, 'No wallet found for this user');
      }

      // Only allow funding on testnet/devnet
      if (process.env.APTOS_NETWORK === 'mainnet') {
        throw createError(403, 'Faucet not available on mainnet');
      }

      const result = await aptosService.fundAccount(
        wallet.address,
        amount ? parseInt(amount) : undefined
      );

      // Update balance after funding
      const newBalance = await aptosService.getAccountBalance(wallet.address);
      await wallet.updateBalance(newBalance);

      logger.info(`Account funded for user ${userId}: ${wallet.address}`);

      res.json({
        success: true,
        message: 'Account funded successfully',
        data: {
          result,
          newBalance,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAccountInfo(req, res, next) {
    try {
      const userId = req.userId;

      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw createError(404, 'No wallet found for this user');
      }

      const accountInfo = await aptosService.getAccountInfo(wallet.address);

      res.json({
        success: true,
        data: {
          wallet: {
            ...wallet.toJSON(),
            ...accountInfo,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBalance(req, res, next) {
    try {
      // Placeholder for now
      res.json({ success: true, message: 'Balance update initiated' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { WalletController };
