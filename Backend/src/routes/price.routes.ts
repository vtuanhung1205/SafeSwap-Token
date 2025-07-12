import { Router } from 'express';
import { PriceController } from '@/controllers/price.controller';
import { optionalAuth } from '@/middleware/auth';

const router = Router();
const priceController = new PriceController();

// Price information routes
router.get('/all', optionalAuth, priceController.getAllPrices);
router.get('/token/:symbol', optionalAuth, priceController.getTokenPrice);
router.get('/exchange-rate', optionalAuth, priceController.getExchangeRate);

// Price analysis routes
router.post('/analyze', optionalAuth, priceController.analyzeToken);
router.post('/batch-analyze', optionalAuth, priceController.batchAnalyzeTokens);

export default router; 