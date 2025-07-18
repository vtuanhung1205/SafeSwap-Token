const { User } = require('../models/User.model');
const { AuthService } = require('../services/auth.service');
const { createError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const authService = new AuthService();

class AuthController {
  async register(req, res, next) {
    try {
      const { email, name, password } = req.body;

      // Validation
      if (!email || !password) {
        throw createError(400, 'Email and password are required');
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw createError(409, 'User with this email already exists');
      }

      // Create new user
      const user = new User({
        email,
        name,
        password,
      });

      await user.save();

      // Generate tokens
      const tokens = authService.generateTokens(user._id);

      logger.info(`User registered successfully: ${email}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: user.toJSON(),
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        throw createError(400, 'Email and password are required');
      }

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        throw createError(401, 'Invalid email or password');
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        throw createError(401, 'Invalid email or password');
      }

      // Generate tokens
      const tokens = authService.generateTokens(user._id);

      logger.info(`User logged in successfully: ${email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async googleAuth(req, res, next) {
    try {
      const { googleId, email, name, avatar } = req.body;

      if (!googleId || !email) {
        throw createError(400, 'Google ID and email are required');
      }

      let user = await User.findOne({ $or: [{ googleId }, { email }] });

      if (!user) {
        // Create new user from Google
        user = new User({
          googleId,
          email,
          name,
          avatar,
          isVerified: true,
        });
        await user.save();
        logger.info(`New Google user created: ${email}`);
      } else if (!user.googleId) {
        // Link existing user with Google
        user.googleId = googleId;
        user.avatar = avatar || user.avatar;
        user.isVerified = true;
        await user.save();
        logger.info(`Google linked to existing user: ${email}`);
      }

      // Generate tokens
      const tokens = authService.generateTokens(user._id);

      res.json({
        success: true,
        message: 'Google authentication successful',
        data: {
          user: user.toJSON(),
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw createError(400, 'Refresh token is required');
      }

      const decoded = authService.verifyToken(refreshToken, 'refresh');
      const tokens = authService.generateTokens(decoded.id);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: { tokens },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.userId);
      
      if (!user) {
        throw createError(404, 'User not found');
      }

      res.json({
        success: true,
        data: { user: user.toJSON() },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { name, avatar } = req.body;
      const updateData = {};

      if (name) updateData.name = name;
      if (avatar) updateData.avatar = avatar;

      const user = await User.findByIdAndUpdate(
        req.userId,
        updateData,
        { new: true, runValidators: true }
      );

      if (!user) {
        throw createError(404, 'User not found');
      }

      logger.info(`User profile updated: ${user.email}`);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: user.toJSON() },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      // In a stateless JWT system, logout is handled client-side
      // But we can log the action
      logger.info(`User logged out: ${req.userId}`);

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async validateToken(req, res, next) {
    try {
      // The verifyToken middleware already handles validation
      // If it passes, req.user will be set
      res.json({
        success: true,
        message: 'Token is valid',
        data: {
          user: req.user.toJSON(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      await authService.sendPasswordResetEmail(email);
      res.json({
        success: true,
        message: 'Password reset email sent successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);
      res.json({
        success: true,
        message: 'Password has been reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { AuthController };
