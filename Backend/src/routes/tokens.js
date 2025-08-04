const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { auth, optionalAuth } = require('../middleware/auth');
const aptosService = require('../services/aptosService');
const logger = require('../utils/logger');

const router = express.Router();

// Get token metadata
router.get('/:tokenAddress/:tokenName', optionalAuth, async (req, res) => {
  try {
    const { tokenAddress, tokenName } = req.params;
    
    if (!aptosService.isValidAddress(tokenAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token address format'
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
        error: 'Invalid address format'
      });
    }
    
    const balances = await aptosService.getAllTokenBalances(userAddress);
    
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
      data: balance
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
    // For now, return a mock list of popular Aptos tokens
    const popularTokens = [
      {
        address: '0x1::aptos_coin::AptosCoin',
        name: 'AptosCoin',
        symbol: 'APT',
        decimals: 8,
        logo: 'https://raw.githubusercontent.com/aptos-labs/aptos-core/main/ecosystem/aptos-token/assets/APT.png',
        description: 'The native token of the Aptos blockchain'
      },
      {
        address: '0x1::coin::USDC',
        name: 'USD Coin',
        symbol: 'USDC',
        decimals: 6,
        logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
        description: 'USD Coin is a stablecoin pegged to the US dollar'
      },
      {
        address: '0x1::coin::USDT',
        name: 'Tether',
        symbol: 'USDT',
        decimals: 6,
        logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
        description: 'Tether is a stablecoin pegged to the US dollar'
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
    
    const transfers = await aptosService.getAccountTransactions(userAddress, { limit: parseInt(limit) });
    
    // Filter transactions related to this specific token
    const tokenTransfers = transfers.filter(tx => 
      tx.payload?.function?.includes(tokenAddress) ||
      tx.payload?.function?.includes(tokenName)
    );
    
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

// Validate token
router.post('/validate', auth, [
  body('tokenAddress').notEmpty().withMessage('Token address is required'),
  body('tokenName').notEmpty().withMessage('Token name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    const { tokenAddress, tokenName } = req.body;
    
    if (!aptosService.isValidAddress(tokenAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token address format'
      });
    }
    
    // Check if token exists on Aptos
    try {
      const metadata = await aptosService.getTokenMetadata(tokenAddress, tokenName);
      
      res.json({
        success: true,
        data: {
          isValid: true,
          metadata: metadata
        }
      });
    } catch (error) {
      res.json({
        success: true,
        data: {
          isValid: false,
          error: 'Token not found on Aptos blockchain'
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