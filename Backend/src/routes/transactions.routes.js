const express = require('express');
const { TransactionController } = require('../controllers/transaction.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { verifyToken } = require('../middleware/auth');
const { standardRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const transactionController = new TransactionController();

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get user transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of transactions to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of transactions to skip
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, swap, transfer, receive]
 *         description: Filter by transaction type
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.get('/', verifyToken, asyncHandler(transactionController.getUserTransactions.bind(transactionController)));

/**
 * @swagger
 * /api/transactions/{hash}:
 *   get:
 *     summary: Get transaction by hash
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction hash
 *     responses:
 *       200:
 *         description: Transaction details retrieved successfully.
 *       404:
 *         description: Transaction not found.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.get('/:hash', verifyToken, asyncHandler(transactionController.getTransaction.bind(transactionController)));

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - amount
 *               - tokenAddress
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [swap, transfer, receive]
 *               amount:
 *                 type: number
 *               tokenAddress:
 *                 type: string
 *               toAddress:
 *                 type: string
 *               fromToken:
 *                 type: string
 *               toToken:
 *                 type: string
 *     responses:
 *       201:
 *         description: Transaction created successfully.
 *       400:
 *         description: Invalid transaction data.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.post('/', verifyToken, asyncHandler(transactionController.createTransaction.bind(transactionController)));

/**
 * @swagger
 * /api/transactions/{hash}:
 *   put:
 *     summary: Update transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
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
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, failed]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction updated successfully.
 *       404:
 *         description: Transaction not found.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.put('/:hash', verifyToken, asyncHandler(transactionController.updateTransaction.bind(transactionController)));

/**
 * @swagger
 * /api/transactions/stats/summary:
 *   get:
 *     summary: Get transaction statistics summary
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [24h, 7d, 30d, 90d]
 *           default: 7d
 *         description: Time range for statistics
 *     responses:
 *       200:
 *         description: Transaction statistics retrieved successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.get('/stats/summary', verifyToken, asyncHandler(transactionController.getTransactionStats.bind(transactionController)));

/**
 * @swagger
 * /api/transactions/analytics/overview:
 *   get:
 *     summary: Get transaction analytics overview
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: daily
 *         description: Analytics period
 *     responses:
 *       200:
 *         description: Transaction analytics retrieved successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.get('/analytics/overview', verifyToken, asyncHandler(transactionController.getTransactionAnalytics.bind(transactionController)));

/**
 * @swagger
 * /api/transactions/export/csv:
 *   get:
 *     summary: Export transactions to CSV
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for export
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for export
 *     responses:
 *       200:
 *         description: CSV file generated successfully.
 *         content:
 *           text/csv:
 *             schema:
 *               type: string
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.get('/export/csv', verifyToken, asyncHandler(transactionController.exportTransactions.bind(transactionController)));

/**
 * @swagger
 * /api/transactions/monitor/{address}:
 *   post:
 *     summary: Start monitoring address for transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Address to monitor
 *     responses:
 *       200:
 *         description: Address monitoring started successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.post('/monitor/:address', verifyToken, asyncHandler(transactionController.startMonitoring.bind(transactionController)));

/**
 * @swagger
 * /api/transactions/monitor/{address}:
 *   delete:
 *     summary: Stop monitoring address for transactions
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Address to stop monitoring
 *     responses:
 *       200:
 *         description: Address monitoring stopped successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.delete('/monitor/:address', verifyToken, asyncHandler(transactionController.stopMonitoring.bind(transactionController)));

module.exports = router; 