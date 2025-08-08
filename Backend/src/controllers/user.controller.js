const { createError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');
const { Transaction } = require('../models/Transaction.model');
const { Wallet } = require('../models/Wallet.model');

class UserController {
  async getUserStats(req, res, next) {
    try {
      const userId = req.user._id;
      
      // Get basic stats from transactions
      const stats = await Transaction.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: null,
            totalSwaps: { $sum: { $cond: [{ $eq: ['$type', 'swap'] }, 1, 0] } },
            totalVolume: { $sum: { $cond: [{ $eq: ['$type', 'swap'] }, '$amount', 0] } },
            totalTransactions: { $sum: 1 },
            successRate: {
              $avg: {
                $cond: [
                  { $eq: ['$status', 'confirmed'] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      // Get wallet info for additional stats
      const wallet = await Wallet.findOne({ userId });
      let walletBalance = 0;
      if (wallet) {
        walletBalance = wallet.balance || 0;
      }

      const result = stats[0] || {
        totalSwaps: 0,
        totalVolume: 0,
        totalTransactions: 0,
        successRate: 0
      };

      // Calculate average swap amount
      const avgAmount = result.totalSwaps > 0 ? result.totalVolume / result.totalSwaps : 0;

      logger.info(`Retrieved stats for user ${userId}`);

      res.json({
        success: true,
        data: {
          totalSwaps: result.totalSwaps,
          totalVolume: result.totalVolume,
          successRate: Math.round(result.successRate * 100),
          avgAmount: avgAmount,
          walletBalance: walletBalance
        }
      });
    } catch (error) {
      logger.error('Failed to get user stats:', error);
      next(error);
    }
  }

  async getSwapHistory(req, res, next) {
    try {
      const userId = req.user._id;
      const { limit = 10, offset = 0 } = req.query;

      const swaps = await Transaction.find({
        userId,
        type: 'swap'
      })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .populate('wallet', 'address');

      const total = await Transaction.countDocuments({
        userId,
        type: 'swap'
      });

      logger.info(`Retrieved ${swaps.length} swaps for user ${userId}`);

      res.json({
        success: true,
        data: {
          swaps: swaps.map(swap => swap.toJSON()),
          pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: total > parseInt(offset) + swaps.length
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get swap history:', error);
      next(error);
    }
  }

  async getUserActivity(req, res, next) {
    try {
      const userId = req.user._id;
      const { limit = 20, offset = 0 } = req.query;

      const activities = await Transaction.find({
        userId
      })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .populate('wallet', 'address');

      const total = await Transaction.countDocuments({ userId });

      logger.info(`Retrieved ${activities.length} activities for user ${userId}`);

      res.json({
        success: true,
        data: {
          activities: activities.map(activity => activity.toJSON()),
          pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: total > parseInt(offset) + activities.length
          }
        }
      });
    } catch (error) {
      logger.error('Failed to get user activity:', error);
      next(error);
    }
  }
}

module.exports = { UserController }; 