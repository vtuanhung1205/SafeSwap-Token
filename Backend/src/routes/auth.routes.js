const express = require('express');
const { AuthController } = require('../controllers/auth.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { strictRateLimiter } = require('../middleware/rateLimiter');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const authController = new AuthController();

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Authenticate with Google
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - access_token
 *             properties:
 *               access_token:
 *                 type: string
 *                 description: Google OAuth access token
 *               user:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   name:
 *                     type: string
 *                   picture:
 *                     type: string
 *     responses:
 *       200:
 *         description: Authentication successful, returns access and refresh tokens.
 *       400:
 *         description: Invalid token or missing fields.
 *       401:
 *         description: Failed to authenticate with Google.
 */
router.post('/google', strictRateLimiter, asyncHandler(authController.googleAuth.bind(authController)));

/**
 * @swagger
 * /api/auth/aptos-connect:
 *   post:
 *     summary: Authenticate with Aptos Connect
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressString
 *               - publicKeyString
 *             properties:
 *               addressString:
 *                 type: string
 *                 description: Aptos wallet address string
 *               publicKeyString:
 *                 type: string
 *                 description: Wallet public key string
 *               walletType:
 *                 type: string
 *                 description: Type of wallet (e.g., aptos, martian, pontem)
 *               network:
 *                 type: string
 *                 description: Network (e.g., mainnet, testnet)
 *     responses:
 *       200:
 *         description: Authentication successful, returns access and refresh tokens.
 *       400:
 *         description: Invalid wallet data or missing fields.
 */
router.post('/aptos-connect', strictRateLimiter, asyncHandler(authController.aptosConnectAuth.bind(authController)));

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.get('/profile', verifyToken, asyncHandler(authController.getProfile.bind(authController)));

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: New Name
 *               avatar:
 *                 type: string
 *                 format: url
 *                 example: https://example.com/new-avatar.jpg
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.put('/profile', verifyToken, asyncHandler(authController.updateProfile.bind(authController)));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.post('/logout', verifyToken, asyncHandler(authController.logout.bind(authController)));

module.exports = router;
