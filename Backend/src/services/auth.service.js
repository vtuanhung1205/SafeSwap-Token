const { User } = require('../models/User.model');
const { Session } = require('../models/Session.model');
const { Wallet } = require('../models/Wallet.model');
const { AptosBlockchainService } = require('./aptosBlockchain.service');
const { createError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

class AuthService {
  constructor() {
    this.aptosService = new AptosBlockchainService();
    // No longer need in-memory storage
    // this.sessions = new Map();
  }

  async createUserFromGoogle(googleProfile) {
    try {
      const email = googleProfile.emails?.[0]?.value;
      const displayName = googleProfile.displayName;
      const photoUrl = googleProfile.photos?.[0]?.value;
      const googleId = googleProfile.id;

      if (!email) {
        throw createError(400, 'Google profile missing email');
      }

      const existingUser = await User.findOne({ 
        $or: [
          { email },
          { googleId }
        ]
      });

      if (existingUser) {
        // Update existing user with latest Google info
        existingUser.name = displayName || existingUser.name;
        existingUser.avatar = photoUrl || existingUser.avatar;
        existingUser.googleId = googleId;
        await existingUser.save();
        
        logger.info(`Existing user updated via Google OAuth: ${email}`);
        return existingUser;
      }

      // Create new user
      const newUser = new User({
        email,
        name: displayName,
        avatar: photoUrl,
        googleId,
        isVerified: true, // Google users are pre-verified
      });

      await newUser.save();
      
      // Auto-create wallet for new Google users
      await this.autoCreateWalletForGoogleUser(newUser);
      
      logger.info(`New user created via Google OAuth: ${email}`);
      return newUser;
    } catch (error) {
      logger.error('Failed to create user from Google profile:', error);
      throw error;
    }
  }

  async autoCreateWalletForGoogleUser(user) {
    try {
      // Check if user already has a wallet
      const existingWallet = await Wallet.findOne({ userId: user._id });
      if (existingWallet) {
        logger.info(`User ${user.email} already has wallet: ${existingWallet.address}`);
        return existingWallet;
      }

      // Generate a deterministic wallet address based on Google ID
      const walletAddress = this.generateDeterministicAddress(user.googleId);
      const publicKey = this.generateDeterministicPublicKey(user.googleId);

      // Create new wallet
      const newWallet = new Wallet({
        userId: user._id,
        address: walletAddress,
        publicKey: publicKey,
        name: `${user.name}'s Wallet`,
        description: `Auto-created wallet for ${user.email}`,
        chainId: 'aptos-testnet',
        isConnected: true,
        lastSyncAt: new Date(),
        accountType: 'google_auto_created',
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
          source: 'google_auto_created',
          tags: ['google', 'auto_created'],
          color: '#10B981',
          notes: 'Auto-created wallet for Google user'
        }
      });

      await newWallet.save();

      // Set as default wallet
      user.defaultWalletId = newWallet._id;
      await user.save();

      logger.info(`Auto-created wallet for Google user ${user.email}: ${walletAddress}`);
      return newWallet;
    } catch (error) {
      logger.error('Failed to auto-create wallet for Google user:', error);
      // Don't throw error to avoid breaking the auth flow
      return null;
    }
  }

  generateDeterministicAddress(googleId) {
    // Generate deterministic address based on Google ID
    // This is a simplified version - in production, you'd want a more secure method
    const hash = require('crypto').createHash('sha256').update(googleId + 'SALT').digest('hex');
    return '0x' + hash.substring(0, 64);
  }

  generateDeterministicPublicKey(googleId) {
    // Generate deterministic public key based on Google ID
    const hash = require('crypto').createHash('sha256').update(googleId + 'PUBLIC_KEY_SALT').digest('hex');
    return '0x' + hash.substring(0, 64);
  }

  async createSession(user, req = null) {
    try {
      const sessionId = this.generateSessionId();
      const sessionData = {
        sessionId,
        userId: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        googleId: user.googleId,
        userAgent: req?.get('User-Agent'),
        ipAddress: req?.ip,
      };

      await Session.createSession(sessionData);
      
      logger.info(`Session created for user: ${user.email}`);
      return sessionId;
    } catch (error) {
      logger.error('Failed to create session:', error);
      throw createError(500, 'Failed to create session');
    }
  }

  async getSession(sessionId) {
    try {
      const session = await Session.findBySessionId(sessionId);
      if (!session) {
        return null;
      }

      // Update last activity
      await session.updateActivity();

      return {
        userId: session.userId,
        email: session.email,
        name: session.name,
        avatar: session.avatar,
        googleId: session.googleId,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity
      };
    } catch (error) {
      logger.error('Failed to get session:', error);
      return null;
    }
  }

  async removeSession(sessionId) {
    try {
      const result = await Session.deleteOne({ sessionId });
      if (result.deletedCount > 0) {
        logger.info(`Session removed: ${sessionId}`);
      }
      return result.deletedCount > 0;
    } catch (error) {
      logger.error('Failed to remove session:', error);
      return false;
    }
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async getUserById(userId) {
    try {
      const user = await User.findById(userId);
      return user;
    } catch (error) {
      logger.error('Failed to get user by ID:', error);
      return null;
    }
  }

  async getUserByEmail(email) {
    try {
      const user = await User.findOne({ email });
      return user;
    } catch (error) {
      logger.error('Failed to get user by email:', error);
      return null;
    }
  }

  async updateUserWallet(userId, walletAddress) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw createError(404, 'User not found');
      }

      user.walletAddress = walletAddress;
      await user.save();

      logger.info(`Wallet address updated for user: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Failed to update user wallet:', error);
      throw error;
    }
  }

  getHealthStatus() {
    return {
      service: 'AuthService',
      status: 'healthy',
      // activeSessions: this.sessions.size, // This line is removed as per the new_code
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { AuthService };
