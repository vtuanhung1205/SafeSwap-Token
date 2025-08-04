const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SafeSwap Backend API - Optimized for Production',
    version: '2.0.0',
    description:
      'This is the official API documentation for the SafeSwap Backend service. Optimized for production with wallet-based authentication and CoinGecko integration. Provides endpoints for user sessions, token swapping, price information, and transaction history.',
    contact: {
      name: 'SafeSwap Team',
      url: 'https://safeswap.io',
      email: 'support@safeswap.io',
    },
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Development server',
    },
    {
      url: 'https://safeswap-backend-service.onrender.com',
      description: 'Production server (Render)',
    },
  ],
  components: {
    securitySchemes: {
      sessionAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Session-ID',
        description: 'Session ID for wallet-based authentication'
      },
    },
  },
  security: [
    {
      sessionAuth: [],
    },
  ],
  tags: [
    {
      name: 'User',
      description: 'User session and wallet management'
    },
    {
      name: 'Swap',
      description: 'Token swapping operations'
    },
    {
      name: 'Tokens',
      description: 'Token information and price data from CoinGecko'
    },
    {
      name: 'Transactions',
      description: 'Transaction history and status tracking'
    }
  ]
};

const options = {
  swaggerDefinition,
  // Path to the API docs
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec; 