const { Wallet } = require('../models/Wallet.model');
const { createError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

class WalletService {
  async getWalletByUserId(userId) {
    try {
      return await Wallet.findOne({ userId });
    } catch (error) {
      logger.error(`Failed to get wallet for user ${userId}:`, error);
      return null;
    }
  }

  async connectWallet(userId, address, publicKey, chainId = 'aptos-testnet') {
    try {
      // Check if wallet already exists for another user
      const existingWallet = await Wallet.findOne({ address });
      if (existingWallet && existingWallet.userId.toString() !== userId) {
        throw createError(400, 'Wallet is already connected to another user');
      }

      let wallet = await Wallet.findOne({ userId });

      if (wallet) {
        // Update existing wallet
        wallet.address = address;
        wallet.publicKey = publicKey;
        wallet.chainId = chainId;
        wallet.isConnected = true;
        await wallet.save();
      } else {
        // Create new wallet
        wallet = new Wallet({
          userId,
          address,
          publicKey,
          chainId,
          isConnected: true,
          balance: 0,
        });
        await wallet.save();
      }

      logger.info(`Wallet connected for user ${userId}: ${address}`);
      return wallet;
    } catch (error) {
      logger.error(`Failed to connect wallet for user ${userId}:`, error);
      throw error;
    }
  }

  async disconnectWallet(userId) {
    try {
      const wallet = await Wallet.findOneAndUpdate(
        { userId },
        { isConnected: false },
        { new: true }
      );

      if (wallet) {
        logger.info(`Wallet disconnected for user ${userId}`);
      }
      
      return wallet;
    } catch (error) {
      logger.error(`Failed to disconnect wallet for user ${userId}:`, error);
      throw error;
    }
  }

  async updateBalance(userId, newBalance) {
    try {
      const wallet = await Wallet.findOneAndUpdate(
        { userId },
        { balance: newBalance, lastSyncAt: new Date() },
        { new: true }
      );

      if (wallet) {
        logger.info(`Balance updated for user ${userId}: ${newBalance}`);
      }
      
      return wallet;
    } catch (error) {
      logger.error(`Failed to update balance for user ${userId}:`, error);
      throw error;
    }
  }

  async getWalletsByChainId(chainId) {
    try {
      return await Wallet.find({ chainId, isConnected: true });
    } catch (error) {
      logger.error(`Failed to get wallets for chain ${chainId}:`, error);
      return [];
    }
  }

  async getWalletBalance(address) {
    try {
      // TODO: Implement actual blockchain balance fetching
      // For now return mock data
      const mockBalance = {
        APT: parseFloat((Math.random() * 100).toFixed(6)),
        USDC: parseFloat((Math.random() * 1000).toFixed(6)),
        USDT: parseFloat((Math.random() * 1000).toFixed(6))
      };

      logger.debug(`Mock balance for ${address}:`, mockBalance);
      return mockBalance;
    } catch (error) {
      logger.error(`Failed to get balance for address ${address}:`, error);
      throw error;
    }
  }

  async validateWalletAddress(address) {
    try {
      // Basic validation for Aptos address format
      if (!address || typeof address !== 'string') {
        return false;
      }

      // Aptos addresses are typically 64 characters (32 bytes) hex string with 0x prefix
      const aptosAddressRegex = /^0x[a-fA-F0-9]{64}$|^0x[a-fA-F0-9]{1,63}$/;
      
      return aptosAddressRegex.test(address);
    } catch (error) {
      logger.error(`Failed to validate address ${address}:`, error);
      return false;
    }
  }

  async getAllWallets(page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;
      
      const wallets = await Wallet.find()
        .populate('userId', 'email name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Wallet.countDocuments();

      return {
        wallets,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasMore: skip + wallets.length < total
        }
      };
    } catch (error) {
      logger.error('Failed to get all wallets:', error);
      throw error;
    }
  }

  async getWalletStats() {
    try {
      const stats = await Wallet.aggregate([
        {
          $group: {
            _id: null,
            totalWallets: { $sum: 1 },
            connectedWallets: {
              $sum: { $cond: [{ $eq: ['$isConnected', true] }, 1, 0] }
            },
            totalBalance: { $sum: '$balance' },
            avgBalance: { $avg: '$balance' }
          }
        }
      ]);

      return stats[0] || {
        totalWallets: 0,
        connectedWallets: 0,
        totalBalance: 0,
        avgBalance: 0
      };
    } catch (error) {
      logger.error('Failed to get wallet stats:', error);
      throw error;
    }
  }
}

module.exports = { WalletService };
