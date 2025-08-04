const express = require('express');
const router = express.Router();
const swapController = require('../controllers/swap.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     QuoteRequest:
 *       type: object
 *       required:
 *         - fromToken
 *         - toToken
 *         - amount
 *       properties:
 *         fromToken:
 *           type: string
 *           description: Token to swap from
 *           example: "APT"
 *         toToken:
 *           type: string
 *           description: Token to swap to
 *           example: "USDC"
 *         amount:
 *           type: number
 *           description: Amount to swap
 *           example: 100
 *         slippage:
 *           type: number
 *           description: Slippage tolerance (default 0.5)
 *           example: 0.5
 *         walletAddress:
 *           type: string
 *           description: Wallet address for the swap
 *           example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *     SwapRequest:
 *       type: object
 *       required:
 *         - fromToken
 *         - toToken
 *         - fromAmount
 *         - toAmount
 *         - walletAddress
 *       properties:
 *         fromToken:
 *           type: string
 *           description: Token to swap from
 *           example: "APT"
 *         toToken:
 *           type: string
 *           description: Token to swap to
 *           example: "USDC"
 *         fromAmount:
 *           type: number
 *           description: Amount to swap
 *           example: 100
 *         toAmount:
 *           type: number
 *           description: Expected amount to receive
 *           example: 95.5
 *         slippage:
 *           type: number
 *           description: Slippage tolerance
 *           example: 0.5
 *         walletAddress:
 *           type: string
 *           description: Wallet address for the swap
 *           example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *         signature:
 *           type: string
 *           description: Transaction signature
 *           example: "0x..."
 */

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
 *             $ref: '#/components/schemas/QuoteRequest'
 *     responses:
 *       200:
 *         description: Quote generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     quoteId:
 *                       type: string
 *                     fromToken:
 *                       type: object
 *                     toToken:
 *                       type: object
 *                     exchangeRate:
 *                       type: number
 *                     slippage:
 *                       type: number
 *                     gasEstimate:
 *                       type: object
 *                     validUntil:
 *                       type: string
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/quote', swapController.getQuote);

/**
 * @swagger
 * /api/swap/execute:
 *   post:
 *     summary: Execute swap transaction
 *     tags: [Swap]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SwapRequest'
 *     responses:
 *       200:
 *         description: Swap executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactionHash:
 *                       type: string
 *                     status:
 *                       type: string
 *                     fromToken:
 *                       type: object
 *                     toToken:
 *                       type: object
 *                     gasUsed:
 *                       type: number
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/execute', swapController.executeSwap);

/**
 * @swagger
 * /api/swap/history:
 *   get:
 *     summary: Get swap history
 *     tags: [Swap]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of transactions to return
 *       - in: query
 *         name: walletAddress
 *         schema:
 *           type: string
 *         description: Wallet address to filter by
 *     responses:
 *       200:
 *         description: Swap history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     swaps:
 *                       type: array
 *                       items:
 *                         type: object
 *                     count:
 *                       type: integer
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/history', optionalAuth, swapController.getSwapHistory);

/**
 * @swagger
 * /api/swap/stats:
 *   get:
 *     summary: Get swap statistics
 *     tags: [Swap]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Swap stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSwaps:
 *                       type: integer
 *                     totalVolume:
 *                       type: number
 *                     successRate:
 *                       type: number
 *                     avgAmount:
 *                       type: number
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/stats', optionalAuth, swapController.getSwapStats);

/**
 * @swagger
 * /api/swap/transaction/:hash:
 *   get:
 *     summary: Get swap transaction by hash
 *     tags: [Swap]
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction hash
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
router.get('/transaction/:hash', swapController.getSwapTransactionStatus);

/**
 * @swagger
 * /api/swap/health:
 *   get:
 *     summary: Health check for swap service
 *     tags: [Swap]
 *     responses:
 *       200:
 *         description: Health check successful
 *       500:
 *         description: Health check failed
 */
router.get('/health', swapController.healthCheck);

module.exports = router;
