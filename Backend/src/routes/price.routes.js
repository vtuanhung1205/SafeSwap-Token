const express = require('express');
const { PriceController } = require('../controllers/price.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { standardRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const priceController = new PriceController();

// @route   GET /api/price
// @desc    Get all current prices
// @access  Public
router.get('/', asyncHandler(priceController.getAllPrices.bind(priceController)));

// @route   GET /api/price/market/stats
// @desc    Get market statistics
// @access  Public
router.get('/market/stats', asyncHandler(priceController.getMarketStats.bind(priceController)));

// @route   GET /api/price/market/trending
// @desc    Get trending tokens
// @access  Public
router.get('/market/trending', asyncHandler(priceController.getTrendingTokens.bind(priceController)));

// @route   GET /api/price/alerts/list
// @desc    Get user price alerts
// @access  Private
router.get('/alerts/list', verifyToken, asyncHandler(priceController.getPriceAlerts.bind(priceController)));

// @route   POST /api/price/alerts/create
// @desc    Create price alert
// @access  Private
router.post('/alerts/create', verifyToken, standardRateLimiter, asyncHandler(priceController.createPriceAlert.bind(priceController)));

// @route   GET /api/price/:symbol
// @desc    Get current price for a symbol
// @access  Public
router.get('/:symbol', asyncHandler(priceController.getCurrentPrice.bind(priceController)));

// @route   GET /api/price/:symbol/history
// @desc    Get historical prices for a symbol
// @access  Public
router.get('/:symbol/history', asyncHandler(priceController.getHistoricalPrices.bind(priceController)));

// @route   PUT /api/price/:symbol
// @desc    Update price for a symbol (admin only)
// @access  Private
router.put('/:symbol', verifyToken, standardRateLimiter, asyncHandler(priceController.updatePrice.bind(priceController)));

module.exports = router;
