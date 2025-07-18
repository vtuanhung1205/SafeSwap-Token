const express = require('express');
const { AuthController } = require('../controllers/auth.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { strictRateLimiter } = require('../middleware/rateLimiter');
const { verifyToken } = require('../middleware/auth');

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

// @route   POST /api/auth/google
// @desc    Google OAuth authentication
// @access  Public
router.post('/google', strictRateLimiter, asyncHandler(authController.googleAuth.bind(authController)));

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
