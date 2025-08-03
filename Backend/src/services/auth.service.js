const { User } = require('../models/User.model');
const { Session } = require('../models/Session.model');
const { createError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

class AuthService {
  constructor() {
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
      
      logger.info(`New user created via Google OAuth: ${email}`);
      return newUser;
    } catch (error) {
      logger.error('Failed to create user from Google profile:', error);
      throw error;
    }
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
