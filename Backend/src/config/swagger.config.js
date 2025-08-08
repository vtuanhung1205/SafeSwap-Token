const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SafeSwap Backend API',
    version: '1.0.0',
    description:
      'This is the official API documentation for the SafeSwap Backend service. It provides endpoints for user authentication, wallet management, token swapping, and price information.',
    contact: {
      name: 'SafeSwap Team',
      url: 'https://safeswap.io', // Replace with your actual project URL
      email: 'support@safeswap.io', // Replace with your support email
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server',
    },
    {
      url: 'https://safeswap-backend-service.onrender.com',
      description: 'Production server (Render)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  // Path to the API docs
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec; 