import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { authenticate } from '@/middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);

// Protected routes
router.get('/profile', authenticate(), authController.getProfile);
router.put('/profile', authenticate(), authController.updateProfile);
router.get('/validate', authenticate(), authController.validateToken);

export default router; 