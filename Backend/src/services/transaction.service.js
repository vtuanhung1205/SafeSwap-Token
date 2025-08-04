const { SwapTransaction } = require('../models');

/**
 * Transaction Service - Quản lý lịch sử swap transactions
 * Tối ưu cho production, chỉ lưu thông tin cần thiết
 */
class TransactionService {
  /**
   * Lưu transaction mới
   * @param {Object} transactionData - Dữ liệu transaction
   * @returns {Promise<Object>} Transaction đã lưu
   */
  async saveTransaction(transactionData) {
    try {
      const transaction = new SwapTransaction({
        walletAddress: transactionData.walletAddress,
        fromToken: transactionData.fromToken,
        toToken: transactionData.toToken,
        fromTokenAddress: transactionData.fromTokenAddress,
        toTokenAddress: transactionData.toTokenAddress,
        fromAmount: transactionData.fromAmount,
        toAmount: transactionData.toAmount,
        exchangeRate: transactionData.exchangeRate,
        slippage: transactionData.slippage || 0.5,
        transactionHash: transactionData.transactionHash,
        sequenceNumber: transactionData.sequenceNumber,
        version: transactionData.version,
        gasUsed: transactionData.gasUsed,
        gasUnitPrice: transactionData.gasUnitPrice,
        maxGasAmount: transactionData.maxGasAmount,
        status: transactionData.status || 'pending',
        chainId: transactionData.chainId || 'aptos-mainnet',
        blockNumber: transactionData.blockNumber,
        errorMessage: transactionData.errorMessage,
        errorCode: transactionData.errorCode
      });

      const savedTransaction = await transaction.save();
      return savedTransaction;
    } catch (error) {
      console.error('Error saving transaction:', error.message);
      throw new Error('Failed to save transaction');
    }
  }

  /**
   * Lấy lịch sử transactions của một wallet
   * @param {string} walletAddress - Wallet address
   * @param {Object} options - Options (limit, status, etc.)
   * @returns {Promise<Array>} Danh sách transactions
   */
  async getUserTransactions(walletAddress, options = {}) {
    try {
      const { limit = 50, status, fromToken, toToken, startDate, endDate } = options;
      
      let query = { walletAddress };
      
      // Filter by status
      if (status) {
        query.status = status;
      }
      
      // Filter by tokens
      if (fromToken) {
        query.fromToken = fromToken.toUpperCase();
      }
      if (toToken) {
        query.toToken = toToken.toUpperCase();
      }
      
      // Filter by date range
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }

      const transactions = await SwapTransaction.find(query)
        .sort({ createdAt: -1 })
        .limit(limit);

      return transactions;
    } catch (error) {
      console.error('Error getting user transactions:', error.message);
      throw new Error('Failed to get user transactions');
    }
  }

  /**
   * Lấy transaction theo hash
   * @param {string} transactionHash - Transaction hash
   * @returns {Promise<Object|null>} Transaction hoặc null
   */
  async getTransactionByHash(transactionHash) {
    try {
      const transaction = await SwapTransaction.getByHash(transactionHash);
      return transaction;
    } catch (error) {
      console.error('Error getting transaction by hash:', error.message);
      return null;
    }
  }

  /**
   * Cập nhật trạng thái transaction
   * @param {string} transactionHash - Transaction hash
   * @param {string} status - Trạng thái mới
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise<Object|null>} Transaction đã cập nhật
   */
  async updateTransactionStatus(transactionHash, status, updateData = {}) {
    try {
      const transaction = await SwapTransaction.getByHash(transactionHash);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Cập nhật status và các field khác
      transaction.status = status;
      Object.assign(transaction, updateData);

      const updatedTransaction = await transaction.save();
      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction status:', error.message);
      throw new Error('Failed to update transaction status');
    }
  }

  /**
   * Lấy thống kê transactions
   * @param {string} walletAddress - Wallet address (optional)
   * @returns {Promise<Object>} Transaction statistics
   */
  async getTransactionStats(walletAddress = null) {
    try {
      let query = {};
      if (walletAddress) {
        query.walletAddress = walletAddress;
      }

      const stats = await SwapTransaction.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            completedTransactions: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            failedTransactions: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            },
            pendingTransactions: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            totalVolume: { $sum: '$fromAmount' },
            totalGasUsed: { $sum: '$gasUsed' }
          }
        }
      ]);

      const result = stats[0] || {
        totalTransactions: 0,
        completedTransactions: 0,
        failedTransactions: 0,
        pendingTransactions: 0,
        totalVolume: 0,
        totalGasUsed: 0
      };

      return {
        ...result,
        successRate: result.totalTransactions > 0 
          ? (result.completedTransactions / result.totalTransactions * 100).toFixed(2)
          : 0,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting transaction stats:', error.message);
      return {
        totalTransactions: 0,
        completedTransactions: 0,
        failedTransactions: 0,
        pendingTransactions: 0,
        totalVolume: 0,
        totalGasUsed: 0,
        successRate: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Lấy volume 24h
   * @returns {Promise<Object>} Volume statistics
   */
  async getVolume24h() {
    try {
      const volume = await SwapTransaction.getVolume24h();
      return volume;
    } catch (error) {
      console.error('Error getting 24h volume:', error.message);
      return {
        totalVolume: 0,
        transactionCount: 0,
        totalGasUsed: 0
      };
    }
  }

  /**
   * Lấy transactions theo status
   * @param {string} status - Transaction status
   * @param {number} limit - Số lượng transactions
   * @returns {Promise<Array>} Danh sách transactions
   */
  async getTransactionsByStatus(status, limit = 100) {
    try {
      const transactions = await SwapTransaction.getByStatus(status);
      return transactions.slice(0, limit);
    } catch (error) {
      console.error('Error getting transactions by status:', error.message);
      return [];
    }
  }

  /**
   * Lấy transactions theo chain
   * @param {string} chainId - Chain ID
   * @param {number} limit - Số lượng transactions
   * @returns {Promise<Array>} Danh sách transactions
   */
  async getTransactionsByChain(chainId, limit = 100) {
    try {
      const transactions = await SwapTransaction.getByChain(chainId);
      return transactions.slice(0, limit);
    } catch (error) {
      console.error('Error getting transactions by chain:', error.message);
      return [];
    }
  }

  /**
   * Xóa transaction (chỉ dành cho admin)
   * @param {string} transactionHash - Transaction hash
   * @returns {Promise<boolean>} Success status
   */
  async deleteTransaction(transactionHash) {
    try {
      const result = await SwapTransaction.deleteOne({ transactionHash });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting transaction:', error.message);
      return false;
    }
  }

  /**
   * Health check cho transaction service
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const stats = await this.getTransactionStats();
      const isHealthy = stats.totalTransactions >= 0; // Basic check

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new TransactionService(); 