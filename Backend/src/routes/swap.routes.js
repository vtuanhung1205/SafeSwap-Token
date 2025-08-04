const express = require('express');
const router = express.Router();
const swapController = require('../controllers/swap.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     SwapQuoteRequest:
 *       type: object
 *       required:
 *         - fromToken
 *         - toToken
 *         - amount
 *       properties:
 *         fromToken:
 *           type: string
 *           description: CoinGecko token ID or address
 *           example: "aptos"
 *         toToken:
 *           type: string
 *           description: CoinGecko token ID or address
 *           example: "usd-coin"
 *         amount:
 *           type: number
 *           description: Amount of source token to swap
 *           example: 10
 *         slippage:
 *           type: number
 *           default: 0.5
 *           description: Allowed slippage percentage
 *         walletAddress:
 *           type: string
 *           description: Wallet address (optional)
 *           example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *     SwapQuoteResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             quoteId:
 *               type: string
 *             fromToken:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 symbol:
 *                   type: string
 *                 name:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 amountUSD:
 *                   type: number
 *                 price:
 *                   type: number
 *             toToken:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 symbol:
 *                   type: string
 *                 name:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 amountUSD:
 *                   type: number
 *                 price:
 *                   type: number
 *             exchangeRate:
 *               type: number
 *             slippage:
 *               type: number
 *             gasEstimate:
 *               type: object
 *               properties:
 *                 gasUsed:
 *                   type: number
 *                 gasPrice:
 *                   type: number
 *                 gasCost:
 *                   type: number
 *             validUntil:
 *               type: string
 *               format: date-time
 *             timestamp:
 *               type: string
 *               format: date-time
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
 *             $ref: '#/components/schemas/SwapQuoteRequest'
 *     responses:
 *       200:
 *         description: Quote generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SwapQuoteResponse'
 *       400:
 *         description: Invalid request parameters
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
 *             type: object
 *             required:
 *               - fromToken
 *               - toToken
 *               - fromAmount
 *               - toAmount
 *               - walletAddress
 *               - signature
 *             properties:
 *               fromToken:
 *                 type: string
 *                 description: CoinGecko token ID or address
 *               toToken:
 *                 type: string
 *                 description: CoinGecko token ID or address
 *               fromAmount:
 *                 type: number
 *                 description: Amount of source token to swap
 *               toAmount:
 *                 type: number
 *                 description: Amount of target token to receive
 *               slippage:
 *                 type: number
 *                 default: 0.5
 *                 description: Allowed slippage percentage
 *               walletAddress:
 *                 type: string
 *                 description: Wallet address
 *                 example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *               signature:
 *                 type: string
 *                 description: Transaction signature
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
 *                       type: string
 *                     toToken:
 *                       type: string
 *                     fromAmount:
 *                       type: number
 *                     toAmount:
 *                       type: number
 *                     gasUsed:
 *                       type: number
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.post('/execute', swapController.executeSwap);

/**
 * @swagger
 * /api/swap/transaction/{hash}:
 *   get:
 *     summary: Get transaction status
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
 *         description: Transaction status retrieved successfully
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
 *                       enum: [pending, completed, failed, cancelled, submitted]
 *                     fromToken:
 *                       type: string
 *                     toToken:
 *                       type: string
 *                     fromAmount:
 *                       type: number
 *                     toAmount:
 *                       type: number
 *                     gasUsed:
 *                       type: number
 *                     blockNumber:
 *                       type: number
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     errorMessage:
 *                       type: string
 *       400:
 *         description: Transaction hash required
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
router.get('/transaction/:hash', swapController.getTransactionStatus);

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
 *         name: walletAddress
 *         schema:
 *           type: string
 *         description: Wallet address (if not authenticated)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *         description: Number of transactions to return
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, cancelled, submitted]
 *         description: Filter by transaction status
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
 *                     walletAddress:
 *                       type: string
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           transactionHash:
 *                             type: string
 *                           fromToken:
 *                             type: string
 *                           toToken:
 *                             type: string
 *                           fromAmount:
 *                             type: number
 *                           toAmount:
 *                             type: number
 *                           status:
 *                             type: string
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                     count:
 *                       type: number
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Wallet address required
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/history', optionalAuth, swapController.getSwapHistory);

/**
 * @swagger
 * /api/swap/health:
 *   get:
 *     summary: Health check for swap service
 *     tags: [Swap]
 *     responses:
 *       200:
 *         description: Health check successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     coinGecko:
 *                       type: object
 *                     transaction:
 *                       type: object
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Health check failed
 */
router.get('/health', swapController.healthCheck);

module.exports = router;
