const { Wallet } = require('../models/Wallet.model');
const { Token } = require('../models/Token.model');
const { User } = require('../models/User.model');
const { WalletService } = require('../services/wallet.service');
const { AptosBlockchainService } = require('../services/aptosBlockchain.service');
const { createError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const walletService = new WalletService();
const aptosService = new AptosBlockchainService();

class WalletController {
  async connectWallet(req, res, next) {
    try {
      console.log("Received wallet connect request:", req.body);
      let { address, publicKey, signature, walletName = 'Default Wallet' } = req.body;
      
      // Get userId from authenticated user
      if (!req.user || !req.user._id) {
        throw createError(401, 'Authentication required to connect wallet');
      }

      const userId = req.user._id;

      // Validate Aptos address format
      if (!aptosService.validateAddress(address)) {
        throw createError(400, 'Invalid Aptos address format');
      }

      // Check if wallet is already connected by this user
      const existingWallet = await Wallet.findOne({ 
        userId, 
        address 
      });

      if (existingWallet) {
        if (existingWallet.isConnected) {
          return res.json({
            success: true,
            message: 'Wallet already connected',
            data: { wallet: existingWallet }
          });
        } else {
          // Reconnect existing wallet
          existingWallet.isConnected = true;
          existingWallet.lastSyncAt = new Date();
          await existingWallet.save();
          
          logger.info(`Wallet reconnected for user ${userId}: ${address}`);
          return res.json({
            success: true,
            message: 'Wallet reconnected successfully',
            data: { wallet: existingWallet }
          });
        }
      }

      // Check if wallet is connected by another user
      const walletUsedByOther = await Wallet.findOne({ 
        address, 
        isConnected: true 
      });

      if (walletUsedByOther) {
        throw createError(409, 'This wallet is already connected to another account');
      }

      // Get account info from blockchain
      let accountInfo, aptBalance, tokenBalances;
      try {
        accountInfo = await aptosService.getAccountInfo(address);
        aptBalance = await aptosService.getAccountBalance(address);
        tokenBalances = await aptosService.getAllTokenBalances(address);
      } catch (error) {
        logger.warn(`Failed to get blockchain data for ${address}:`, error.message);
        // Continue with default values
        aptBalance = 0;
        tokenBalances = {};
      }

      // Create new wallet
      const newWallet = new Wallet({
        userId,
        address,
        publicKey,
        chainId: 'aptos-testnet',
        aptBalance,
        tokenBalances,
        isConnected: true,
        lastSyncAt: new Date(),
        sequenceNumber: accountInfo?.sequence_number || 0,
        authenticationKey: accountInfo?.authentication_key || publicKey,
        accountType: 'single_signer',
        name: walletName
      });

      await newWallet.save();

      // Update user's default wallet if this is their first wallet
      const user = await User.findById(userId);
      if (!user.defaultWalletId) {
        user.defaultWalletId = newWallet._id;
        await user.save();
      }

      logger.info(`New wallet connected for user ${userId}: ${address}`);

      res.json({
        success: true,
        message: 'Wallet connected successfully',
        data: { 
          wallet: newWallet,
          isDefault: !user.defaultWalletId || user.defaultWalletId.equals(newWallet._id)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async disconnectWallet(req, res, next) {
    try {
      const { walletId } = req.params;
      const userId = req.user._id;

      const wallet = await Wallet.findOne({ 
        _id: walletId, 
        userId 
      });

      if (!wallet) {
        throw createError(404, 'Wallet not found');
      }

      wallet.isConnected = false;
      wallet.lastSyncAt = new Date();
      await wallet.save();

      // Update user's default wallet if this was the default
      const user = await User.findById(userId);
      if (user.defaultWalletId && user.defaultWalletId.equals(walletId)) {
        // Find another connected wallet to set as default
        const otherWallet = await Wallet.findOne({ 
          userId, 
          isConnected: true,
          _id: { $ne: walletId }
        });
        
        user.defaultWalletId = otherWallet ? otherWallet._id : null;
        await user.save();
      }

      logger.info(`Wallet disconnected for user ${userId}: ${wallet.address}`);

      res.json({
        success: true,
        message: 'Wallet disconnected successfully',
        data: { walletId }
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserWallets(req, res, next) {
    try {
      const userId = req.user._id;
      const { includeDisconnected = false } = req.query;

      const query = { userId };
      if (!includeDisconnected) {
        query.isConnected = true;
      }

      const wallets = await Wallet.find(query)
        .sort({ lastSyncAt: -1 })
        .lean();

      // Get user's default wallet
      const user = await User.findById(userId);
      const defaultWalletId = user?.defaultWalletId;

      const walletsWithDefault = wallets.map(wallet => ({
        ...wallet,
        isDefault: defaultWalletId && defaultWalletId.equals(wallet._id)
      }));

      res.json({
        success: true,
        data: { 
          wallets: walletsWithDefault,
          totalWallets: walletsWithDefault.length,
          connectedWallets: walletsWithDefault.filter(w => w.isConnected).length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getWalletInfo(req, res, next) {
    try {
      const { walletId } = req.params;
      const userId = req.user._id;

      const wallet = await Wallet.findOne({ 
        _id: walletId, 
        userId 
      });

      if (!wallet) {
        throw createError(404, 'Wallet not found');
      }

      // Get fresh balance from blockchain if wallet is connected
      if (wallet.isConnected) {
        try {
          const aptBalance = await aptosService.getAccountBalance(wallet.address);
          const tokenBalances = await aptosService.getAllTokenBalances(wallet.address);
          
          wallet.aptBalance = aptBalance;
          wallet.tokenBalances = tokenBalances;
          wallet.lastSyncAt = new Date();
          await wallet.save();
        } catch (error) {
          logger.warn(`Failed to sync wallet ${wallet.address}:`, error.message);
        }
      }

      res.json({
        success: true,
        data: { wallet }
      });
    } catch (error) {
      next(error);
    }
  }

  async setDefaultWallet(req, res, next) {
    try {
      const { walletId } = req.params;
      const userId = req.user._id;

      // Verify wallet belongs to user
      const wallet = await Wallet.findOne({ 
        _id: walletId, 
        userId 
      });

      if (!wallet) {
        throw createError(404, 'Wallet not found');
      }

      if (!wallet.isConnected) {
        throw createError(400, 'Cannot set disconnected wallet as default');
      }

      // Update user's default wallet
      const user = await User.findById(userId);
      user.defaultWalletId = walletId;
      await user.save();

      logger.info(`Default wallet set for user ${userId}: ${wallet.address}`);

      res.json({
        success: true,
        message: 'Default wallet updated successfully',
        data: { walletId }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateWalletName(req, res, next) {
    try {
      const { walletId } = req.params;
      const { name } = req.body;
      const userId = req.user._id;

      if (!name || name.trim().length === 0) {
        throw createError(400, 'Wallet name is required');
      }

      const wallet = await Wallet.findOne({ 
        _id: walletId, 
        userId 
      });

      if (!wallet) {
        throw createError(404, 'Wallet not found');
      }

      wallet.name = name.trim();
      await wallet.save();

      res.json({
        success: true,
        message: 'Wallet name updated successfully',
        data: { wallet }
      });
    } catch (error) {
      next(error);
    }
  }

  async syncWallet(req, res, next) {
    try {
      const { walletId } = req.params;
      const userId = req.user._id;

      const wallet = await Wallet.findOne({ 
        _id: walletId, 
        userId 
      });

      if (!wallet) {
        throw createError(404, 'Wallet not found');
      }

      if (!wallet.isConnected) {
        throw createError(400, 'Cannot sync disconnected wallet');
      }

      // Get fresh data from blockchain
      const aptBalance = await aptosService.getAccountBalance(wallet.address);
      const tokenBalances = await aptosService.getAllTokenBalances(wallet.address);
      const accountInfo = await aptosService.getAccountInfo(wallet.address);

      // Update wallet data
      wallet.aptBalance = aptBalance;
      wallet.tokenBalances = tokenBalances;
      wallet.sequenceNumber = accountInfo?.sequence_number || wallet.sequenceNumber;
      wallet.lastSyncAt = new Date();
      await wallet.save();

      logger.info(`Wallet synced for user ${userId}: ${wallet.address}`);

      res.json({
        success: true,
        message: 'Wallet synced successfully',
        data: { wallet }
      });
    } catch (error) {
      next(error);
    }
  }

  async getBalance(req, res, next) {
    try {
      const { walletId } = req.params;
      const userId = req.user._id;

      const wallet = await Wallet.findOne({ 
        _id: walletId, 
        userId 
      });

      if (!wallet) {
        throw createError(404, 'Wallet not found');
      }

      res.json({
        success: true,
        data: {
          aptBalance: wallet.aptBalance,
          tokenBalances: wallet.tokenBalances,
          lastUpdated: wallet.lastSyncAt
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getTokenBalances(req, res, next) {
    try {
      const { walletId } = req.params;
      const userId = req.user._id;

      const wallet = await Wallet.findOne({ 
        _id: walletId, 
        userId 
      });

      if (!wallet) {
        throw createError(404, 'Wallet not found');
      }

      // Convert tokenBalances Map to array
      const tokenBalancesArray = Array.from(wallet.tokenBalances.entries()).map(([tokenAddress, data]) => ({
        tokenAddress,
        ...data
      }));

      res.json({
        success: true,
        data: {
          tokens: tokenBalancesArray,
          totalTokens: tokenBalancesArray.length
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionHistory(req, res, next) {
    try {
      const { walletId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const userId = req.user._id;

      const wallet = await Wallet.findOne({ 
        _id: walletId, 
        userId 
      });

      if (!wallet) {
        throw createError(404, 'Wallet not found');
      }

      const { SwapTransaction } = require('../models/SwapTransaction.model');
      
      const transactions = await SwapTransaction.find({ 
        walletAddress: wallet.address 
      })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await SwapTransaction.countDocuments({ 
        walletAddress: wallet.address 
      });

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

  async validateAddress(req, res, next) {
    try {
      const { address } = req.params;
      
      const isValid = aptosService.validateAddress(address);
      
      res.json({
        success: true,
        data: {
          address,
          isValid,
          format: 'Aptos'
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getAccountInfo(req, res, next) {
    try {
      const { address } = req.params;
      
      if (!aptosService.validateAddress(address)) {
        throw createError(400, 'Invalid Aptos address format');
      }

      const accountInfo = await aptosService.getAccountInfo(address);
      
      res.json({
        success: true,
        data: { accountInfo }
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBalance(req, res, next) {
    try {
      const { walletId } = req.params;
      const userId = req.user._id;

      const wallet = await Wallet.findOne({ 
        _id: walletId, 
        userId 
      });

      if (!wallet) {
        throw createError(404, 'Wallet not found');
      }

      if (!wallet.isConnected) {
        throw createError(400, 'Cannot update disconnected wallet');
      }

      // Sync with blockchain
      const aptBalance = await aptosService.getAccountBalance(wallet.address);
      const tokenBalances = await aptosService.getAllTokenBalances(wallet.address);

      wallet.aptBalance = aptBalance;
      wallet.tokenBalances = tokenBalances;
      wallet.lastSyncAt = new Date();
      await wallet.save();

      res.json({
        success: true,
        message: 'Balance updated successfully',
        data: { wallet }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { WalletController };
