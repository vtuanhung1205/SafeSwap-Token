const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');

const { connectDatabase } = require('./config/database');
const { logger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');

// Import optimized routes
const userRoutes = require('./routes/user.routes');
const swapRoutes = require('./routes/swap.routes');
const tokenRoutes = require('./routes/token.routes');
const transactionRoutes = require('./routes/transaction.routes');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config');

// Load environment variables
dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust the first proxy (e.g., Render)
const server = createServer(app);

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:5173,http://localhost:4173,https://safeswap-frontend.onrender.com,https://safeswap-token.vercel.app').split(',');

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie', 'X-Session-ID'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  },
  path: '/socket.io'
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(morgan(process.env.LOG_FORMAT || 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0'
  });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes - Optimized for production
app.use('/api/user', userRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/transactions', transactionRoutes);

/**
 * Welcome route with API information
 */
app.get('/', (req, res) => {
  res.json({
    message: 'SafeSwap Backend API - Optimized for Production',
    version: '2.0.0',
    description: 'Wallet-based authentication with CoinGecko integration',
    endpoints: {
      user: '/api/user',
      swap: '/api/swap',
      tokens: '/api/tokens',
      transactions: '/api/transactions',
      docs: '/api-docs',
      health: '/health'
    },
    features: [
      'Wallet-based authentication',
      'CoinGecko token integration',
      'Transaction history tracking',
      'Real-time price feeds',
      'Session management'
    ],
    timestamp: new Date().toISOString()
  });
});

/**
 * 404 handler for undefined routes
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

/**
 * Graceful shutdown handler
 */
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

// Listen for shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Start server function
 */
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    const PORT = process.env.PORT || 3001;
    
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Swagger UI available at: http://localhost:${PORT}/api-docs`);
      logger.info(`Health check available at: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;
