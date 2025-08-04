const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticate, optionalAuth } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         transactionHash:
 *           type: string
 *         walletAddress:
 *           type: string
 *         fromToken:
 *           type: string
 *         toToken:
 *           type: string
 *         fromAmount:
 *           type: number
 *         toAmount:
 *           type: number
 *         exchangeRate:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, completed, failed, cancelled, submitted]
 *         gasUsed:
 *           type: number
 *         blockNumber:
 *           type: number
 *         timestamp:
 *           type: string
 *           format: date-time
 *         errorMessage:
 *           type: string
 */

/**
 * @swagger
 * /api/transactions/history:
 *   get:
 *     summary: Get user transaction history
 *     tags: [Transactions]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: walletAddress
 *         schema:
 *           type: string
 *         description: Wallet address (if not authenticated)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 50
 *         description: Number of transactions to return
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, cancelled, submitted]
 *         description: Filter by transaction status
 *       - in: query
 *         name: fromToken
 *         schema:
 *           type: string
 *         description: Filter by from token
 *       - in: query
 *         name: toToken
 *         schema:
 *           type: string
 *         description: Filter by to token
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for filtering
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for filtering
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
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
 *                     walletAddress:
 *                       type: string
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *                     count:
 *                       type: number
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Wallet address required
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Server error
 */
router.get('/history', optionalAuth, transactionController.getUserTransactions);

/**
 * @swagger
 * /api/transactions/{hash}:
 *   get:
 *     summary: Get transaction by hash
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction hash
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
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
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Transaction hash required
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
router.get('/:hash', transactionController.getTransactionByHash);

/**
 * @swagger
 * /api/transactions/{hash}/status:
 *   put:
 *     summary: Update transaction status
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction hash
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed, failed, cancelled, submitted]
 *               blockNumber:
 *                 type: number
 *               gasUsed:
 *                 type: number
 *               errorMessage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction status updated successfully
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
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.put('/:hash/status', transactionController.updateTransactionStatus);

/**
 * @swagger
 * /api/transactions/stats:
 *   get:
 *     summary: Get transaction statistics
 *     tags: [Transactions]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: walletAddress
 *         schema:
 *           type: string
 *         description: Wallet address (if not authenticated)
 *     responses:
 *       200:
 *         description: Transaction stats retrieved successfully
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
 *                     totalTransactions:
 *                       type: number
 *                     completedTransactions:
 *                       type: number
 *                     failedTransactions:
 *                       type: number
 *                     pendingTransactions:
 *                       type: number
 *                     totalVolume:
 *                       type: number
 *                     totalGasUsed:
 *                       type: number
 *                     successRate:
 *                       type: string
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       500:
 *         description: Server error
 */
router.get('/stats', optionalAuth, transactionController.getTransactionStats);

/**
 * @swagger
 * /api/transactions/volume-24h:
 *   get:
 *     summary: Get 24h volume statistics
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: 24h volume retrieved successfully
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
 *                     totalVolume:
 *                       type: number
 *                     transactionCount:
 *                       type: number
 *                     totalGasUsed:
 *                       type: number
 *       500:
 *         description: Server error
 */
router.get('/volume-24h', transactionController.getVolume24h);

/**
 * @swagger
 * /api/transactions/status/{status}:
 *   get:
 *     summary: Get transactions by status
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pending, completed, failed, cancelled, submitted]
 *         description: Transaction status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 100
 *         description: Number of transactions to return
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
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
 *                     status:
 *                       type: string
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *                     count:
 *                       type: number
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Status required
 *       500:
 *         description: Server error
 */
router.get('/status/:status', transactionController.getTransactionsByStatus);

/**
 * @swagger
 * /api/transactions/chain/{chainId}:
 *   get:
 *     summary: Get transactions by chain
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: chainId
 *         required: true
 *         schema:
 *           type: string
 *           enum: [aptos-mainnet, aptos-testnet, aptos-devnet]
 *         description: Chain ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 100
 *         description: Number of transactions to return
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
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
 *                     chainId:
 *                       type: string
 *                     transactions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Transaction'
 *                     count:
 *                       type: number
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Chain ID required
 *       500:
 *         description: Server error
 */
router.get('/chain/:chainId', transactionController.getTransactionsByChain);

/**
 * @swagger
 * /api/transactions/{hash}:
 *   delete:
 *     summary: Delete transaction (admin only)
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction hash
 *     responses:
 *       200:
 *         description: Transaction deleted successfully
 *       400:
 *         description: Transaction hash required
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
router.delete('/:hash', transactionController.deleteTransaction);

/**
 * @swagger
 * /api/transactions/health:
 *   get:
 *     summary: Health check for transaction service
 *     tags: [Transactions]
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
router.get('/health', transactionController.healthCheck);

module.exports = router; 