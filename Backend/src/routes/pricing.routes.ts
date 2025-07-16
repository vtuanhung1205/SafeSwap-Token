import { Router } from 'express';
import { MockPricingController } from '@/controllers/mockPricing.controller';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
const pricingController = new MockPricingController();

// Public routes
router.get('/tokens', pricingController.getAllTokenPrices);
router.get('/token/:symbol', pricingController.getTokenPrice);
router.get('/historical/:symbol', pricingController.getHistoricalData);
router.get('/market-overview', pricingController.getMarketOverview);
router.get('/trending', pricingController.getTrendingTokens);

// Protected routes (require authentication)
router.use(authenticateToken);
router.get('/portfolio', pricingController.getPortfolioPrices);
router.post('/watchlist/add', pricingController.addToWatchlist);
router.delete('/watchlist/remove/:tokenId', pricingController.removeFromWatchlist);
router.get('/watchlist', pricingController.getWatchlist);

export default router;
