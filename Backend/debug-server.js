const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Basic middleware
app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    mongodb_uri: process.env.MONGODB_URI ? 'CONFIGURED' : 'NOT_CONFIGURED'
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'SafeSwap Backend API',
    status: 'running',
    env_vars: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGODB_URI: process.env.MONGODB_URI ? 'EXISTS' : 'MISSING',
      JWT_SECRET: process.env.JWT_SECRET ? 'EXISTS' : 'MISSING'
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Debug server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`MongoDB URI: ${process.env.MONGODB_URI ? 'CONFIGURED' : 'NOT_CONFIGURED'}`);
});

module.exports = app;
