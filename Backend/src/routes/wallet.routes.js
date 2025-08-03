const express = require('express');
const { WalletController } = require('../controllers/wallet.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { standardRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const walletController = new WalletController();

/**
 * @swagger
 * /api/wallet/connect:
 *   post:
 *     summary: Connect Aptos wallet to user account
 *     tags: [Wallet]
 *     security:
 *       - sessionAuth: []
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
 *                 description: Aptos wallet address (0x + 64 hex characters)
 *                 example: 0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
 *               publicKey:
 *                 type: string
 *                 description: Aptos wallet public key
 *                 example: 0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
 *     responses:
 *       200:
 *         description: Wallet connected successfully.
 *       400:
 *         description: Invalid Aptos address format.
 *       401:
 *         description: Unauthorized, login required.
 *       409:
 *         description: Wallet already linked to another account.
 */
router.post('/connect', standardRateLimiter, authenticate, asyncHandler(walletController.connectWallet.bind(walletController)));

/**
 * @swagger
 * /api/wallet/disconnect:
 *   post:
 *     summary: Disconnect wallet from user account
 *     tags: [Wallet]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Wallet disconnected successfully.
 *       401:
 *         description: Unauthorized, login required.
 *       404:
 *         description: No wallet connected to this account.
 */
router.post('/disconnect', authenticate, asyncHandler(walletController.disconnectWallet.bind(walletController)));

/**
 * @swagger
 * /api/wallet/info:
 *   get:
 *     summary: Get wallet information with balances
 *     tags: [Wallet]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Wallet information retrieved successfully.
 *       401:
 *         description: Unauthorized, login required.
 *       404:
 *         description: No wallet connected to this account.
 */
router.get('/info', authenticate, asyncHandler(walletController.getWalletInfo.bind(walletController)));

/**
 * @swagger
 * /api/wallet/balance:
 *   get:
 *     summary: Get wallet balance (APT or specific token)
 *     tags: [Wallet]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: tokenAddress
 *         schema:
 *           type: string
 *         description: Token address to get balance for (optional, defaults to APT)
 *     responses:
 *       200:
 *         description: Wallet balance retrieved successfully.
 *       401:
 *         description: Unauthorized, login required.
 *       404:
 *         description: No wallet connected to this account.
 */
router.get('/balance', authenticate, asyncHandler(walletController.getBalance.bind(walletController)));

/**
 * @swagger
 * /api/wallet/token-balances:
 *   get:
 *     summary: Get all token balances for wallet
 *     tags: [Wallet]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Token balances retrieved successfully.
 *       401:
 *         description: Unauthorized, login required.
 *       404:
 *         description: No wallet connected to this account.
 */
router.get('/token-balances', authenticate, asyncHandler(walletController.getTokenBalances.bind(walletController)));

/**
 * @swagger
 * /api/wallet/transactions:
 *   get:
 *     summary: Get wallet transaction history
 *     tags: [Wallet]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of transactions to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of transactions to skip
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully.
 *       401:
 *         description: Unauthorized, login required.
 *       404:
 *         description: No wallet connected to this account.
 */
router.get('/transactions', authenticate, asyncHandler(walletController.getTransactionHistory.bind(walletController)));

/**
 * @swagger
 * /api/wallet/validate/{address}:
 *   get:
 *     summary: Validate Aptos wallet address
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Aptos wallet address to validate
 *     responses:
 *       200:
 *         description: Address validation result with account info.
 *       400:
 *         description: Invalid address format.
 */
router.get('/validate/:address', asyncHandler(walletController.validateAddress.bind(walletController)));

/**
 * @swagger
 * /api/wallet/account/{address}:
 *   get:
 *     summary: Get account information for any Aptos address
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Aptos wallet address
 *     responses:
 *       200:
 *         description: Account information retrieved successfully.
 *       400:
 *         description: Invalid Aptos address format.
 */
router.get('/account/:address', asyncHandler(walletController.getAccountInfo.bind(walletController)));

/**
 * @swagger
 * /api/wallet/update-balance:
 *   post:
 *     summary: Update wallet balance from blockchain
 *     tags: [Wallet]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Wallet balance updated successfully.
 *       401:
 *         description: Unauthorized, login required.
 *       404:
 *         description: No wallet connected to this account.
 */
router.post('/update-balance', authenticate, asyncHandler(walletController.updateBalance.bind(walletController)));

module.exports = router;
