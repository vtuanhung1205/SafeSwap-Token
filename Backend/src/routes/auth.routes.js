const express = require('express');
const { AuthController } = require('../controllers/auth.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { strictRateLimiter } = require('../middleware/rateLimiter');
const { verifyToken } = require('../middleware/auth');
const passport = require('passport');

const router = express.Router();
const authController = new AuthController();

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', strictRateLimiter, asyncHandler(authController.register.bind(authController)));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', strictRateLimiter, asyncHandler(authController.login.bind(authController)));

// @route   POST /api/auth/wallet-login
// @desc    Web3 Wallet Login
// @access  Public
router.post('/wallet-login', strictRateLimiter, asyncHandler(authController.walletLogin.bind(authController)));

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth authentication
// @access  Public
router.get('/google', strictRateLimiter, (req, res, next) => {
  const referer = req.headers.referer || req.headers.origin || '';
  const state = referer.includes('localhost') ? 'local' : 'prod';
  
  passport.authenticate('google', { 
    scope: ['profile', 'email'], 
    session: false,
    state: state
  })(req, res, next);
});

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', 
  (req, res, next) => {
    const isLocal = req.query.state === 'local';
    const fallbackUrl = isLocal ? 'http://localhost:5173' : (process.env.CORS_ORIGIN || 'https://safeswap.vercel.app');
    
    passport.authenticate('google', { 
      session: false, 
      failureRedirect: `${fallbackUrl}/login?error=true` 
    })(req, res, next);
  },
  asyncHandler(authController.googleCallback.bind(authController))
);

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', asyncHandler(authController.refreshToken.bind(authController)));

// @route   GET /api/auth/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', verifyToken, asyncHandler(authController.getProfile.bind(authController)));

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', verifyToken, asyncHandler(authController.updateProfile.bind(authController)));

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', verifyToken, asyncHandler(authController.logout.bind(authController)));

module.exports = router;
