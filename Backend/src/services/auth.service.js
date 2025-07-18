const jwt = require('jsonwebtoken');
const { User } = require('../models/User.model');
const { createError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_change_in_production';
    this.jwtRefreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  async validateUser(email, password) {
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return null;
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return null;
      }

      return user;
    } catch (error) {
      logger.error('User validation failed:', error);
      return null;
    }
  }

  generateTokens(userId) {
    try {
      const payload = { id: userId };
      
      // Generate access token
      const accessToken = jwt.sign(
        payload,
        this.jwtSecret,
        { 
          expiresIn: this.jwtExpiresIn,
          issuer: 'SafeSwap',
          audience: 'SafeSwap-Users'
        }
      );
      
      // Generate refresh token
      const refreshToken = jwt.sign(
        payload,
        this.jwtRefreshSecret,
        { 
          expiresIn: this.jwtRefreshExpiresIn,
          issuer: 'SafeSwap',
          audience: 'SafeSwap-Users'
        }
      );

      return { accessToken, refreshToken };
    } catch (error) {
      logger.error('Token generation failed:', error);
      throw createError(500, 'Token generation failed');
    }
  }

  verifyToken(token, isRefreshToken = false) {
    try {
      const secret = isRefreshToken ? this.jwtRefreshSecret : this.jwtSecret;
      const decoded = jwt.verify(token, secret, {
        issuer: 'SafeSwap',
        audience: 'SafeSwap-Users'
      });
      
      return decoded;
    } catch (error) {
      logger.error('Token verification failed:', error);
      throw createError(401, 'Invalid or expired token');
    }
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
        // Update existing user with Google ID if not present
        if (!existingUser.googleId) {
          existingUser.googleId = googleId;
          await existingUser.save();
        }
        return existingUser;
      }

      // Create new user
      const newUser = new User({
        email,
        name: displayName || 'Google User',
        avatar: photoUrl,
        googleId,
        isVerified: true, // Google accounts are considered verified
      });

      await newUser.save();
      logger.info(`New user created via Google OAuth: ${newUser.email}`);
      
      return newUser;
    } catch (error) {
      logger.error('Failed to create user from Google profile:', error);
      if (error.statusCode) {
        throw error;
      }
      throw createError(500, 'Failed to create user from Google profile');
    }
  }

  async createUser(userData) {
    try {
      const { email, name, avatar } = userData;

      if (!email || !name) {
        throw createError(400, 'Email and name are required');
      }

      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        throw createError(400, 'User with this email already exists');
      }

      const newUser = new User({
        email,
        name,
        avatar,
        isVerified: false,
      });

      await newUser.save();
      logger.info(`New user created: ${newUser.email}`);
      
      return newUser;
    } catch (error) {
      logger.error('Failed to create user:', error);
      if (error.statusCode) {
        throw error;
      }
      throw createError(500, 'Failed to create user');
    }
  }

  async getUserById(userId) {
    try {
      if (!userId) {
        return null;
      }

      const user = await User.findById(userId).select('-__v');
      return user;
    } catch (error) {
      logger.error(`Failed to get user by ID ${userId}:`, error);
      return null;
    }
  }

  async getUserByEmail(email) {
    try {
      if (!email) {
        return null;
      }

      const user = await User.findOne({ email }).select('-__v');
      return user;
    } catch (error) {
      logger.error(`Failed to get user by email ${email}:`, error);
      return null;
    }
  }

  async updateUserWallet(userId, walletAddress) {
    try {
      if (!userId || !walletAddress) {
        throw createError(400, 'User ID and wallet address are required');
      }

      const user = await User.findByIdAndUpdate(
        userId,
        { walletAddress },
        { new: true, runValidators: true }
      ).select('-__v');

      if (!user) {
        throw createError(404, 'User not found');
      }

      logger.info(`User ${userId} wallet updated: ${walletAddress}`);
      return user;
    } catch (error) {
      logger.error('Failed to update user wallet:', error);
      if (error.statusCode) {
        throw error;
      }
      throw createError(500, 'Failed to update user wallet');
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw createError(400, 'Refresh token is required');
      }

      const decoded = this.verifyToken(refreshToken, true);
      const user = await this.getUserById(decoded.id);

      if (!user) {
        throw createError(404, 'User not found');
      }

      const newTokens = this.generateTokens(user._id.toString());
      logger.info(`Access token refreshed for user: ${user.email}`);

      return newTokens;
    } catch (error) {
      logger.error('Failed to refresh access token:', error);
      if (error.statusCode) {
        throw error;
      }
      throw createError(401, 'Invalid refresh token');
    }
  }

  async validateTokenAndGetUser(token) {
    try {
      if (!token) {
        throw createError(401, 'Token is required');
      }

      const decoded = this.verifyToken(token);
      const user = await this.getUserById(decoded.id);

      if (!user) {
        throw createError(404, 'User not found');
      }

      return user;
    } catch (error) {
      logger.error('Token validation failed:', error);
      if (error.statusCode) {
        throw error;
      }
      throw createError(401, 'Invalid token');
    }
  }

  async revokeUserTokens(userId) {
    try {
      // In a production environment, you would typically:
      // 1. Add tokens to a blacklist
      // 2. Update user's token version
      // 3. Use Redis to store blacklisted tokens
      
      // For now, we'll just log the action
      logger.info(`Tokens revoked for user: ${userId}`);
      return true;
    } catch (error) {
      logger.error('Failed to revoke user tokens:', error);
      return false;
    }
  }
}

module.exports = { AuthService };
