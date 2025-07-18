const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Basic routes
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'SafeSwap Backend API',
    status: 'running',
    version: '1.0.0'
  });
});

// Simple API routes
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'API healthy' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ SafeSwap Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
