import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { strictRateLimiter } from '@/middleware/rateLimiter';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
const authController = new AuthController();

// Google OAuth routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

// JWT token routes
router.post('/login', strictRateLimiter, authController.login);
router.post('/register', strictRateLimiter, authController.register);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticateToken, authController.logout);

// User profile routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, authController.updateProfile);
router.post('/wallet/connect', authenticateToken, authController.connectWallet);

// Token validation
router.get('/validate', authenticateToken, authController.validateToken);

export default router; 