const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/token.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Token:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         symbol:
 *           type: string
 *         name:
 *           type: string
 *         platforms:
 *           type: object
 *     TokenPrice:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         price:
 *           type: number
 *         priceChange24h:
 *           type: number
 *         marketCap:
 *           type: number
 *         volume24h:
 *           type: number
 *         lastUpdated:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/tokens/all:
 *   get:
 *     summary: Get all tokens from CoinGecko
 *     tags: [Tokens]
 *     responses:
 *       200:
 *         description: Tokens retrieved successfully
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
 *                     tokens:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Token'
 *                     count:
 *                       type: number
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error
 */
router.get('/all', tokenController.getAllTokens);

/**
 * @swagger
 * /api/tokens/platform/{platform}:
 *   get:
 *     summary: Get tokens by platform
 *     tags: [Tokens]
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *           enum: [aptos, ethereum, solana]
 *         description: Platform name
 *     responses:
 *       200:
 *         description: Platform tokens retrieved successfully
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
 *                     platform:
 *                       type: string
 *                     tokens:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Token'
 *                     count:
 *                       type: number
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error
 */
router.get('/platform/:platform', tokenController.getTokensByPlatform);

/**
 * @swagger
 * /api/tokens/{tokenId}:
 *   get:
 *     summary: Get token information
 *     tags: [Tokens]
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: CoinGecko token ID
 *     responses:
 *       200:
 *         description: Token info retrieved successfully
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
 *                     id:
 *                       type: string
 *                     symbol:
 *                       type: string
 *                     name:
 *                       type: string
 *                     description:
 *                       type: string
 *                     image:
 *                       type: string
 *                     marketCap:
 *                       type: number
 *                     volume24h:
 *                       type: number
 *                     price:
 *                       type: number
 *                     priceChange24h:
 *                       type: number
 *                     platforms:
 *                       type: object
 *                     links:
 *                       type: object
 *       500:
 *         description: Server error
 */
router.get('/:tokenId', tokenController.getTokenInfo);

/**
 * @swagger
 * /api/tokens/{tokenId}/price:
 *   get:
 *     summary: Get token price
 *     tags: [Tokens]
 *     parameters:
 *       - in: path
 *         name: tokenId
 *         required: true
 *         schema:
 *           type: string
 *         description: CoinGecko token ID
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *           default: usd
 *         description: Currency for price
 *     responses:
 *       200:
 *         description: Token price retrieved successfully
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
 *                   $ref: '#/components/schemas/TokenPrice'
 *       500:
 *         description: Server error
 */
router.get('/:tokenId/price', tokenController.getTokenPrice);

/**
 * @swagger
 * /api/tokens/prices:
 *   post:
 *     summary: Get multiple token prices
 *     tags: [Tokens]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenIds
 *             properties:
 *               tokenIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of CoinGecko token IDs
 *               currency:
 *                 type: string
 *                 default: usd
 *                 description: Currency for prices
 *     responses:
 *       200:
 *         description: Token prices retrieved successfully
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
 *                     prices:
 *                       type: object
 *                       additionalProperties:
 *                         $ref: '#/components/schemas/TokenPrice'
 *                     count:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/prices', tokenController.getMultipleTokenPrices);

/**
 * @swagger
 * /api/tokens/search:
 *   get:
 *     summary: Search tokens
 *     tags: [Tokens]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search completed successfully
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
 *                     query:
 *                       type: string
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           symbol:
 *                             type: string
 *                           name:
 *                             type: string
 *                           marketCapRank:
 *                             type: number
 *                           image:
 *                             type: string
 *                     count:
 *                       type: number
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Search query required
 *       500:
 *         description: Server error
 */
router.get('/search', tokenController.searchTokens);

/**
 * @swagger
 * /api/tokens/trending:
 *   get:
 *     summary: Get trending tokens
 *     tags: [Tokens]
 *     responses:
 *       200:
 *         description: Trending tokens retrieved successfully
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
 *                     trending:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           symbol:
 *                             type: string
 *                           name:
 *                             type: string
 *                           marketCapRank:
 *                             type: number
 *                           image:
 *                             type: string
 *                           priceChange24h:
 *                             type: number
 *                     count:
 *                       type: number
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error
 */
router.get('/trending', tokenController.getTrendingTokens);

/**
 * @swagger
 * /api/tokens/health:
 *   get:
 *     summary: Health check for CoinGecko service
 *     tags: [Tokens]
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
 *                     status:
 *                       type: string
 *                       enum: [healthy, unhealthy]
 *                     service:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Health check failed
 */
router.get('/health', tokenController.healthCheck);

/**
 * @swagger
 * /api/tokens/clear-cache:
 *   post:
 *     summary: Clear CoinGecko cache
 *     tags: [Tokens]
 *     responses:
 *       200:
 *         description: Cache cleared successfully
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
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error
 */
router.post('/clear-cache', tokenController.clearCache);

module.exports = router; 