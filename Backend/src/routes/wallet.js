const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const walletService = require('../services/walletService');
const { auth, optionalAuth } = require('../middleware/auth');
const logger = require('../utils/logger');
const User = require('../models/User'); // Added missing import for User model

// Get supported wallets
router.get('/supported', optionalAuth, async (req, res) => {
  try {
    const wallets = walletService.getSupportedWallets();
    
    res.json({
      success: true,
      data: wallets
    });
  } catch (error) {
    logger.error('Error getting supported wallets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get supported wallets'
    });
  }
});

// Generate new wallet
router.post('/generate', auth, async (req, res) => {
  try {
    const wallet = await walletService.generateWallet();
    
    res.json({
      success: true,
      data: wallet,
      message: 'Wallet generated successfully'
    });
  } catch (error) {
    logger.error('Error generating wallet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate wallet'
    });
  }
});

// Import wallet
router.post('/import', auth, [
  body('privateKey').isString().notEmpty().withMessage('Private key is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { privateKey } = req.body;
    
    const wallet = await walletService.importWallet(privateKey);
    
    res.json({
      success: true,
      data: wallet,
      message: 'Wallet imported successfully'
    });
  } catch (error) {
    logger.error('Error importing wallet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import wallet'
    });
  }
});

// Get wallet info for current user
router.get('/info', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    if (!user.walletAddress) {
      return res.json({
        success: true,
        data: {
          wallet: null,
          message: 'No wallet connected'
        }
      });
    }
    
    const walletInfo = await walletService.getWalletInfo(user.walletAddress);
    
    res.json({
      success: true,
      data: {
        wallet: {
          address: user.walletAddress,
          type: user.walletType,
          ...walletInfo
        }
      }
    });
  } catch (error) {
    logger.error('Error getting current user wallet info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get wallet info'
    });
  }
});

// Get wallet info
router.get('/info/:address', auth, async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!walletService.validateWalletAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }
    
    const walletInfo = await walletService.getWalletInfo(address);
    
    res.json({
      success: true,
      data: walletInfo
    });
  } catch (error) {
    logger.error('Error getting wallet info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get wallet info'
    });
  }
});

// Get wallet balance
router.get('/balance/:address', auth, async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!walletService.validateWalletAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }
    
    const balance = await walletService.getWalletBalance(address);
    
    res.json({
      success: true,
      data: balance
    });
  } catch (error) {
    logger.error('Error getting wallet balance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get wallet balance'
    });
  }
});

// Get wallet tokens
router.get('/tokens/:address', auth, async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!walletService.validateWalletAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }
    
    const tokens = await walletService.getWalletTokens(address);
    
    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    logger.error('Error getting wallet tokens:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get wallet tokens'
    });
  }
});

// Check wallet connection
router.post('/check-connection', auth, [
  body('address').isString().notEmpty().withMessage('Wallet address is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { address } = req.body;
    
    const connection = await walletService.checkWalletConnection(address);
    
    res.json({
      success: true,
      data: connection
    });
  } catch (error) {
    logger.error('Error checking wallet connection:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check wallet connection'
    });
  }
});

// Validate transaction
router.post('/validate-transaction', auth, [
  body('senderAddress').isString().notEmpty().withMessage('Sender address is required'),
  body('toAddress').isString().notEmpty().withMessage('Recipient address is required'),
  body('amount').isString().notEmpty().withMessage('Amount is required'),
  body('tokenAddress').isString().notEmpty().withMessage('Token address is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { senderAddress, toAddress, amount, tokenAddress } = req.body;
    
    const validation = await walletService.validateTransaction(senderAddress, toAddress, amount, tokenAddress);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    logger.error('Error validating transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate transaction'
    });
  }
});

// Estimate transaction fee
router.post('/estimate-fee', auth, [
  body('senderAddress').isString().notEmpty().withMessage('Sender address is required'),
  body('toAddress').isString().notEmpty().withMessage('Recipient address is required'),
  body('amount').isString().notEmpty().withMessage('Amount is required'),
  body('tokenAddress').isString().notEmpty().withMessage('Token address is required'),
  body('tokenName').isString().notEmpty().withMessage('Token name is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { senderAddress, toAddress, amount, tokenAddress, tokenName } = req.body;
    
    // Create payload for estimation
    const payload = require('../services/aptosService').createTransferPayload(toAddress, amount, tokenAddress, tokenName);
    
    const estimation = await walletService.estimateTransactionFee(senderAddress, payload);
    
    res.json({
      success: true,
      data: estimation
    });
  } catch (error) {
    logger.error('Error estimating transaction fee:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to estimate transaction fee'
    });
  }
});

// Create transfer transaction
router.post('/transfer', auth, [
  body('privateKey').isString().notEmpty().withMessage('Private key is required'),
  body('toAddress').isString().notEmpty().withMessage('Recipient address is required'),
  body('amount').isString().notEmpty().withMessage('Amount is required'),
  body('tokenAddress').isString().notEmpty().withMessage('Token address is required'),
  body('tokenName').isString().notEmpty().withMessage('Token name is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { privateKey, toAddress, amount, tokenAddress, tokenName } = req.body;
    
    const result = await walletService.createTransferTransaction(privateKey, toAddress, amount, tokenAddress, tokenName);
    
    res.json({
      success: true,
      data: result,
      message: 'Transaction submitted successfully'
    });
  } catch (error) {
    logger.error('Error creating transfer transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transfer transaction'
    });
  }
});

// Get transaction history
router.get('/history/:address', auth, async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = 50 } = req.query;
    
    if (!walletService.validateWalletAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }
    
    const history = await walletService.getTransactionHistory(address, parseInt(limit));
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    logger.error('Error getting transaction history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transaction history'
    });
  }
});

// Generate wallet QR code
router.post('/qr-code', auth, [
  body('address').isString().notEmpty().withMessage('Wallet address is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { address } = req.body;
    
    if (!walletService.validateWalletAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid wallet address'
      });
    }
    
    const qrData = walletService.generateWalletQRData(address);
    
    res.json({
      success: true,
      data: qrData
    });
  } catch (error) {
    logger.error('Error generating wallet QR code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate wallet QR code'
    });
  }
});

// Parse wallet QR code
router.post('/parse-qr', auth, [
  body('qrData').isString().notEmpty().withMessage('QR code data is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { qrData } = req.body;
    
    const parsedData = walletService.parseWalletQRData(qrData);
    
    res.json({
      success: true,
      data: parsedData
    });
  } catch (error) {
    logger.error('Error parsing wallet QR code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to parse wallet QR code'
    });
  }
});

// Validate wallet address
router.post('/validate-address', optionalAuth, [
  body('address').isString().notEmpty().withMessage('Wallet address is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { address } = req.body;
    
    const isValid = walletService.validateWalletAddress(address);
    
    res.json({
      success: true,
      data: {
        address,
        isValid
      }
    });
  } catch (error) {
    logger.error('Error validating wallet address:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate wallet address'
    });
  }
});

module.exports = router; 