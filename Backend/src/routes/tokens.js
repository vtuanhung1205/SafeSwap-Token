const express = require('express');
const router = express.Router();

const aptosService = require('../services/aptosService');
const { auth, optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

// Get token metadata
router.get('/:tokenAddress/:tokenName', optionalAuth, async (req, res) => {
  try {
    const { tokenAddress, tokenName } = req.params;
    
    if (!aptosService.isValidAddress(tokenAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token address'
      });
    }
    
    const metadata = await aptosService.getTokenMetadata(tokenAddress, tokenName);
    
    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    logger.error('Error getting token metadata:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get token metadata'
    });
  }
});

// Get user token balances
router.get('/balances', auth, async (req, res) => {
  try {
    const { address } = req.query;
    const userAddress = address || req.user.walletAddress;
    
    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }
    
    if (!aptosService.isValidAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }
    
    // Get account resources to find all tokens
    const resources = await aptosService.getAccountResources(userAddress);
    
    const balances = [];
    
    // Parse coin resources
    for (const resource of resources) {
      if (resource.type.includes('::coin::CoinStore<')) {
        const tokenInfo = resource.type.match(/CoinStore<(.+)>/);
        if (tokenInfo) {
          const fullTokenType = tokenInfo[1];
          const [tokenAddress, tokenName] = fullTokenType.split('::');
          
          try {
            const balance = await aptosService.getTokenBalance(
              userAddress, 
              tokenAddress, 
              tokenName
            );
            
            if (balance.amount !== '0') {
              balances.push({
                tokenAddress,
                tokenName,
                fullTokenType,
                balance: balance.amount,
                decimals: balance.decimals
              });
            }
          } catch (error) {
            logger.error(`Error getting balance for ${fullTokenType}:`, error);
          }
        }
      }
    }
    
    res.json({
      success: true,
      data: balances
    });
  } catch (error) {
    logger.error('Error getting token balances:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get token balances'
    });
  }
});

// Get specific token balance
router.get('/balance/:tokenAddress/:tokenName', auth, async (req, res) => {
  try {
    const { tokenAddress, tokenName } = req.params;
    const { address } = req.query;
    const userAddress = address || req.user.walletAddress;
    
    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }
    
    if (!aptosService.isValidAddress(tokenAddress) || !aptosService.isValidAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format'
      });
    }
    
    const balance = await aptosService.getTokenBalance(userAddress, tokenAddress, tokenName);
    
    res.json({
      success: true,
      data: {
        tokenAddress,
        tokenName,
        balance: balance.amount,
        decimals: balance.decimals,
        formattedBalance: (parseFloat(balance.amount) / Math.pow(10, balance.decimals)).toFixed(balance.decimals)
      }
    });
  } catch (error) {
    logger.error('Error getting token balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get token balance'
    });
  }
});

// Get popular tokens
router.get('/popular/list', optionalAuth, async (req, res) => {
  try {
    // This would typically come from a database or external API
    // For now, return a static list of popular Aptos tokens
    const popularTokens = [
      {
        address: '0x1::aptos_coin::AptosCoin',
        name: 'AptosCoin',
        symbol: 'APT',
        decimals: 8,
        logo: 'https://raw.githubusercontent.com/aptos-labs/aptos-core/main/ecosystem/aptos-token/assets/APT.png'
      },
      {
        address: '0x1000000fa32d122c18a6a31c009ce5e71674f22d06ae5817d427082c4b31880c::coin::T',
        name: 'T',
        symbol: 'T',
        decimals: 6,
        logo: null
      },
      {
        address: '0x1000000fa32d122c18a6a31c009ce5e71674f22d06ae5817d427082c4b31880c::coin::USDC',
        name: 'USDC',
        symbol: 'USDC',
        decimals: 6,
        logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png'
      }
    ];
    
    res.json({
      success: true,
      data: popularTokens
    });
  } catch (error) {
    logger.error('Error getting popular tokens:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get popular tokens'
    });
  }
});

// Search tokens
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters long'
      });
    }
    
    // This would typically search a database of known tokens
    // For now, return a mock response
    const searchResults = [
      {
        address: '0x1::aptos_coin::AptosCoin',
        name: 'AptosCoin',
        symbol: 'APT',
        decimals: 8,
        logo: 'https://raw.githubusercontent.com/aptos-labs/aptos-core/main/ecosystem/aptos-token/assets/APT.png'
      }
    ].filter(token => 
      token.name.toLowerCase().includes(query.toLowerCase()) ||
      token.symbol.toLowerCase().includes(query.toLowerCase())
    );
    
    res.json({
      success: true,
      data: searchResults.slice(0, parseInt(limit))
    });
  } catch (error) {
    logger.error('Error searching tokens:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search tokens'
    });
  }
});

// Get token price (placeholder)
router.get('/price/:tokenAddress/:tokenName', optionalAuth, async (req, res) => {
  try {
    const { tokenAddress, tokenName } = req.params;
    
    // This would integrate with price APIs like CoinGecko
    // For now, return mock data
    const mockPrice = {
      usd: 1.0,
      usd_24h_change: 0.5,
      usd_24h_vol: 1000000,
      market_cap: 5000000000
    };
    
    res.json({
      success: true,
      data: {
        tokenAddress,
        tokenName,
        price: mockPrice,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting token price:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get token price'
    });
  }
});

// Get token transfer history
router.get('/:tokenAddress/:tokenName/transfers', auth, async (req, res) => {
  try {
    const { tokenAddress, tokenName } = req.params;
    const { address, limit = 20 } = req.query;
    const userAddress = address || req.user.walletAddress;
    
    if (!userAddress) {
      return res.status(400).json({
        success: false,
        error: 'Wallet address is required'
      });
    }
    
    if (!aptosService.isValidAddress(tokenAddress) || !aptosService.isValidAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format'
      });
    }
    
    // Get account transactions
    const transactions = await aptosService.getAccountTransactions(userAddress, parseInt(limit));
    
    // Filter transactions related to this token
    const tokenTransfers = transactions.filter(tx => {
      if (tx.payload && tx.payload.type === 'entry_function_payload') {
        const functionName = tx.payload.function;
        return functionName.includes('transfer') && functionName.includes(tokenName);
      }
      return false;
    });
    
    res.json({
      success: true,
      data: tokenTransfers
    });
  } catch (error) {
    logger.error('Error getting token transfer history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get token transfer history'
    });
  }
});

// Validate token address
router.post('/validate', optionalAuth, async (req, res) => {
  try {
    const { tokenAddress, tokenName } = req.body;
    
    if (!tokenAddress || !tokenName) {
      return res.status(400).json({
        success: false,
        error: 'Token address and name are required'
      });
    }
    
    if (!aptosService.isValidAddress(tokenAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token address format'
      });
    }
    
    try {
      const metadata = await aptosService.getTokenMetadata(tokenAddress, tokenName);
      
      res.json({
        success: true,
        data: {
          isValid: true,
          metadata
        }
      });
    } catch (error) {
      res.json({
        success: true,
        data: {
          isValid: false,
          error: 'Token not found or invalid'
        }
      });
    }
  } catch (error) {
    logger.error('Error validating token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate token'
    });
  }
});

module.exports = router; 