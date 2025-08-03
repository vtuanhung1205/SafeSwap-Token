const express = require('express');
const { SwapController } = require('../controllers/swap.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
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
 *                 description: Address of the source token
 *                 example: 0x1::aptos_coin::AptosCoin
 *               toToken:
 *                 type: string
 *                 description: Address of the target token
 *                 example: 0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC
 *               amount:
 *                 type: number
 *                 description: Amount of source token to swap
 *                 example: 10
 *               dex:
 *                 type: string
 *                 enum: [liquidswap, pancakeswap, sushi]
 *                 default: liquidswap
 *                 description: DEX to use for swap
 *     responses:
 *       200:
 *         description: Swap quote retrieved successfully.
 *       400:
 *         description: Invalid request parameters.
 *       500:
 *         description: Unable to get quote.
 */
router.post('/quote', asyncHandler(swapController.getQuote.bind(swapController)));

/**
 * @swagger
 * /api/swap/execute:
 *   post:
 *     summary: Execute swap transaction
 *     tags: [Swap]
 *     security:
 *       - sessionAuth: []
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
 *                 description: Address of the source token
 *               toToken:
 *                 type: string
 *                 description: Address of the target token
 *               fromAmount:
 *                 type: number
 *                 description: Amount of source token to swap
 *               toAmount:
 *                 type: number
 *                 description: Amount of target token to receive
 *               quoteId:
 *                 type: string
 *                 description: Quote ID from the quote endpoint
 *               slippage:
 *                 type: number
 *                 default: 0.5
 *                 description: Allowed slippage percentage
 *               dex:
 *                 type: string
 *                 enum: [liquidswap, pancakeswap, sushi]
 *                 default: liquidswap
 *                 description: DEX to use for swap
 *     responses:
 *       200:
 *         description: Swap executed successfully.
 *       400:
 *         description: Invalid request or insufficient balance.
 *       401:
 *         description: Authentication required.
 *       403:
 *         description: Access denied.
 *       404:
 *         description: Quote not found or expired.
 */
router.post('/execute', authenticate, standardRateLimiter, asyncHandler(swapController.executeSwap.bind(swapController)));

/**
 * @swagger
 * /api/swap/transaction/{transactionId}:
 *   get:
 *     summary: Get transaction status
 *     tags: [Swap]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the transaction
 *     responses:
 *       200:
 *         description: Transaction status retrieved successfully.
 *       401:
 *         description: Authentication required.
 *       404:
 *         description: Transaction not found.
 */
router.get('/transaction/:transactionId', authenticate, asyncHandler(swapController.getTransactionStatus.bind(swapController)));

/**
 * @swagger
 * /api/swap/history:
 *   get:
 *     summary: Get user's swap transaction history
 *     tags: [Swap]
 *     security:
 *       - sessionAuth: []
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
 *         description: Number of transactions per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, cancelled]
 *         description: Filter by transaction status
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/history', authenticate, asyncHandler(swapController.getTransactionHistory.bind(swapController)));

/**
 * @swagger
 * /api/swap/dexes:
 *   get:
 *     summary: Get supported DEXes
 *     tags: [Swap]
 *     responses:
 *       200:
 *         description: Supported DEXes retrieved successfully
 */
router.get('/dexes', asyncHandler(swapController.getSupportedDexes.bind(swapController)));

/**
 * @swagger
 * /api/swap/tokens:
 *   get:
 *     summary: Get common tokens
 *     tags: [Swap]
 *     responses:
 *       200:
 *         description: Common tokens retrieved successfully
 */
router.get('/tokens', asyncHandler(swapController.getCommonTokens.bind(swapController)));

/**
 * @swagger
 * /api/swap/pools:
 *   get:
 *     summary: Get liquidity pools
 *     tags: [Swap]
 *     parameters:
 *       - in: query
 *         name: dex
 *         schema:
 *           type: string
 *           enum: [liquidswap, pancakeswap, sushi]
 *           default: liquidswap
 *         description: DEX to get pools from
 *     responses:
 *       200:
 *         description: Liquidity pools retrieved successfully
 */
router.get('/pools', asyncHandler(swapController.getLiquidityPools.bind(swapController)));

/**
 * @swagger
 * /api/swap/pool/{poolAddress}:
 *   get:
 *     summary: Get pool information
 *     tags: [Swap]
 *     parameters:
 *       - in: path
 *         name: poolAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: Pool address
 *     responses:
 *       200:
 *         description: Pool information retrieved successfully
 */
router.get('/pool/:poolAddress', asyncHandler(swapController.getPoolInfo.bind(swapController)));

module.exports = router;
