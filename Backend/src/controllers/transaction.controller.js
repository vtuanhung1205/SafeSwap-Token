const transactionService = require('../services/transaction.service');
const { logger } = require('../utils/logger');

/**
 * Transaction Controller - Quản lý lịch sử swap transactions
 * Tối ưu cho production, chỉ lưu thông tin cần thiết
 */
class TransactionController {
  /**
   * Lấy lịch sử transactions của user
   * @route GET /api/transactions/history
   */
  async getUserTransactions(req, res) {
    try {
      const walletAddress = req.user?.walletAddress || req.query.walletAddress;
      
      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          message: 'Wallet address is required'
        });
      }

      const { limit, status, fromToken, toToken, startDate, endDate } = req.query;
      const options = {
        limit: limit ? parseInt(limit) : 50,
        status,
        fromToken,
        toToken,
        startDate,
        endDate
      };

      const transactions = await transactionService.getUserTransactions(walletAddress, options);
      
      res.status(200).json({
        success: true,
        message: 'Transaction history retrieved successfully',
        data: {
          walletAddress,
          transactions,
          count: transactions.length,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error getting user transactions:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get transaction history',
        error: error.message
      });
    }
  }

  /**
   * Lấy transaction theo hash
   * @route GET /api/transactions/:hash
   */
  async getTransactionByHash(req, res) {
    try {
      const { hash } = req.params;
      
      if (!hash) {
        return res.status(400).json({
          success: false,
          message: 'Transaction hash is required'
        });
      }

      const transaction = await transactionService.getTransactionByHash(hash);
      
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Transaction retrieved successfully',
        data: transaction
      });
    } catch (error) {
      logger.error('Error getting transaction by hash:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get transaction',
        error: error.message
      });
    }
  }

  /**
   * Cập nhật trạng thái transaction
   * @route PUT /api/transactions/:hash/status
   */
  async updateTransactionStatus(req, res) {
    try {
      const { hash } = req.params;
      const { status, ...updateData } = req.body;
      
      if (!hash) {
        return res.status(400).json({
          success: false,
          message: 'Transaction hash is required'
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const updatedTransaction = await transactionService.updateTransactionStatus(hash, status, updateData);
      
      res.status(200).json({
        success: true,
        message: 'Transaction status updated successfully',
        data: updatedTransaction
      });
    } catch (error) {
      logger.error('Error updating transaction status:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to update transaction status',
        error: error.message
      });
    }
  }

  /**
   * Lấy thống kê transactions
   * @route GET /api/transactions/stats
   */
  async getTransactionStats(req, res) {
    try {
      const walletAddress = req.user?.walletAddress || req.query.walletAddress;
      const stats = await transactionService.getTransactionStats(walletAddress);
      
      res.status(200).json({
        success: true,
        message: 'Transaction stats retrieved successfully',
        data: stats
      });
    } catch (error) {
      logger.error('Error getting transaction stats:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get transaction stats',
        error: error.message
      });
    }
  }

  /**
   * Lấy volume 24h
   * @route GET /api/transactions/volume-24h
   */
  async getVolume24h(req, res) {
    try {
      const volume = await transactionService.getVolume24h();
      
      res.status(200).json({
        success: true,
        message: '24h volume retrieved successfully',
        data: volume
      });
    } catch (error) {
      logger.error('Error getting 24h volume:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get 24h volume',
        error: error.message
      });
    }
  }

  /**
   * Lấy transactions theo status
   * @route GET /api/transactions/status/:status
   */
  async getTransactionsByStatus(req, res) {
    try {
      const { status } = req.params;
      const { limit = 100 } = req.query;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const transactions = await transactionService.getTransactionsByStatus(status, parseInt(limit));
      
      res.status(200).json({
        success: true,
        message: `Transactions with status ${status} retrieved successfully`,
        data: {
          status,
          transactions,
          count: transactions.length,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error getting transactions by status:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get transactions by status',
        error: error.message
      });
    }
  }

  /**
   * Lấy transactions theo chain
   * @route GET /api/transactions/chain/:chainId
   */
  async getTransactionsByChain(req, res) {
    try {
      const { chainId } = req.params;
      const { limit = 100 } = req.query;
      
      if (!chainId) {
        return res.status(400).json({
          success: false,
          message: 'Chain ID is required'
        });
      }

      const transactions = await transactionService.getTransactionsByChain(chainId, parseInt(limit));
      
      res.status(200).json({
        success: true,
        message: `Transactions for chain ${chainId} retrieved successfully`,
        data: {
          chainId,
          transactions,
          count: transactions.length,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error getting transactions by chain:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get transactions by chain',
        error: error.message
      });
    }
  }

  /**
   * Xóa transaction (admin only)
   * @route DELETE /api/transactions/:hash
   */
  async deleteTransaction(req, res) {
    try {
      const { hash } = req.params;
      
      if (!hash) {
        return res.status(400).json({
          success: false,
          message: 'Transaction hash is required'
        });
      }

      const success = await transactionService.deleteTransaction(hash);
      
      if (success) {
        res.status(200).json({
          success: true,
          message: 'Transaction deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }
    } catch (error) {
      logger.error('Error deleting transaction:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to delete transaction',
        error: error.message
      });
    }
  }

  /**
   * Health check cho transaction service
   * @route GET /api/transactions/health
   */
  async healthCheck(req, res) {
    try {
      const health = await transactionService.healthCheck();
      
      res.status(200).json({
        success: true,
        data: health
      });
    } catch (error) {
      logger.error('Error in transaction health check:', error.message);
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error.message
      });
    }
  }
}

module.exports = new TransactionController(); 