const express = require('express');
const { PriceController } = require('../controllers/price.controller');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const priceController = new PriceController();

/**
 * @swagger
 * /api/price/all:
 *   get:
 *     summary: Get all current token prices
 *     tags: [Price]
 *     responses:
 *       200:
 *         description: All token prices retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       symbol:
 *                         type: string
 *                         example: APT
 *                       price:
 *                         type: number
 *                         example: 8.75
 *                       change24h:
 *                         type: number
 *                         example: 2.5
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Server error while retrieving prices.
 */
router.get('/all', asyncHandler(priceController.getAllPrices.bind(priceController)));

/**
 * @swagger
 * /api/price/token/{symbol}:
 *   get:
 *     summary: Get current price for a specific token
 *     tags: [Price]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Token symbol (e.g., APT, USDC)
 *     responses:
 *       200:
 *         description: Token price retrieved successfully.
 *       404:
 *         description: Token not found.
 *       500:
 *         description: Server error.
 */
router.get('/token/:symbol', asyncHandler(priceController.getCurrentPrice.bind(priceController)));

/**
 * @swagger
 * /api/price/exchange-rate:
 *   get:
 *     summary: Get exchange rate between two tokens
 *     tags: [Price]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *         description: Source token symbol
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *         description: Target token symbol
 *     responses:
 *       200:
 *         description: Exchange rate retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     rate:
 *                       type: number
 *                       example: 5.2
 *                     from:
 *                       type: string
 *                       example: APT
 *                     to:
 *                       type: string
 *                       example: USDC
 *       400:
 *         description: Missing or invalid token symbols.
 *       404:
 *         description: One or both tokens not found.
 *       500:
 *         description: Server error.
 */
router.get('/exchange-rate', asyncHandler(priceController.getExchangeRate.bind(priceController)));

/**
 * @swagger
 * /api/price/analyze:
 *   post:
 *     summary: Analyze a token for potential scams
 *     tags: [Price]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenAddress
 *             properties:
 *               tokenAddress:
 *                 type: string
 *                 description: The address of the token to analyze
 *                 example: 0x1234567890abcdef1234567890abcdef12345678
 *               tokenName:
 *                 type: string
 *                 description: The name of the token
 *                 example: SafeToken
 *               tokenSymbol:
 *                 type: string
 *                 description: The symbol of the token
 *                 example: SAFE
 *     responses:
 *       200:
 *         description: Token analysis completed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     scamProbability:
 *                       type: number
 *                       example: 0.05
 *                     risk:
 *                       type: string
 *                       enum: [low, medium, high]
 *                       example: low
 *                     warnings:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Missing or invalid token address.
 *       500:
 *         description: Server error during analysis.
 */
router.post('/analyze', asyncHandler(priceController.analyzeToken.bind(priceController)));

/**
 * @swagger
 * /api/price/batch-analyze:
 *   post:
 *     summary: Analyze multiple tokens in a batch
 *     tags: [Price]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenAddresses
 *             properties:
 *               tokenAddresses:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of token addresses to analyze
 *                 example: ["0x1234567890abcdef1234567890abcdef12345678", "0xabcdef1234567890abcdef1234567890abcdef12"]
 *     responses:
 *       200:
 *         description: Batch analysis completed.
 *       400:
 *         description: Missing or invalid token addresses.
 *       500:
 *         description: Server error during analysis.
 */
router.post('/batch-analyze', asyncHandler(priceController.batchAnalyzeTokens.bind(priceController)));

/**
 * @swagger
 * /api/price/token-list:
 *   get:
 *     summary: Get list of tokens on Aptos blockchain
 *     tags: [Price]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *         description: Filter tokens by name, symbol, or tag
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of tokens to return
 *     responses:
 *       200:
 *         description: Token list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     tokens:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           symbol:
 *                             type: string
 *                             example: APT
 *                           name:
 *                             type: string
 *                             example: Aptos
 *                           tokenAddress:
 *                             type: string
 *                             example: 0x1::aptos_coin::AptosCoin
 *                           faAddress:
 *                             type: string
 *                             example: null
 *                           decimals:
 *                             type: integer
 *                             example: 8
 *                           logoUrl:
 *                             type: string
 *                             format: uri
 *                             example: https://example.com/logos/apt.png
 *                           panoraTags:
 *                             type: array
 *                             items:
 *                               type: string
 *                             example: ["Native"]
 *       500:
 *         description: Server error while retrieving token list.
 */
router.get('/token-list', asyncHandler(priceController.getTokenList.bind(priceController)));

module.exports = router;
