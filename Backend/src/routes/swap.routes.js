const express = require('express');
const { SwapController } = require('../controllers/swap.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { verifyToken } = require('../middleware/auth');
const { standardRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const swapController = new SwapController();

/**
 * @swagger
 * /api/swap/quote:
 *   post:
 *     summary: Get swap quote
 *     tags: [Swap]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromToken
 *               - toToken
 *               - amount
 *             properties:
 *               fromToken:
 *                 type: string
 *                 description: Symbol of the source token
 *                 example: APT
 *               toToken:
 *                 type: string
 *                 description: Symbol of the target token
 *                 example: USDC
 *               amount:
 *                 type: number
 *                 description: Amount of source token to swap
 *                 example: 10
 *     responses:
 *       200:
 *         description: Swap quote retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 quoteId:
 *                   type: string
 *                   description: Unique ID for this quote
 *                 fromAmount:
 *                   type: number
 *                   description: Amount of source token
 *                 toAmount:
 *                   type: number
 *                   description: Amount of target token
 *                 exchangeRate:
 *                   type: number
 *                   description: Exchange rate
 *                 fee:
 *                   type: number
 *                   description: Fee amount
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   description: Quote expiration time
 *       400:
 *         description: Invalid request parameters.
 *       500:
 *         description: Unable to get price.
 */
router.post('/quote', asyncHandler(swapController.getQuote.bind(swapController)));

/**
 * @swagger
 * /api/swap/execute:
 *   post:
 *     summary: Execute swap transaction
 *     tags: [Swap]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromToken
 *               - toToken
 *               - fromAmount
 *               - toAmount
 *               - quoteId
 *             properties:
 *               fromToken:
 *                 type: string
 *                 description: Symbol of the source token
 *                 example: APT
 *               toToken:
 *                 type: string
 *                 description: Symbol of the target token
 *                 example: USDC
 *               fromAmount:
 *                 type: number
 *                 description: Amount of source token to swap
 *                 example: 10
 *               toAmount:
 *                 type: number
 *                 description: Amount of target token to receive
 *                 example: 50
 *               quoteId:
 *                 type: string
 *                 description: Quote ID from the quote endpoint
 *                 example: q_123456789
 *     responses:
 *       200:
 *         description: Swap executed successfully.
 *       400:
 *         description: Invalid request or insufficient balance.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 *       404:
 *         description: Quote not found or expired.
 */
router.post('/execute', verifyToken, standardRateLimiter, asyncHandler(swapController.executeSwap.bind(swapController)));

/**
 * @swagger
 * /api/swap/history:
 *   get:
 *     summary: Get user swap history
 *     tags: [Swap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed]
 *         description: Filter by transaction status
 *     responses:
 *       200:
 *         description: Swap history retrieved successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.get('/history', verifyToken, asyncHandler(swapController.getSwapHistory.bind(swapController)));

/**
 * @swagger
 * /api/swap/history/{transactionId}:
 *   get:
 *     summary: Get swap transaction details
 *     tags: [Swap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the swap transaction
 *     responses:
 *       200:
 *         description: Swap details retrieved successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 *       404:
 *         description: Swap transaction not found.
 */
router.get('/history/:transactionId', verifyToken, asyncHandler(swapController.getSwapDetails.bind(swapController)));

/**
 * @swagger
 * /api/swap/stats:
 *   get:
 *     summary: Get user swap statistics
 *     tags: [Swap]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Swap statistics retrieved successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.get('/stats', verifyToken, asyncHandler(swapController.getSwapStats.bind(swapController)));

/**
 * @swagger
 * /api/swap/calculate-rates:
 *   post:
 *     summary: Calculate swap rates between two tokens
 *     tags: [Swap]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromToken
 *               - toToken
 *               - amount
 *             properties:
 *               fromToken:
 *                 type: string
 *                 description: Symbol of the source token
 *                 example: APT
 *               toToken:
 *                 type: string
 *                 description: Symbol of the target token
 *                 example: USDC
 *               amount:
 *                 type: number
 *                 description: Amount of source token to swap
 *                 example: 10
 *     responses:
 *       200:
 *         description: Swap rates calculated successfully.
 *       400:
 *         description: Invalid request parameters.
 */
router.post('/calculate-rates', asyncHandler(swapController.calculateSwapRates.bind(swapController)));

/**
 * @swagger
 * /api/swap/create-transaction:
 *   post:
 *     summary: Create a swap transaction payload
 *     tags: [Swap]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromToken
 *               - toToken
 *               - fromAmount
 *               - toAmount
 *             properties:
 *               fromToken:
 *                 type: string
 *                 description: Symbol of the source token
 *                 example: APT
 *               toToken:
 *                 type: string
 *                 description: Symbol of the target token
 *                 example: USDC
 *               fromAmount:
 *                 type: number
 *                 description: Amount of source token to swap
 *                 example: 10
 *               toAmount:
 *                 type: number
 *                 description: Amount of target token to receive
 *                 example: 50
 *               slippage:
 *                 type: number
 *                 description: Allowed slippage percentage
 *                 example: 0.5
 *     responses:
 *       200:
 *         description: Transaction payload created successfully.
 *       400:
 *         description: Invalid request parameters.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.post('/create-transaction', verifyToken, asyncHandler(swapController.createSwapTransaction.bind(swapController)));

/**
 * @swagger
 * /api/swap/cancel/{transactionId}:
 *   post:
 *     summary: Cancel a pending swap transaction
 *     tags: [Swap]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the swap transaction to cancel
 *     responses:
 *       200:
 *         description: Transaction cancelled successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 *       404:
 *         description: Pending transaction not found.
 */
router.post('/cancel/:transactionId', verifyToken, asyncHandler(swapController.cancelSwap.bind(swapController)));

module.exports = router;
