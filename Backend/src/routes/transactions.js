const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const transactionService = require('../services/transactionService');
const aptosService = require('../services/aptosService');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

// Get user transactions
router.get('/', auth, async (req, res) => {
  try {
    const { 
      limit = 50, 
      offset = 0, 
      status, 
      type, 
      fromDate, 
      toDate,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
      status,
      type,
      fromDate,
      toDate,
      sortBy,
      sortOrder
    };

    const transactions = await transactionService.getUserTransactions(req.user.id, options);
    
    res.json({
      success: true,
      data: transactions,
      pagination: {
        limit: options.limit,
        offset: options.offset,
        total: transactions.length
      }
    });
  } catch (error) {
    logger.error('Error getting user transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transactions'
    });
  }
});

// Get transaction by hash
router.get('/:hash', auth, async (req, res) => {
  try {
    const { hash } = req.params;
    
    const transaction = await transactionService.getTransactionByHash(hash);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    // Check if user owns this transaction
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    logger.error('Error getting transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transaction'
    });
  }
});

// Create new transaction
router.post('/', auth, [
  body('toAddress').isString().notEmpty().withMessage('Recipient address is required'),
  body('amount').isString().notEmpty().withMessage('Amount is required'),
  body('tokenAddress').isString().notEmpty().withMessage('Token address is required'),
  body('tokenName').isString().notEmpty().withMessage('Token name is required'),
  body('tokenSymbol').isString().notEmpty().withMessage('Token symbol is required'),
  body('type').isIn(['transfer', 'swap', 'mint', 'burn', 'approve']).withMessage('Invalid transaction type')
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

    const {
      toAddress,
      amount,
      tokenAddress,
      tokenName,
      tokenSymbol,
      type,
      notes,
      tags
    } = req.body;

    // Validate addresses
    if (!aptosService.isValidAddress(toAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid recipient address'
      });
    }

    if (!aptosService.isValidAddress(tokenAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token address'
      });
    }

    // Create transaction data
    const transactionData = {
      userId: req.user.id,
      fromAddress: req.user.walletAddress,
      toAddress,
      tokenAddress,
      tokenName,
      tokenSymbol,
      amount,
      amountInDecimals: 8, // Default, should be fetched from token metadata
      type,
      notes,
      tags: tags || []
    };

    const transaction = await transactionService.createTransaction(transactionData);
    
    // Analyze transaction for risk
    await transactionService.analyzeTransactionRisk(transaction);
    
    res.status(201).json({
      success: true,
      data: transaction,
      message: 'Transaction created successfully'
    });
  } catch (error) {
    logger.error('Error creating transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create transaction'
    });
  }
});

// Update transaction
router.put('/:hash', auth, async (req, res) => {
  try {
    const { hash } = req.params;
    const { notes, tags } = req.body;

    const transaction = await transactionService.getTransactionByHash(hash);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }
    
    // Check if user owns this transaction
    if (transaction.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Update allowed fields
    if (notes !== undefined) transaction.notes = notes;
    if (tags !== undefined) transaction.tags = tags;
    
    await transaction.save();
    
    res.json({
      success: true,
      data: transaction,
      message: 'Transaction updated successfully'
    });
  } catch (error) {
    logger.error('Error updating transaction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update transaction'
    });
  }
});

// Get transaction statistics
router.get('/stats/summary', auth, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    
    const stats = await transactionService.getTransactionStats(req.user.id, timeRange);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting transaction stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transaction statistics'
    });
  }
});

// Get transaction analytics
router.get('/analytics/overview', auth, async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    
    const options = {};
    if (fromDate) options.fromDate = fromDate;
    if (toDate) options.toDate = toDate;
    
    const transactions = await transactionService.getUserTransactions(req.user.id, options);
    
    // Calculate analytics
    const analytics = {
      totalTransactions: transactions.length,
      totalVolume: transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0),
      byStatus: {},
      byType: {},
      byToken: {},
      riskAnalysis: {
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0,
        scamDetected: 0
      }
    };
    
    transactions.forEach(tx => {
      // Count by status
      analytics.byStatus[tx.status] = (analytics.byStatus[tx.status] || 0) + 1;
      
      // Count by type
      analytics.byType[tx.type] = (analytics.byType[tx.type] || 0) + 1;
      
      // Count by token
      analytics.byToken[tx.tokenSymbol] = (analytics.byToken[tx.tokenSymbol] || 0) + 1;
      
      // Risk analysis
      if (tx.riskScore >= 70) analytics.riskAnalysis.highRisk++;
      else if (tx.riskScore >= 30) analytics.riskAnalysis.mediumRisk++;
      else analytics.riskAnalysis.lowRisk++;
      
      if (tx.aiAnalysis?.isScam) analytics.riskAnalysis.scamDetected++;
    });
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error getting transaction analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transaction analytics'
    });
  }
});

// Export transactions
router.get('/export/csv', auth, async (req, res) => {
  try {
    const { fromDate, toDate } = req.query;
    
    const options = { limit: 1000 }; // Maximum export limit
    if (fromDate) options.fromDate = fromDate;
    if (toDate) options.toDate = toDate;
    
    const transactions = await transactionService.getUserTransactions(req.user.id, options);
    
    // Generate CSV
    const csvHeader = 'Hash,From,To,Token,Amount,Type,Status,Timestamp,Risk Score\n';
    const csvRows = transactions.map(tx => 
      `${tx.hash},${tx.fromAddress},${tx.toAddress},${tx.tokenSymbol},${tx.formattedAmount},${tx.type},${tx.status},${tx.timestamp},${tx.riskScore}`
    ).join('\n');
    
    const csv = csvHeader + csvRows;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csv);
  } catch (error) {
    logger.error('Error exporting transactions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export transactions'
    });
  }
});

// Monitor address transactions
router.post('/monitor/:address', auth, async (req, res) => {
  try {
    const { address } = req.params;
    
    if (!aptosService.isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid address format'
      });
    }
    
    await transactionService.addAddressToMonitoring(address);
    
    res.json({
      success: true,
      message: 'Address added to monitoring'
    });
  } catch (error) {
    logger.error('Error adding address to monitoring:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add address to monitoring'
    });
  }
});

// Stop monitoring address
router.delete('/monitor/:address', auth, async (req, res) => {
  try {
    const { address } = req.params;
    
    await transactionService.removeAddressFromMonitoring(address);
    
    res.json({
      success: true,
      message: 'Address removed from monitoring'
    });
  } catch (error) {
    logger.error('Error removing address from monitoring:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove address from monitoring'
    });
  }
});

module.exports = router; 