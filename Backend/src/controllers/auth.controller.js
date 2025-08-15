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
      const { access_token, user: googleUser, googleId, email, name, picture } = req.body;

      // Validate required fields
      if (!access_token) {
        throw createError(400, 'Google access token is required');
      }

      // Extract user info from Google user object or direct fields
      const userEmail = email || googleUser?.email;
      const userName = name || googleUser?.name;
      const userPicture = picture || googleUser?.picture;
      const userGoogleId = googleId || googleUser?.sub;

      if (!userEmail) {
        throw createError(400, 'Email is required from Google OAuth');
      }

      // Find existing user by Google ID or email
      let user = await User.findOne({ 
        $or: [
          { googleId: userGoogleId }, 
          { email: userEmail }
        ] 
      });

      if (!user) {
        // Create new user from Google
        user = new User({
          googleId: userGoogleId,
          email: userEmail,
          name: userName,
          avatar: userPicture,
          isVerified: true,
        });
        await user.save();
        logger.info(`New Google user created: ${userEmail}`);
      } else if (!user.googleId) {
        // Link existing user with Google
        user.googleId = userGoogleId;
        user.avatar = userPicture || user.avatar;
        user.isVerified = true;
        await user.save();
        logger.info(`Google linked to existing user: ${userEmail}`);
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

  async aptosConnectAuth(req, res, next) {
    try {
      const { addressString, publicKeyString, walletType, network } = req.body;

      // Validate required fields
      if (!addressString || !publicKeyString) {
        throw createError(400, 'Wallet addressString and publicKeyString are required');
      }

      // Find existing user by wallet address
      let user = await User.findOne({ 
        $or: [
          { walletAddress: addressString }, 
          { 'wallets.address': addressString }
        ] 
      });

      if (!user) {
        // Create new user from Aptos wallet
        user = new User({
          walletAddress: addressString,
          wallets: [{
            address: addressString,
            publicKey: publicKeyString,
            type: walletType || 'aptos',
            network: network || 'mainnet',
            isConnected: true
          }],
          isVerified: true,
          name: `Aptos User ${addressString.slice(0, 6)}...${addressString.slice(-4)}`
        });
        await user.save();
        logger.info(`New Aptos Connect user created: ${addressString}`);
      } else {
        // Update existing user's wallet info
        const existingWallet = user.wallets.find(w => w.address === addressString);
        if (existingWallet) {
          existingWallet.publicKey = publicKeyString;
          existingWallet.isConnected = true;
          existingWallet.lastConnected = new Date();
        } else {
          user.wallets.push({
            address: addressString,
            publicKey: publicKeyString,
            type: walletType || 'aptos',
            network: network || 'mainnet',
            isConnected: true
          });
        }
        await user.save();
        logger.info(`Aptos Connect login for existing user: ${addressString}`);
      }

      // Generate tokens
      const tokens = authService.generateTokens(user._id);

      res.json({
        success: true,
        message: 'Aptos Connect authentication successful',
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
        data: user.toJSON(),
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
        data: user.toJSON(),
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
