const express = require('express');
const { WalletController } = require('../controllers/wallet.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
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
 *                 description: Aptos wallet address
 *                 example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *               publicKey:
 *                 type: string
 *                 description: Wallet public key
 *                 example: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
 *               walletName:
 *                 type: string
 *                 description: Custom name for the wallet
 *                 example: "Trading Wallet"
 *     responses:
 *       200:
 *         description: Wallet connected successfully
 *       400:
 *         description: Invalid wallet data
 *       401:
 *         description: Authentication required
 *       409:
 *         description: Wallet already connected to another account
 */
router.post('/connect', authenticate, standardRateLimiter, asyncHandler(walletController.connectWallet.bind(walletController)));

/**
 * @swagger
 * /api/wallet/disconnect/{walletId}:
 *   post:
 *     summary: Disconnect a specific wallet
 *     tags: [Wallet]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the wallet to disconnect
 *     responses:
 *       200:
 *         description: Wallet disconnected successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Wallet not found
 */
router.post('/disconnect/:walletId', authenticate, asyncHandler(walletController.disconnectWallet.bind(walletController)));

/**
 * @swagger
 * /api/wallet/list:
 *   get:
 *     summary: Get all user wallets
 *     tags: [Wallet]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: includeDisconnected
 *         schema:
 *           type: boolean
 *         description: Include disconnected wallets
 *     responses:
 *       200:
 *         description: User wallets retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get('/list', authenticate, asyncHandler(walletController.getUserWallets.bind(walletController)));

/**
 * @swagger
 * /api/wallet/{walletId}/info:
 *   get:
 *     summary: Get specific wallet information
 *     tags: [Wallet]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the wallet
 *     responses:
 *       200:
 *         description: Wallet information retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Wallet not found
 */
router.get('/:walletId/info', authenticate, asyncHandler(walletController.getWalletInfo.bind(walletController)));

/**
 * @swagger
 * /api/wallet/{walletId}/set-default:
 *   post:
 *     summary: Set wallet as default
 *     tags: [Wallet]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the wallet to set as default
 *     responses:
 *       200:
 *         description: Default wallet updated successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Wallet not found
 */
router.post('/:walletId/set-default', authenticate, asyncHandler(walletController.setDefaultWallet.bind(walletController)));

/**
 * @swagger
 * /api/wallet/{walletId}/name:
 *   put:
 *     summary: Update wallet name
 *     tags: [Wallet]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the wallet
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: New wallet name
 *                 example: "My Trading Wallet"
 *     responses:
 *       200:
 *         description: Wallet name updated successfully
 *       400:
 *         description: Invalid wallet name
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Wallet not found
 */
router.put('/:walletId/name', authenticate, asyncHandler(walletController.updateWalletName.bind(walletController)));

/**
 * @swagger
 * /api/wallet/{walletId}/sync:
 *   post:
 *     summary: Sync wallet with blockchain
 *     tags: [Wallet]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the wallet to sync
 *     responses:
 *       200:
 *         description: Wallet synced successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Wallet not found
 */
router.post('/:walletId/sync', authenticate, asyncHandler(walletController.syncWallet.bind(walletController)));

/**
 * @swagger
 * /api/wallet/{walletId}/balance:
 *   get:
 *     summary: Get wallet balance
 *     tags: [Wallet]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the wallet
 *     responses:
 *       200:
 *         description: Wallet balance retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Wallet not found
 */
router.get('/:walletId/balance', authenticate, asyncHandler(walletController.getBalance.bind(walletController)));

/**
 * @swagger
 * /api/wallet/{walletId}/tokens:
 *   get:
 *     summary: Get wallet token balances
 *     tags: [Wallet]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the wallet
 *     responses:
 *       200:
 *         description: Token balances retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Wallet not found
 */
router.get('/:walletId/tokens', authenticate, asyncHandler(walletController.getTokenBalances.bind(walletController)));

/**
 * @swagger
 * /api/wallet/{walletId}/transactions:
 *   get:
 *     summary: Get wallet transaction history
 *     tags: [Wallet]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the wallet
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
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Wallet not found
 */
router.get('/:walletId/transactions', authenticate, asyncHandler(walletController.getTransactionHistory.bind(walletController)));

/**
 * @swagger
 * /api/wallet/validate/{address}:
 *   get:
 *     summary: Validate Aptos address
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Aptos address to validate
 *     responses:
 *       200:
 *         description: Address validation result
 */
router.get('/validate/:address', asyncHandler(walletController.validateAddress.bind(walletController)));

/**
 * @swagger
 * /api/wallet/account/{address}:
 *   get:
 *     summary: Get account information
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Aptos address
 *     responses:
 *       200:
 *         description: Account information retrieved successfully
 *       400:
 *         description: Invalid address format
 */
router.get('/account/:address', asyncHandler(walletController.getAccountInfo.bind(walletController)));

/**
 * @swagger
 * /api/wallet/{walletId}/update-balance:
 *   post:
 *     summary: Update wallet balance from blockchain
 *     tags: [Wallet]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the wallet
 *     responses:
 *       200:
 *         description: Balance updated successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: Wallet not found
 */
router.post('/:walletId/update-balance', authenticate, asyncHandler(walletController.updateBalance.bind(walletController)));

module.exports = router;
