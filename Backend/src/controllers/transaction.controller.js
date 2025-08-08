const { Transaction } = require('../models/Transaction.model');
const { createError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

class TransactionController {
  async getUserTransactions(req, res, next) {
    try {
      const userId = req.user._id;
      const { limit = 50, offset = 0, type = 'all' } = req.query;

      // Build query
      const query = { userId };
      
      if (type !== 'all') {
        query.type = type;
      }

      // Get transactions with pagination
      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .populate('wallet', 'address');

      // Get total count
      const total = await Transaction.countDocuments(query);

      logger.info(`Retrieved ${transactions.length} transactions for user ${userId}`);

      res.json({
        success: true,
        data: {
          transactions: transactions.map(tx => tx.toJSON()),
          pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: total > parseInt(offset) + transactions.length
          }
        },
      });
    } catch (error) {
      logger.error('Failed to get user transactions:', error);
      next(error);
    }
  }
}

module.exports = { TransactionController }; 