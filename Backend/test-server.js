const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Backend is running successfully'
  });
});

// Test Aptos connection
app.get('/test-aptos', async (req, res) => {
  try {
    const { AptosClient } = require('aptos');
    const client = new AptosClient('https://fullnode.mainnet.aptoslabs.com/v1');
    
    const ledgerInfo = await client.getLedgerInfo();
    
    res.json({
      success: true,
      message: 'Aptos connection successful',
      ledgerVersion: ledgerInfo.ledger_version,
      chainId: await client.getChainId()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Aptos test: http://localhost:${PORT}/test-aptos`);
}); 