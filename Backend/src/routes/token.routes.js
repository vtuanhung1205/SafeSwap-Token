const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/token.controller');
const { optionalAuth } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     TokenInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: CoinGecko token ID
 *         symbol:
 *           type: string
 *           description: Token symbol
 *         name:
 *           type: string
 *           description: Token name
 *         price:
 *           type: number
 *           description: Current price in USD
 *         marketCap:
 *           type: number
 *           description: Market capitalization
 *         volume24h:
 *           type: number
 *           description: 24h trading volume
 *         priceChange24h:
 *           type: number
 *           description: 24h price change percentage
 *     PriceData:
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
 *         description: All tokens retrieved successfully
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
 *                         $ref: '#/components/schemas/TokenInfo'
 *                     count:
 *                       type: integer
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
 *     summary: Get tokens by platform (e.g., aptos)
 *     tags: [Tokens]
 *     parameters:
 *       - in: path
 *         name: platform
 *         required: true
 *         schema:
 *           type: string
 *         description: Platform name (aptos, ethereum, etc.)
 *     responses:
 *       200:
 *         description: Platform tokens retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/platform/:platform', tokenController.getTokensByPlatform);

/**
 * @swagger
 * /api/tokens/{tokenId}:
 *   get:
 *     summary: Get detailed token information
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
 *       500:
 *         description: Server error
 */
router.post('/clear-cache', tokenController.clearCache);

/**
 * Legacy price endpoints for frontend compatibility
 */

/**
 * @swagger
 * /api/price/all:
 *   get:
 *     summary: Get all token prices (legacy endpoint)
 *     tags: [Price]
 *     responses:
 *       200:
 *         description: All prices retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/price/all', async (req, res) => {
  try {
    // Get popular tokens for legacy endpoint
    const popularTokens = ['bitcoin', 'ethereum', 'aptos', 'usd-coin', 'tether'];
    const prices = await tokenController.getMultipleTokenPrices(req, res);
    
    res.status(200).json({
      success: true,
      message: 'All prices retrieved successfully (legacy endpoint)',
      data: {
        prices,
        deprecated: true,
        newEndpoint: '/api/tokens/prices'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get all prices',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/price/token/{symbol}:
 *   get:
 *     summary: Get token price by symbol (legacy endpoint)
 *     tags: [Price]
 *     parameters:
 *       - in: path
 *         name: symbol
 *         required: true
 *         schema:
 *           type: string
 *         description: Token symbol
 *     responses:
 *       200:
 *         description: Token price retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/price/token/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Map common symbols to CoinGecko IDs
    const symbolMap = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'APT': 'aptos',
      'USDC': 'usd-coin',
      'USDT': 'tether'
    };
    
    const tokenId = symbolMap[symbol.toUpperCase()] || symbol.toLowerCase();
    const priceData = await tokenController.getTokenPrice(req, res);
    
    res.status(200).json({
      success: true,
      message: 'Token price retrieved successfully (legacy endpoint)',
      data: {
        symbol: symbol.toUpperCase(),
        price: priceData.price,
        deprecated: true,
        newEndpoint: `/api/tokens/${tokenId}/price`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get token price',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/price/exchange-rate:
 *   get:
 *     summary: Get exchange rate between tokens (legacy endpoint)
 *     tags: [Price]
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *         description: From token symbol
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *         description: To token symbol
 *     responses:
 *       200:
 *         description: Exchange rate retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/price/exchange-rate', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'From and to tokens are required'
      });
    }
    
    // Get prices for both tokens
    const symbolMap = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'APT': 'aptos',
      'USDC': 'usd-coin',
      'USDT': 'tether'
    };
    
    const fromId = symbolMap[from.toUpperCase()] || from.toLowerCase();
    const toId = symbolMap[to.toUpperCase()] || to.toLowerCase();
    
    // Mock exchange rate calculation
    const exchangeRate = Math.random() * 2 + 0.1; // Random rate for demo
    
    res.status(200).json({
      success: true,
      message: 'Exchange rate retrieved successfully (legacy endpoint)',
      data: {
        from: from.toUpperCase(),
        to: to.toUpperCase(),
        rate: exchangeRate,
        deprecated: true,
        newEndpoint: `/api/tokens/${fromId}/price`
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get exchange rate',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /api/price/analyze:
 *   post:
 *     summary: Analyze token (legacy endpoint)
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
 *                 description: Token address to analyze
 *     responses:
 *       200:
 *         description: Token analysis completed
 *       500:
 *         description: Server error
 */
router.post('/price/analyze', async (req, res) => {
  try {
    const { tokenAddress } = req.body;
    
    if (!tokenAddress) {
      return res.status(400).json({
        success: false,
        message: 'Token address is required'
      });
    }
    
    // Mock analysis for legacy endpoint
    const analysis = {
      tokenAddress,
      riskScore: Math.random() * 100,
      liquidity: Math.random() * 1000000,
      volume24h: Math.random() * 1000000,
      marketCap: Math.random() * 100000000,
      deprecated: true,
      newEndpoint: '/api/tokens/search'
    };
    
    res.status(200).json({
      success: true,
      message: 'Token analysis completed (legacy endpoint)',
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to analyze token',
      error: error.message
    });
  }
});

module.exports = router; 