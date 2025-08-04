const { Wallet } = require('../models/Wallet.model');
const { AptosBlockchainService } = require('./aptosBlockchain.service');
const { logger } = require('../utils/logger');

class WalletService {
  constructor() {
    this.aptosService = new AptosBlockchainService();
  }

  async createWallet(userId, walletData) {
    try {
      const {
        address,
        publicKey,
        name,
        description = '',
        walletType = 'custom',
        category = 'personal',
        chainId = 'aptos-testnet'
      } = walletData;

      // Validate address
      if (!this.aptosService.validateAddress(address)) {
        throw new Error('Invalid Aptos address format');
      }

      // Check if wallet already exists for this user
      const existingWallet = await Wallet.findByUserAndAddress(userId, address);
      if (existingWallet) {
        throw new Error('Wallet already exists for this user');
      }

      // Check if wallet is used by another user
      const walletUsedByOther = await Wallet.findOne({ address, isConnected: true });
      if (walletUsedByOther) {
        throw new Error('This wallet is already connected to another account');
      }

      // Get blockchain data
      let accountInfo, aptBalance, tokenBalances;
      try {
        accountInfo = await this.aptosService.getAccountInfo(address);
        aptBalance = await this.aptosService.getAccountBalance(address);
        tokenBalances = await this.aptosService.getAllTokenBalances(address);
      } catch (error) {
        logger.warn(`Failed to get blockchain data for ${address}:`, error.message);
        aptBalance = 0;
        tokenBalances = {};
      }

      // Check if this is the first wallet
      const userWalletCount = await Wallet.getWalletCount(userId);
      const isFirstWallet = userWalletCount === 0;

      // Create wallet
      const wallet = new Wallet({
        userId,
        address,
        publicKey,
        name,
        description,
        walletType,
        category,
        isDefault: isFirstWallet,
        priority: isFirstWallet ? 100 : 0,
        chainId,
        aptBalance,
        tokenBalances,
        isConnected: true,
        lastSyncAt: new Date(),
        sequenceNumber: accountInfo?.sequence_number || 0,
        authenticationKey: accountInfo?.authentication_key || publicKey,
        accountType: 'user_created',
        security: {
          requireConfirmation: true,
          confirmationThreshold: 100,
          dailyLimit: 1000,
          dailyTransactions: 0,
          lastTransactionDate: new Date()
        },
        permissions: {
          canSwap: true,
          canTransfer: true,
          canStake: false,
          canVote: false
        },
        metadata: {
          source: 'user_created',
          tags: ['connected'],
          color: '#3B82F6',
          notes: '',
          category
        }
      });

      await wallet.save();

      logger.info(`Wallet created for user ${userId}: ${address}`);
      return wallet;
    } catch (error) {
      logger.error('Failed to create wallet:', error);
      throw error;
    }
  }

  async getUserWallets(userId, options = {}) {
    try {
      const {
        includeDisconnected = false,
        category,
        walletType,
        limit = 50,
        offset = 0
      } = options;

      let query = { userId };
      
      if (!includeDisconnected) {
        query.isConnected = true;
      }

      if (category) {
        query['metadata.category'] = category;
      }

      if (walletType) {
        query.walletType = walletType;
      }

      const wallets = await Wallet.find(query)
        .sort({ priority: -1, lastSyncAt: -1 })
        .limit(limit)
        .skip(offset);

      return wallets;
    } catch (error) {
      logger.error('Failed to get user wallets:', error);
      throw error;
    }
  }

  async getWalletStats(userId) {
    try {
      const [
        totalWallets,
        connectedWallets,
        defaultWallet,
        walletsByType,
        walletsByCategory,
        totalBalance
      ] = await Promise.all([
        Wallet.getWalletCount(userId),
        Wallet.getConnectedWallets(userId),
        Wallet.getDefaultWallet(userId),
        Wallet.aggregate([
          { $match: { userId: userId } },
          { $group: { _id: '$walletType', count: { $sum: 1 } } }
        ]),
        Wallet.aggregate([
          { $match: { userId: userId } },
          { $group: { _id: '$metadata.category', count: { $sum: 1 } } }
        ]),
        Wallet.aggregate([
          { $match: { userId: userId, isConnected: true } },
          { $group: { _id: null, totalApt: { $sum: '$aptBalance' } } }
        ])
      ]);

      return {
        totalWallets,
        connectedWallets: connectedWallets.length,
        defaultWallet,
        walletsByType,
        walletsByCategory,
        totalBalance: totalBalance[0]?.totalApt || 0
      };
    } catch (error) {
      logger.error('Failed to get wallet stats:', error);
      throw error;
    }
  }

