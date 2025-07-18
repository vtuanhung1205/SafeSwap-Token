const express = require('express');
const { PriceController } = require('../controllers/price.controller');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const priceController = new PriceController();

// @route   GET /api/price/all
// @desc    Get all current prices
// @access  Public
router.get('/all', asyncHandler(priceController.getAllPrices.bind(priceController)));

// @route   GET /api/price/token/:symbol
// @desc    Get current price for a symbol
// @access  Public
router.get('/token/:symbol', asyncHandler(priceController.getCurrentPrice.bind(priceController)));

// @route   GET /api/price/exchange-rate
// @desc    Get exchange rate between two tokens
// @access  Public
router.get('/exchange-rate', asyncHandler(priceController.getExchangeRate.bind(priceController)));

// @route   POST /api/price/analyze
// @desc    Analyze a token
// @access  Public
router.post('/analyze', asyncHandler(priceController.analyzeToken.bind(priceController)));

// @route   POST /api/price/batch-analyze
// @desc    Analyze a batch of tokens
// @access  Public
router.post('/batch-analyze', asyncHandler(priceController.batchAnalyzeTokens.bind(priceController)));

module.exports = router;
