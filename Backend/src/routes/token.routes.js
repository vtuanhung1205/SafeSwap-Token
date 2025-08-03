const express = require('express');
const { TokenController } = require('../controllers/token.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { standardRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const tokenController = new TokenController();

/**
 * @swagger
 * /api/tokens:
 *   get:
 *     summary: Get all tokens with pagination
 *     tags: [Tokens]
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
 *         description: Number of tokens per page
 *       - in: query
 *         name: chainId
 *         schema:
 *           type: string
 *           default: aptos-testnet
 *         description: Blockchain network
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Filter by active status
 *       - in: query
 *         name: isVerified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: marketCap
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Tokens retrieved successfully.
 */
router.get('/', asyncHandler(tokenController.getAllTokens.bind(tokenController)));

/**
 * @swagger
 * /api/tokens/address/{address}:
 *   get:
 *     summary: Get token by address
 *     tags: [Tokens]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Token address
 *     responses:
 *       200:
 *         description: Token retrieved successfully.
 *       404:
 *         description: Token not found.
 */
router.get('/address/:address', asyncHandler(tokenController.getTokenByAddress.bind(tokenController)));

/**
 * @swagger
 * /api/tokens/symbol/{symbol}:
 *   get:
 *     summary: Get token by symbol
 *     tags: [Tokens]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Token symbol
 *     responses:
 *       200:
 *         description: Token retrieved successfully.
 *       404:
 *         description: Token not found.
 */
router.get('/symbol/:symbol', asyncHandler(tokenController.getTokenBySymbol.bind(tokenController)));

/**
 * @swagger
 * /api/tokens/top-gainers:
 *   get:
 *     summary: Get top gaining tokens
 *     tags: [Tokens]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of tokens to return
 *     responses:
 *       200:
 *         description: Top gainers retrieved successfully.
 */
router.get('/top-gainers', asyncHandler(tokenController.getTopGainers.bind(tokenController)));

/**
 * @swagger
 * /api/tokens/top-losers:
 *   get:
 *     summary: Get top losing tokens
 *     tags: [Tokens]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of tokens to return
 *     responses:
 *       200:
 *         description: Top losers retrieved successfully.
 */
router.get('/top-losers', asyncHandler(tokenController.getTopLosers.bind(tokenController)));

/**
 * @swagger
 * /api/tokens/market-cap:
 *   get:
 *     summary: Get tokens by market cap
 *     tags: [Tokens]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of tokens to return
 *     responses:
 *       200:
 *         description: Tokens by market cap retrieved successfully.
 */
router.get('/market-cap', asyncHandler(tokenController.getTokensByMarketCap.bind(tokenController)));

/**
 * @swagger
 * /api/tokens/low-risk:
 *   get:
 *     summary: Get low risk tokens
 *     tags: [Tokens]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of tokens to return
 *     responses:
 *       200:
 *         description: Low risk tokens retrieved successfully.
 */
router.get('/low-risk', asyncHandler(tokenController.getLowRiskTokens.bind(tokenController)));

/**
 * @swagger
 * /api/tokens/verified:
 *   get:
 *     summary: Get verified tokens
 *     tags: [Tokens]
 *     responses:
 *       200:
 *         description: Verified tokens retrieved successfully.
 */
router.get('/verified', asyncHandler(tokenController.getVerifiedTokens.bind(tokenController)));

/**
 * @swagger
 * /api/tokens/search:
 *   get:
 *     summary: Search tokens
 *     tags: [Tokens]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: Search results retrieved successfully.
 *       400:
 *         description: Search query is required.
 */
router.get('/search', asyncHandler(tokenController.searchTokens.bind(tokenController)));

/**
 * @swagger
 * /api/tokens:
 *   post:
 *     summary: Create new token (Admin only)
 *     tags: [Tokens]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - symbol
 *               - name
 *               - address
 *             properties:
 *               symbol:
 *                 type: string
 *                 description: Token symbol
 *               name:
 *                 type: string
 *                 description: Token name
 *               address:
 *                 type: string
 *                 description: Token address
 *               decimals:
 *                 type: integer
 *                 description: Token decimals
 *               description:
 *                 type: string
 *                 description: Token description
 *     responses:
 *       201:
 *         description: Token created successfully.
 *       400:
 *         description: Invalid token data.
 *       401:
 *         description: Unauthorized.
 *       409:
 *         description: Token already exists.
 */
router.post('/', authenticate, requireAdmin, asyncHandler(tokenController.createToken.bind(tokenController)));

/**
 * @swagger
 * /api/tokens/{address}/price:
 *   put:
 *     summary: Update token price (Admin only)
 *     tags: [Tokens]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Token address
 *     responses:
 *       200:
 *         description: Token price updated successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Token not found.
 */
router.put('/:address/price', authenticate, requireAdmin, asyncHandler(tokenController.updateTokenPrice.bind(tokenController)));

/**
 * @swagger
 * /api/tokens/{address}/risk:
 *   put:
 *     summary: Update token risk score (Admin only)
 *     tags: [Tokens]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Token address
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - riskScore
 *             properties:
 *               riskScore:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Risk score (0-100)
 *               riskFactors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Risk factors
 *     responses:
 *       200:
 *         description: Token risk updated successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Token not found.
 */
router.put('/:address/risk', authenticate, requireAdmin, asyncHandler(tokenController.updateTokenRisk.bind(tokenController)));

/**
 * @swagger
 * /api/tokens/{address}/verify:
 *   put:
 *     summary: Verify token (Admin only)
 *     tags: [Tokens]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Token address
 *     responses:
 *       200:
 *         description: Token verified successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Token not found.
 */
router.put('/:address/verify', authenticate, requireAdmin, asyncHandler(tokenController.verifyToken.bind(tokenController)));

/**
 * @swagger
 * /api/tokens/{address}/deactivate:
 *   put:
 *     summary: Deactivate token (Admin only)
 *     tags: [Tokens]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Token address
 *     responses:
 *       200:
 *         description: Token deactivated successfully.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: Token not found.
 */
router.put('/:address/deactivate', authenticate, requireAdmin, asyncHandler(tokenController.deactivateToken.bind(tokenController)));

module.exports = router; 