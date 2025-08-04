const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     ConnectWalletRequest:
 *       type: object
 *       required:
 *         - walletAddress
 *       properties:
 *         walletAddress:
 *           type: string
 *           description: Wallet address (Aptos format)
 *           example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *         walletType:
 *           type: string
 *           enum: [aptos, ethereum, solana]
 *           default: aptos
 *           description: Type of wallet
 *     ConnectWalletResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             sessionId:
 *               type: string
 *             walletAddress:
 *               type: string
 *             walletType:
 *               type: string
 *             expiresAt:
 *               type: string
 *               format: date-time
 */

/**
 * @swagger
 * /api/user/connect:
 *   post:
 *     summary: Connect wallet and create session
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConnectWalletRequest'
 *     responses:
 *       200:
 *         description: Wallet connected successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ConnectWalletResponse'
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post('/connect', userController.connectWallet);

/**
 * @swagger
 * /api/user/disconnect:
 *   post:
 *     summary: Disconnect wallet and remove session
 *     tags: [User]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Wallet disconnected successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.post('/disconnect', authenticate, userController.disconnectWallet);

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Get current user information
 *     tags: [User]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
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
 *                     walletAddress:
 *                       type: string
 *                     walletType:
 *                       type: string
 *                     sessionId:
 *                       type: string
 *                     lastActivity:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/me', authenticate, userController.getCurrentUser);

/**
 * @swagger
 * /api/user/validate:
 *   post:
 *     summary: Validate session
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *             properties:
 *               sessionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session is valid
 *       401:
 *         description: Invalid or expired session
 *       500:
 *         description: Server error
 */
router.post('/validate', userController.validateSession);

/**
 * @swagger
 * /api/user/stats:
 *   get:
 *     summary: Get session statistics
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Session statistics retrieved successfully
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
 *                     totalSessions:
 *                       type: number
 *                     activeSessions:
 *                       type: number
 *                     expiredSessions:
 *                       type: number
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error
 */
router.get('/stats', userController.getSessionStats);

/**
 * @swagger
 * /api/user/health:
 *   get:
 *     summary: Health check for user service
 *     tags: [User]
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
 *                     stats:
 *                       type: object
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Health check failed
 */
router.get('/health', userController.healthCheck);

/**
 * Legacy endpoint for Google auth compatibility
 * Redirects to new wallet-based authentication
 */
router.post('/google', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Google auth endpoint deprecated. Please use wallet-based authentication.',
    data: {
      sessionId: null,
      walletAddress: null,
      walletType: 'aptos',
      expiresAt: null,
      deprecated: true,
      newEndpoint: '/api/user/connect'
    }
  });
});

module.exports = router; 