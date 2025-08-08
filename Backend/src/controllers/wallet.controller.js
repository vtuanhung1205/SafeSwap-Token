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
      console.log("Received wallet connect request:", req.body); // Log the request body
      let { address, publicKey, signature } = req.body;
      
      // Get userId from authenticated user - guest users are no longer allowed
      if (!req.user || !req.user._id) {
        throw createError(401, 'Authentication required to connect wallet');
      }
      
      const userId = req.user._id;
      console.log(`Connecting wallet for user: ${userId}`);

      // Normalize address and publicKey
      try {
        // Ensure address is a string and properly formatted
        if (typeof address === 'object') {
          address = address.hexString || JSON.stringify(address);
        } else if (address) {
          address = String(address);
        }
        
        // Ensure publicKey is a string
        if (typeof publicKey === 'object') {
          publicKey = publicKey.hexString || JSON.stringify(publicKey);
        } else if (publicKey) {
          publicKey = String(publicKey);
        }
      } catch (error) {
        logger.error('Error normalizing wallet data:', error);
      }

      // Validation
      if (!address || !publicKey) {
        throw createError(400, 'Wallet address and public key are required');
      }

      // Validate address format
      const isValidAddress = await aptosService.validateAddress(address);
      if (!isValidAddress) {
        throw createError(400, 'Invalid wallet address format');
      }

      try {
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
        // Handle specific errors
        if (error.status === 409) {
          return next(createError(409, 'This wallet is already linked to another account'));
        }
        throw error;
      }
    } catch (error) {
      logger.error('Wallet connection error:', {
        message: error.message,
        stack: error.stack
      });
      next(error);
    }
  }

  async disconnectWallet(req, res, next) {
    try {
      const userId = req.user._id;

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
      const userId = req.user._id;

      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw createError(404, 'No wallet found for this user');
      }

      // Get updated APT balance
      const aptBalance = await aptosService.getAccountBalance(wallet.address);
      await wallet.updateBalance(aptBalance);

      // Get balances for other common tokens
      const tokenBalances = {};
      const commonTokens = [
        { symbol: 'APT', address: '0x1::aptos_coin::AptosCoin', decimals: 8 },
        { symbol: 'USDC', address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC', decimals: 6 },
        { symbol: 'USDT', address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT', decimals: 6 },
        { symbol: 'BTC', address: '0xae478ff7d83ed072dbc5e264250e67ef58f57c99d89b447efd8a0a2e8b2be76e::coin::T', decimals: 8 },
        { symbol: 'ETH', address: '0xcc8a89c8dce9693d354449f1f73e60e14e347417854f029db5bc8e7454008abb::coin::T', decimals: 18 }
      ];

      // Get balances for each token in parallel
      await Promise.all(
        commonTokens.map(async (token) => {
          try {
            const rawBalance = await aptosService.getTokenBalance(wallet.address, token.address);
            // Convert raw balance to human-readable format based on decimals
            const balance = rawBalance / Math.pow(10, token.decimals);
            tokenBalances[token.symbol] = {
              symbol: token.symbol,
              address: token.address,
              balance: balance,
              rawBalance: rawBalance,
              decimals: token.decimals
            };
          } catch (error) {
            logger.warn(`Failed to get ${token.symbol} balance for ${wallet.address}:`, error.message);
            tokenBalances[token.symbol] = {
              symbol: token.symbol,
              address: token.address,
              balance: 0,
              rawBalance: 0,
              decimals: token.decimals
            };
          }
        })
      );

      res.json({
        success: true,
        data: { 
          wallet: {
            ...wallet.toJSON(),
            tokenBalances
          }
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getBalance(req, res, next) {
    try {
      const userId = req.user._id;
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
      const userId = req.user._id;
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
      const userId = req.user._id;

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
      const { address } = req.body;

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
      const userId = req.user._id;
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
      const userId = req.user._id;

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
