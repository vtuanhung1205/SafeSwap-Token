const express = require('express');
const { LiquidityController } = require('../controllers/liquidity.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const { standardRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const liquidityController = new LiquidityController();

/**
 * @swagger
 * /api/liquidity/add:
 *   post:
 *     summary: Add liquidity to SafeSwap pool
 *     tags: [Liquidity]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token0
 *               - token1
 *               - amount0
 *               - amount1
 *             properties:
 *               token0:
 *                 type: string
 *                 description: Address of first token
 *               token1:
 *                 type: string
 *                 description: Address of second token
 *               amount0:
 *                 type: number
 *                 description: Amount of first token
 *               amount1:
 *                 type: number
 *                 description: Amount of second token
 *               minLiquidity:
 *                 type: number
 *                 default: 0
 *                 description: Minimum liquidity to receive
 *     responses:
 *       200:
 *         description: Add liquidity transaction created successfully
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 */
router.post('/add', authenticate, standardRateLimiter, asyncHandler(liquidityController.addLiquidity.bind(liquidityController)));

/**
 * @swagger
 * /api/liquidity/remove:
 *   post:
 *     summary: Remove liquidity from SafeSwap pool
 *     tags: [Liquidity]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token0
 *               - token1
 *               - liquidity
 *               - minAmount0
 *               - minAmount1
 *             properties:
 *               token0:
 *                 type: string
 *                 description: Address of first token
 *               token1:
 *                 type: string
 *                 description: Address of second token
 *               liquidity:
 *                 type: number
 *                 description: Amount of liquidity to remove
 *               minAmount0:
 *                 type: number
 *                 description: Minimum amount of token0 to receive
 *               minAmount1:
 *                 type: number
 *                 description: Minimum amount of token1 to receive
 *     responses:
 *       200:
 *         description: Remove liquidity transaction created successfully
 *       400:
 *         description: Invalid request parameters
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Access denied
 */
router.post('/remove', authenticate, standardRateLimiter, asyncHandler(liquidityController.removeLiquidity.bind(liquidityController)));

/**
 * @swagger
 * /api/liquidity/pools:
 *   get:
 *     summary: Get SafeSwap liquidity pools
 *     tags: [Liquidity]
 *     responses:
 *       200:
 *         description: Liquidity pools retrieved successfully
 */
router.get('/pools', asyncHandler(liquidityController.getLiquidityPools.bind(liquidityController)));

/**
 * @swagger
 * /api/liquidity/pool/{poolAddress}:
 *   get:
 *     summary: Get pool information
 *     tags: [Liquidity]
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
router.get('/pool/:poolAddress', asyncHandler(liquidityController.getPoolInfo.bind(liquidityController)));

/**
 * @swagger
 * /api/liquidity/positions:
 *   get:
 *     summary: Get user's liquidity positions
 *     tags: [Liquidity]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: User positions retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/positions', authenticate, asyncHandler(liquidityController.getUserPositions.bind(liquidityController)));

/**
 * @swagger
 * /api/liquidity/stats:
 *   get:
 *     summary: Get SafeSwap liquidity statistics
 *     tags: [Liquidity]
 *     responses:
 *       200:
 *         description: Liquidity statistics retrieved successfully
 */
router.get('/stats', asyncHandler(liquidityController.getLiquidityStats.bind(liquidityController)));

module.exports = router; 