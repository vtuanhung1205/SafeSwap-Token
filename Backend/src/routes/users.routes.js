const express = require('express');
const { UserController } = require('../controllers/user.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const userController = new UserController();

/**
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.get('/stats', verifyToken, asyncHandler(userController.getUserStats.bind(userController)));

/**
 * @swagger
 * /api/users/swap-history:
 *   get:
 *     summary: Get user swap history
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of swaps to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of swaps to skip
 *     responses:
 *       200:
 *         description: Swap history retrieved successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.get('/swap-history', verifyToken, asyncHandler(userController.getSwapHistory.bind(userController)));

/**
 * @swagger
 * /api/users/activity:
 *   get:
 *     summary: Get user activity
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of activities to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of activities to skip
 *     responses:
 *       200:
 *         description: User activity retrieved successfully.
 *       401:
 *         description: Unauthorized, token is missing or invalid.
 */
router.get('/activity', verifyToken, asyncHandler(userController.getUserActivity.bind(userController)));

module.exports = router; 