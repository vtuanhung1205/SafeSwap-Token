import { Router } from 'express';
import { SwapController } from '@/controllers/swap.controller';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
const swapController = new SwapController();

// Swap routes
router.post('/quote', authenticateToken, swapController.getSwapQuote);
router.post('/execute', authenticateToken, swapController.executeSwap);

// Swap history routes
router.get('/history', authenticateToken, swapController.getSwapHistory);
router.get('/history/:transactionId', authenticateToken, swapController.getSwapDetails);

// Swap statistics
router.get('/stats', authenticateToken, swapController.getSwapStats);

export default router; 