  async setDefaultWallet(userId, walletId) {
    try {
      const wallet = await Wallet.validateOwnership(walletId, userId);
      if (!wallet) {
        throw new Error('Wallet not found or access denied');
      }

      if (!wallet.isConnected) {
        throw new Error('Cannot set disconnected wallet as default');
      }

      await wallet.setAsDefault();

      // Update user's default wallet reference
      const { User } = require('../models/User.model');
      await User.findByIdAndUpdate(userId, { defaultWalletId: wallet._id });

      logger.info(`Default wallet set for user ${userId}: ${wallet.address}`);
      return wallet;
    } catch (error) {
      logger.error('Failed to set default wallet:', error);
      throw error;
    }
  }

  async updateWalletPriority(userId, walletId, priority) {
    try {
      const wallet = await Wallet.validateOwnership(walletId, userId);
      if (!wallet) {
        throw new Error('Wallet not found or access denied');
      }

      await wallet.updatePriority(priority);
      return wallet;
    } catch (error) {
      logger.error('Failed to update wallet priority:', error);
      throw error;
    }
  }

  async syncWallet(userId, walletId) {
    try {
      const wallet = await Wallet.validateOwnership(walletId, userId);
      if (!wallet) {
        throw new Error('Wallet not found or access denied');
      }

      if (!wallet.isConnected) {
        throw new Error('Cannot sync disconnected wallet');
      }

      // Get fresh data from blockchain
      const aptBalance = await this.aptosService.getAccountBalance(wallet.address);
      const tokenBalances = await this.aptosService.getAllTokenBalances(wallet.address);
      const accountInfo = await this.aptosService.getAccountInfo(wallet.address);

      // Update wallet data
      wallet.aptBalance = aptBalance;
      wallet.tokenBalances = tokenBalances;
      wallet.sequenceNumber = accountInfo?.sequence_number || wallet.sequenceNumber;
      wallet.lastSyncAt = new Date();
      await wallet.save();

      logger.info(`Wallet synced for user ${userId}: ${wallet.address}`);
      return wallet;
    } catch (error) {
      logger.error('Failed to sync wallet:', error);
      throw error;
    }
  }

  async syncAllWallets(userId) {
    try {
      const wallets = await Wallet.getConnectedWallets(userId);
      const syncPromises = wallets.map(wallet => this.syncWallet(userId, wallet._id));
      
      const results = await Promise.allSettled(syncPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      logger.info(`Synced ${successful} wallets, ${failed} failed for user ${userId}`);
      
      return {
        total: wallets.length,
        successful,
        failed,
        results: results.map((r, i) => ({
          walletId: wallets[i]._id,
          success: r.status === 'fulfilled',
          error: r.status === 'rejected' ? r.reason.message : null
        }))
      };
    } catch (error) {
      logger.error('Failed to sync all wallets:', error);
      throw error;
    }
  }

  async disconnectWallet(userId, walletId) {
    try {
      const wallet = await Wallet.validateOwnership(walletId, userId);
      if (!wallet) {
        throw new Error('Wallet not found or access denied');
      }

      await wallet.disconnect();

      // If this was the default wallet, clear the default
      if (wallet.isDefault) {
        const { User } = require('../models/User.model');
        await User.findByIdAndUpdate(userId, { $unset: { defaultWalletId: 1 } });
      }

      logger.info(`Wallet disconnected for user ${userId}: ${wallet.address}`);
      return wallet;
    } catch (error) {
      logger.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }

  async deleteWallet(userId, walletId) {
    try {
      const wallet = await Wallet.validateOwnership(walletId, userId);
      if (!wallet) {
        throw new Error('Wallet not found or access denied');
      }

      // Check if this is the only wallet
      const walletCount = await Wallet.getWalletCount(userId);
      if (walletCount === 1) {
        throw new Error('Cannot delete the only wallet. Please connect another wallet first.');
      }

      // If this was the default wallet, set another wallet as default
      if (wallet.isDefault) {
        const otherWallet = await Wallet.findOne({ userId, _id: { $ne: walletId } });
        if (otherWallet) {
          await this.setDefaultWallet(userId, otherWallet._id);
        }
      }

      await Wallet.findByIdAndDelete(walletId);

      logger.info(`Wallet deleted for user ${userId}: ${wallet.address}`);
      return { success: true };
    } catch (error) {
      logger.error('Failed to delete wallet:', error);
      throw error;
    }
  }
}

module.exports = { WalletService };
