const express = require('express');
const { WalletController } = require('../controllers/wallet.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { standardRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const walletController = new WalletController();

/**
 * @swagger
 * /api/wallet/connect:
 *   post:
 *     summary: Connect wallet to user account
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - publicKey
 *             properties:
 *               address:
 *                 type: string
 *                 description: Wallet address
 *                 example: 0x1234567890abcdef1234567890abcdef12345678
 *               publicKey:
 *                 type: string
 *                 description: Wallet public key
 *                 example: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
 *     responses:
 *       200:
 *         description: Wallet connected successfully.
 *       400:
 *         description: Invalid wallet data.
 *       401:
 *         description: Unauthorized, login required.
 */
router.post('/connect', standardRateLimiter, verifyToken, asyncHandler(walletController.connectWallet.bind(walletController)));

/**
 * @swagger
 * /api/wallet/disconnect:
 *   post:
 *     summary: Disconnect wallet from user account
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet disconnected successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 *       404:
 *         description: No wallet connected to this account.
 */
router.post('/disconnect', verifyToken, asyncHandler(walletController.disconnectWallet.bind(walletController)));

/**
 * @swagger
 * /api/wallet/info:
 *   get:
 *     summary: Get wallet information
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet information retrieved successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 *       404:
 *         description: No wallet connected to this account.
 */
router.get('/info', verifyToken, asyncHandler(walletController.getWalletInfo.bind(walletController)));

/**
 * @swagger
 * /api/wallet/balance:
 *   get:
 *     summary: Get wallet balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance retrieved successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 *       404:
 *         description: No wallet connected to this account.
 */
router.get('/balance', verifyToken, asyncHandler(walletController.getBalance.bind(walletController)));

/**
 * @swagger
 * /api/wallet/update-balance:
 *   post:
 *     summary: Update wallet balance
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance updated successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 *       404:
 *         description: No wallet connected to this account.
 */
router.post('/update-balance', verifyToken, asyncHandler(walletController.updateBalance.bind(walletController)));

/**
 * @swagger
 * /api/wallet/transactions:
 *   get:
 *     summary: Get wallet transaction history
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 25
 *         description: Maximum number of transactions to return
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 *       404:
 *         description: No wallet connected to this account.
 */
router.get('/transactions', verifyToken, asyncHandler(walletController.getTransactionHistory.bind(walletController)));

/**
 * @swagger
 * /api/wallet/resources:
 *   get:
 *     summary: Get wallet account resources
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account resources retrieved successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 *       404:
 *         description: No wallet connected to this account.
 */
router.get('/resources', verifyToken, asyncHandler(walletController.getAccountResources.bind(walletController)));

/**
 * @swagger
 * /api/wallet/validate-address:
 *   post:
 *     summary: Validate wallet address
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *                 description: Wallet address to validate
 *                 example: 0x1234567890abcdef1234567890abcdef12345678
 *     responses:
 *       200:
 *         description: Address validation result.
 *       400:
 *         description: Invalid address format.
 */
router.post('/validate-address', asyncHandler(walletController.validateAddress.bind(walletController)));

/**
 * @swagger
 * /api/wallet/fund:
 *   post:
 *     summary: Fund wallet from faucet (testnet only)
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to fund (in APT)
 *                 example: 10
 *     responses:
 *       200:
 *         description: Wallet funded successfully.
 *       400:
 *         description: Invalid amount or funding failed.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 *       404:
 *         description: No wallet connected to this account.
 */
router.post('/fund', verifyToken, standardRateLimiter, asyncHandler(walletController.fundAccount.bind(walletController)));

/**
 * @swagger
 * /api/wallet/account:
 *   get:
 *     summary: Get account information
 *     tags: [Wallet]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account information retrieved successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 *       404:
 *         description: No wallet connected to this account.
 */
router.get('/account', verifyToken, asyncHandler(walletController.getAccountInfo.bind(walletController)));

module.exports = router;
