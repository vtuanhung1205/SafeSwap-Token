const express = require('express');
const { AuthController } = require('../controllers/auth.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { strictRateLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const authController = new AuthController();

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Authenticate with Google OAuth
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - googleId
 *               - email
 *               - name
 *             properties:
 *               googleId:
 *                 type: string
 *                 description: Google user ID
 *                 example: "123456789"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email from Google
 *                 example: "user@gmail.com"
 *               name:
 *                 type: string
 *                 description: User display name from Google
 *                 example: "John Doe"
 *               avatar:
 *                 type: string
 *                 format: url
 *                 description: User avatar URL from Google
 *                 example: "https://lh3.googleusercontent.com/photo.jpg"
 *     responses:
 *       200:
 *         description: Google authentication successful, returns session.
 *       400:
 *         description: Missing required fields.
 *       500:
 *         description: Server error during authentication.
 */
router.post('/google', strictRateLimiter, asyncHandler(authController.googleAuth.bind(authController)));

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile.
 *       401:
 *         description: Unauthorized, session is missing or invalid.
 */
router.get('/profile', authenticate, asyncHandler(authController.getProfile.bind(authController)));

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "New Name"
 *               avatar:
 *                 type: string
 *                 format: url
 *                 example: "https://example.com/new-avatar.jpg"
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized, session is missing or invalid.
 */
router.put('/profile', authenticate, asyncHandler(authController.updateProfile.bind(authController)));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Successfully logged out.
 *       401:
 *         description: Unauthorized, session is missing or invalid.
 */
router.post('/logout', authenticate, asyncHandler(authController.logout.bind(authController)));

/**
 * @swagger
 * /api/auth/validate:
 *   get:
 *     summary: Validate session
 *     tags: [Auth]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Session is valid.
 *       401:
 *         description: Session is invalid or expired.
 */
router.get('/validate', authenticate, asyncHandler(authController.validateSession.bind(authController)));

/**
 * @swagger
 * /api/auth/status:
 *   get:
 *     summary: Get authentication status
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Returns authentication status and user info if authenticated.
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
 *                     isAuthenticated:
 *                       type: boolean
 *                     user:
 *                       type: object
 *                       nullable: true
 */
router.get('/status', asyncHandler(authController.getAuthStatus.bind(authController)));

module.exports = router;
