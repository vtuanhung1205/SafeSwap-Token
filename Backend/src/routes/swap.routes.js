const express = require('express');
const { SwapController } = require('../controllers/swap.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { verifyToken } = require('../middleware/auth');
const { standardRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const swapController = new SwapController();

// @route   GET /api/swap/quote
// @desc    Get swap quote
// @access  Public
router.get('/quote', asyncHandler(swapController.getQuote.bind(swapController)));

// @route   POST /api/swap/execute
// @desc    Execute swap transaction
// @access  Private
router.post('/execute', verifyToken, standardRateLimiter, asyncHandler(swapController.executeSwap.bind(swapController)));

// @route   GET /api/swap/history
// @desc    Get user swap history
// @access  Private
router.get('/history', verifyToken, asyncHandler(swapController.getSwapHistory.bind(swapController)));

// @route   GET /api/swap/transaction/:transactionId
// @desc    Get swap transaction status
// @access  Private
router.get('/transaction/:transactionId', verifyToken, asyncHandler(swapController.getTransactionStatus.bind(swapController)));

// @route   POST /api/swap/cancel/:transactionId
// @desc    Cancel pending swap transaction
// @access  Private
router.post('/cancel/:transactionId', verifyToken, asyncHandler(swapController.cancelSwap.bind(swapController)));

// @route   GET /api/swap/stats
// @desc    Get user swap statistics
// @access  Private
router.get('/stats', verifyToken, asyncHandler(swapController.getSwapStats.bind(swapController)));

module.exports = router;
