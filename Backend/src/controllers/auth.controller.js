const { User } = require('../models/User.model');
const { AuthService } = require('../services/auth.service');
const { createError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const authService = new AuthService();

class AuthController {
  async googleAuth(req, res, next) {
    try {
      const { googleId, email, name, avatar } = req.body;

      if (!googleId || !email) {
        throw createError(400, 'Google ID and email are required');
      }

      // Create or update user from Google profile
      const user = await authService.createUserFromGoogle({
        id: googleId,
        emails: [{ value: email }],
        displayName: name,
        photos: [{ value: avatar }]
      });

      // Create session
      const sessionId = authService.createSession(user);

      // Set session cookie
      res.cookie('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', // Changed from 'strict' to 'lax' for cross-origin
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      logger.info(`Google OAuth successful for user: ${email}, sessionId: ${sessionId}`);

      res.json({
        success: true,
        message: 'Google authentication successful',
        data: {
          user: user.toJSON(),
          sessionId
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
      
      if (!sessionId) {
        throw createError(401, 'No session found');
      }

      const session = authService.getSession(sessionId);
      if (!session) {
        throw createError(401, 'Invalid or expired session');
      }

      const user = await authService.getUserById(session.userId);
      if (!user) {
        throw createError(404, 'User not found');
      }

      res.json({
        success: true,
        data: {
          user: user.toJSON(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
      
      if (!sessionId) {
        throw createError(401, 'No session found');
      }

      const session = authService.getSession(sessionId);
      if (!session) {
        throw createError(401, 'Invalid or expired session');
      }

      const { name, avatar } = req.body;
      const user = await User.findById(session.userId);
      
      if (!user) {
        throw createError(404, 'User not found');
      }

      // Update user fields
      if (name) user.name = name;
      if (avatar) user.avatar = avatar;

      await user.save();

      logger.info(`Profile updated for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: user.toJSON(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
      
      if (sessionId) {
        authService.removeSession(sessionId);
      }

      // Clear session cookie
      res.clearCookie('sessionId');

      logger.info('User logged out successfully');

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  async validateSession(req, res, next) {
    try {
      const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
      
      if (!sessionId) {
        return res.status(401).json({
          success: false,
          message: 'No session found',
          data: null
        });
      }

      const session = authService.getSession(sessionId);
      if (!session) {
        return res.status(401).json({
          success: false,
          message: 'Invalid or expired session',
          data: null
        });
      }

      const user = await authService.getUserById(session.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          data: null
        });
      }

      res.json({
        success: true,
        message: 'Session is valid',
        data: {
          user: user.toJSON(),
          session: {
            id: sessionId,
            createdAt: session.createdAt,
            lastActivity: session.lastActivity
          }
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getAuthStatus(req, res, next) {
    try {
      const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
      
      if (!sessionId) {
        return res.json({
          success: true,
          data: {
            isAuthenticated: false,
            user: null
          }
        });
      }

      const session = authService.getSession(sessionId);
      if (!session) {
        return res.json({
          success: true,
          data: {
            isAuthenticated: false,
            user: null
          }
        });
      }

      const user = await authService.getUserById(session.userId);
      if (!user) {
        return res.json({
          success: true,
          data: {
            isAuthenticated: false,
            user: null
          }
        });
      }

      res.json({
        success: true,
        data: {
          isAuthenticated: true,
          user: user.toJSON()
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { AuthController };
