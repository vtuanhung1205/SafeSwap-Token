const { User } = require('../models/User.model');
const { createError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

class AuthService {
  constructor() {
    // Session storage for Google OAuth users
    this.sessions = new Map();
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

  createSession(user) {
    try {
      const sessionId = this.generateSessionId();
      const sessionData = {
        userId: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        googleId: user.googleId,
        createdAt: new Date(),
        lastActivity: new Date()
      };

      this.sessions.set(sessionId, sessionData);
      
      // Clean up old sessions (older than 7 days)
      this.cleanupOldSessions();
      
      logger.info(`Session created for user: ${user.email}`);
      return sessionId;
    } catch (error) {
      logger.error('Failed to create session:', error);
      throw createError(500, 'Failed to create session');
    }
  }

  getSession(sessionId) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        return null;
      }

      // Update last activity
      session.lastActivity = new Date();
      this.sessions.set(sessionId, session);

      return session;
    } catch (error) {
      logger.error('Failed to get session:', error);
      return null;
    }
  }

  removeSession(sessionId) {
    try {
      const removed = this.sessions.delete(sessionId);
      if (removed) {
        logger.info(`Session removed: ${sessionId}`);
      }
      return removed;
    } catch (error) {
      logger.error('Failed to remove session:', error);
      return false;
    }
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  cleanupOldSessions() {
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      let cleanedCount = 0;

      for (const [sessionId, session] of this.sessions.entries()) {
        if (session.lastActivity < sevenDaysAgo) {
          this.sessions.delete(sessionId);
          cleanedCount++;
        }
      }

      if (cleanedCount > 0) {
        logger.info(`Cleaned up ${cleanedCount} old sessions`);
      }
    } catch (error) {
      logger.error('Failed to cleanup old sessions:', error);
    }
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
      activeSessions: this.sessions.size,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { AuthService };
