const express = require('express');
const { AuthController } = require('../controllers/auth.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { strictRateLimiter } = require('../middleware/rateLimiter');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
const authController = new AuthController();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *               avatar:
 *                 type: string
 *                 format: url
 *                 example: https://example.com/avatar.jpg
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Bad request (e.g., missing fields, invalid email).
 *       409:
 *         description: User with this email already exists.
 */
router.post('/register', strictRateLimiter, asyncHandler(authController.register.bind(authController)));

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful, returns access and refresh tokens.
 *       400:
 *         description: Invalid credentials or missing fields.
 *       401:
 *         description: Unauthorized, incorrect password.
 */
router.post('/login', strictRateLimiter, asyncHandler(authController.login.bind(authController)));

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
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Google OAuth token
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
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token received during login
 *     responses:
 *       200:
 *         description: Successfully refreshed access token.
 *       400:
 *         description: Invalid or missing refresh token.
 *       401:
 *         description: Refresh token expired or invalid.
 */
router.post('/refresh', asyncHandler(authController.refreshToken.bind(authController)));

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

/**
 * @swagger
 * /api/auth/validate:
 *   get:
 *     summary: Validate access token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid.
 *       401:
 *         description: Token is invalid or expired.
 */
router.get('/validate', verifyToken, asyncHandler(authController.validateToken.bind(authController)));

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent.
 *       400:
 *         description: Email not provided or invalid.
 *       404:
 *         description: User with this email not found.
 */
router.post('/forgot-password', strictRateLimiter, asyncHandler(authController.forgotPassword.bind(authController)));

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *                 description: Reset token received via email
 *               password:
 *                 type: string
 *                 format: password
 *                 example: newpassword123
 *     responses:
 *       200:
 *         description: Password reset successful.
 *       400:
 *         description: Invalid or missing token/password.
 *       401:
 *         description: Invalid or expired reset token.
 */
router.post('/reset-password', strictRateLimiter, asyncHandler(authController.resetPassword.bind(authController)));


module.exports = router;
