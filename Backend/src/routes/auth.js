const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const User = require('../models/User');
const { auth, optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Google OAuth verification
const verifyGoogleToken = async (token) => {
  try {
    // Try to verify as ID token first
    try {
      const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
      return response.data;
    } catch (error) {
      // If ID token verification fails, try access token
      logger.debug('ID token verification failed, trying access token...');
    }
    
    // Verify as access token
    const response = await axios.get(`https://oauth2.googleapis.com/tokeninfo?access_token=${token}`);
    return response.data;
  } catch (error) {
    logger.error('Google token verification failed:', error);
    throw new Error('Google authentication failed');
  }
};

// @route   POST /api/auth/google
// @desc    Google OAuth login/register
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { idToken, accessToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        error: 'Google ID token is required'
      });
    }

    // Verify Google token
    const googleUser = await verifyGoogleToken(idToken);
    
    // Check if user exists
    let user = await User.findOne({ email: googleUser.email });
    
    if (!user) {
      // Create new user
      user = new User({
        email: googleUser.email,
        profile: {
          firstName: googleUser.given_name || '',
          lastName: googleUser.family_name || '',
          displayName: googleUser.name || '',
          avatar: googleUser.picture || ''
        },
        authProvider: 'google',
        googleId: googleUser.sub,
        isEmailVerified: googleUser.email_verified || false,
        accountStatus: 'active'
      });
      
      await user.save();
      logger.info(`New Google user registered: ${user.email}`);
    } else {
      // Update existing user's Google info
      user.googleId = googleUser.sub;
      user.authProvider = 'google';
      user.profile.avatar = googleUser.picture || user.profile.avatar;
      user.isEmailVerified = googleUser.email_verified || user.isEmailVerified;
      
      await user.save();
      logger.info(`Existing user logged in via Google: ${user.email}`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Update user stats
    await user.updateStats('login');

    res.json({
      success: true,
      message: 'Google authentication successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          walletAddress: user.walletAddress,
          walletType: user.walletType,
          accountStatus: user.accountStatus,
          isEmailVerified: user.isEmailVerified,
          authProvider: user.authProvider
        },
        token
      }
    });
  } catch (error) {
    logger.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      error: 'Google authentication failed'
    });
  }
});

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password, firstName, lastName, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      });
    }

    // Create new user
    const user = new User({
      email,
      password,
      profile: {
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`
      },
      authProvider: 'email',
      referralCode: referralCode || null
    });

    await user.save();
    logger.info(`New user registered: ${user.email}`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          walletAddress: user.walletAddress,
          walletType: user.walletType,
          accountStatus: user.accountStatus,
          isEmailVerified: user.isEmailVerified,
          authProvider: user.authProvider
        },
        token
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if user uses Google auth
    if (user.authProvider === 'google') {
      return res.status(401).json({
        success: false,
        error: 'Please use Google to sign in'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check account status
    if (user.accountStatus !== 'active') {
      return res.status(403).json({
        success: false,
        error: 'Account is not active'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Update user stats
    await user.updateStats('login');

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          profile: user.profile,
          walletAddress: user.walletAddress,
          walletType: user.walletType,
          accountStatus: user.accountStatus,
          isEmailVerified: user.isEmailVerified,
          authProvider: user.authProvider
        },
        token
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        walletAddress: user.walletAddress,
        walletType: user.walletType,
        accountStatus: user.accountStatus,
        isEmailVerified: user.isEmailVerified,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, [
  body('firstName').optional().trim().notEmpty(),
  body('lastName').optional().trim().notEmpty(),
  body('displayName').optional().trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update profile fields
    if (req.body.firstName) user.profile.firstName = req.body.firstName;
    if (req.body.lastName) user.profile.lastName = req.body.lastName;
    if (req.body.displayName) user.profile.displayName = req.body.displayName;

    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        walletAddress: user.walletAddress,
        walletType: user.walletType,
        accountStatus: user.accountStatus,
        isEmailVerified: user.isEmailVerified,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    });
  }
});

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user uses Google auth
    if (user.authProvider === 'google') {
      return res.status(400).json({
        success: false,
        error: 'Password change not available for Google users'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

// @route   POST /api/auth/connect-wallet
// @desc    Connect wallet to user account
// @access  Private
router.post('/connect-wallet', auth, [
  body('walletAddress').notEmpty(),
  body('walletType').optional().isIn(['petra', 'martian', 'pontem', 'fewcha', 'nightly', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { walletAddress, walletType = 'other' } = req.body;

    // Use walletService to handle wallet connection
    const walletService = require('../services/walletService');
    const result = await walletService.connectWallet(req.user.userId, walletAddress, walletType);

    res.json({
      success: true,
      data: result.wallet,
      message: 'Wallet connected successfully'
    });
  } catch (error) {
    logger.error('Connect wallet error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to connect wallet'
    });
  }
});

// @route   DELETE /api/auth/disconnect-wallet
// @desc    Disconnect wallet from user account
// @access  Private
router.delete('/disconnect-wallet', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Remove wallet info
    user.walletAddress = null;
    user.walletType = 'other';
    await user.save();

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        profile: user.profile,
        walletAddress: user.walletAddress,
        walletType: user.walletType,
        accountStatus: user.accountStatus,
        isEmailVerified: user.isEmailVerified,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    logger.error('Disconnect wallet error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to disconnect wallet'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {
    // In JWT-based auth, logout is handled client-side
    // But we can log the logout event
    const user = await User.findById(req.user.userId);
    if (user) {
      await user.updateStats('logout');
      logger.info(`User logged out: ${user.email}`);
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate new token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token'
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent'
      });
    }

    // Check if user uses Google auth
    if (user.authProvider === 'google') {
      return res.status(400).json({
        success: false,
        error: 'Password reset not available for Google users'
      });
    }

    // TODO: Implement password reset email sending
    // For now, just return success
    res.json({
      success: true,
      message: 'Password reset instructions sent to your email'
    });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset'
    });
  }
});

module.exports = router; 