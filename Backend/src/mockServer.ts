import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cron from 'node-cron';

import { logger } from '@/utils/logger';
import { MockAuthController } from '@/controllers/mockAuth.controller';
import { MockPricingController } from '@/controllers/mockPricing.controller';
import { mockDB } from '@/services/mockDatabase.service';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Initialize controllers
const authController = new MockAuthController();
const pricingController = new MockPricingController();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SafeSwap Backend running with Mock Database',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
const apiVersion = process.env.API_VERSION || 'v1';

// Auth routes
app.post(`/api/${apiVersion}/auth/register`, authController.register);
app.post(`/api/${apiVersion}/auth/login`, authController.login);
app.post(`/api/${apiVersion}/auth/logout`, authController.logout);
app.get(`/api/${apiVersion}/auth/profile`, authController.getProfile);

// Pricing routes
app.get(`/api/${apiVersion}/pricing/tokens`, pricingController.getAllTokenPrices);
app.get(`/api/${apiVersion}/pricing/token/:symbol`, pricingController.getTokenPrice);
app.get(`/api/${apiVersion}/pricing/historical/:symbol`, pricingController.getHistoricalData);
app.get(`/api/${apiVersion}/pricing/market-overview`, pricingController.getMarketOverview);
app.get(`/api/${apiVersion}/pricing/trending`, pricingController.getTrendingTokens);

// Debug endpoint to see all data
app.get(`/api/${apiVersion}/debug/data`, (req, res) => {
  const data = mockDB.getAllData();
  res.json({
    success: true,
    data: {
      users_count: data.users.length,
      tokens_count: data.tokenPrices.length,
      users: data.users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      })), // Don't expose passwords
      tokens: data.tokenPrices
    },
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });

  res.status(error.statusCode || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message,
    timestamp: new Date().toISOString()
  });
});

// Schedule price updates every 30 seconds
cron.schedule('*/30 * * * * *', () => {
  mockDB.updatePricesRandomly();
});

const PORT = process.env.PORT || 1573;

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 SafeSwap Mock Backend Server running on port ${PORT}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`💾 Using In-Memory Mock Database (No MongoDB required)`);
  logger.info(`📊 Auto-updating token prices every 30 seconds`);
  logger.info(`🔗 API Base URL: http://localhost:${PORT}/api/v1`);
  logger.info(`📋 Available endpoints:`);
  logger.info(`   - POST /api/v1/auth/register`);
  logger.info(`   - POST /api/v1/auth/login`);
  logger.info(`   - GET /api/v1/pricing/tokens`);
  logger.info(`   - GET /api/v1/pricing/token/:symbol`);
  logger.info(`   - GET /api/v1/debug/data`);
});

export default app;
