const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');

const { connectDatabase } = require('./config/database');
const { logger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { rateLimiter } = require('./middleware/rateLimiter');
const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes');
const swapRoutes = require('./routes/swap.routes');
const priceRoutes = require('./routes/price.routes');
const { WebSocketService } = require('./services/websocket.service');
const { PriceFeedService } = require('./services/priceFeed.service');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.config');
const { schedulePriceUpdates } = require('./jobs/updatePrices.job'); // Import cron job

// Load environment variables
dotenv.config();

const app = express();
app.set('trust proxy', 1); // Trust the first proxy (e.g., Render)
const server = createServer(app);

// Get allowed origins from environment or use defaults
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:5173', 
  'http://localhost:5174',
  'https://safeswap-token.vercel.app',
  'https://safeswap-frontend.onrender.com'
];

const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins])];

// Log allowed origins for debugging
console.log('Environment ALLOWED_ORIGINS:', process.env.ALLOWED_ORIGINS);
console.log('Final allowed origins:', allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('Request with no origin - allowing');
      return callback(null, true);
    }
    
    console.log('Request origin:', origin);
    console.log('Checking against allowed origins:', allowedOrigins);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      console.log('Origin allowed:', origin);
      return callback(null, true);
    } else {
      console.log('Origin blocked:', origin);
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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

// Apply CORS with error handling
app.use((req, res, next) => {
  cors(corsOptions)(req, res, (err) => {
    if (err) {
      console.error('CORS error:', err.message);
      console.log('Request headers:', req.headers);
      console.log('Request origin:', req.headers.origin);
      
      // For preflight requests, still allow them to pass
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }
      
      return res.status(500).json({
        error: 'CORS Error',
        message: err.message,
        origin: req.headers.origin,
        allowedOrigins: allowedOrigins
      });
    }
    next();
  });
});

app.use(morgan(process.env.LOG_FORMAT || 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// CORS test endpoint
app.get('/cors-test', (req, res) => {
  res.status(200).json({
    message: 'CORS test successful',
    origin: req.headers.origin,
    allowedOrigins: allowedOrigins,
    timestamp: new Date().toISOString()
  });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/swap', swapRoutes);
app.use('/api/price', priceRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'SafeSwap Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      wallet: '/api/wallet',
      swap: '/api/swap',
      price: '/api/price'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Initialize services
const webSocketService = new WebSocketService(io);

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close((err) => {
    if (err) {
      logger.error('Error during server shutdown:', err);
      process.exit(1);
    }
    
    logger.info('Server closed successfully');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Initialize price feed service AFTER database connection
    const priceFeedService = new PriceFeedService();
    await priceFeedService.initialize();
    logger.info('Price feed service initialized');

    // Start the price update cron job
    schedulePriceUpdates();

    const PORT = process.env.PORT || 5000;
    
    server.listen(PORT, () => {
      logger.info(`SafeSwap Backend API server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();

module.exports = app;
