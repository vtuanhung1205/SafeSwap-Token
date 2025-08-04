const Transaction = require('../models/Transaction');
const User = require('../models/User');
const aptosService = require('./aptosService');
const logger = require('../utils/logger');
const cron = require('node-cron');

class TransactionService {
  constructor() {
    this.monitoring = false;
    this.monitoredAddresses = new Set();
    this.io = null;
  }

  // Start transaction monitoring
  async startMonitoring(io) {
    this.io = io;
    this.monitoring = true;
    
    logger.info('Starting transaction monitoring...');
    
    // Schedule periodic checks for pending transactions
    cron.schedule('*/30 * * * * *', () => {
      this.checkPendingTransactions();
    });
    
    // Schedule periodic price updates
    cron.schedule('*/60 * * * * *', () => {
      this.updateTokenPrices();
    });
    
    logger.info('Transaction monitoring started');
  }

  // Add address to monitoring
  async addAddressToMonitoring(address) {
    try {
      if (!aptosService.isValidAddress(address)) {
        throw new Error('Invalid address format');
      }
      
      this.monitoredAddresses.add(address.toLowerCase());
      logger.info(`Added address to monitoring: ${address}`);
      
      return true;
    } catch (error) {
      logger.error(`Error adding address to monitoring: ${error.message}`);
      throw error;
    }
  }

  // Remove address from monitoring
  async removeAddressFromMonitoring(address) {
    try {
      this.monitoredAddresses.delete(address.toLowerCase());
      logger.info(`Removed address from monitoring: ${address}`);
      
      return true;
    } catch (error) {
      logger.error(`Error removing address from monitoring: ${error.message}`);
      throw error;
    }
  }

  // Create new transaction
  async createTransaction(transactionData) {
    try {
      const transaction = new Transaction({
        ...transactionData,
        timestamp: new Date(),
        status: 'pending'
      });
      
      await transaction.save();
      
      // Add to monitoring if not already monitored
      if (!this.monitoredAddresses.has(transactionData.fromAddress.toLowerCase())) {
        await this.addAddressToMonitoring(transactionData.fromAddress);
      }
      
      // Notify user via WebSocket
      if (this.io) {
        this.io.to(`user-${transactionData.userId}`).emit('transaction-created', {
          transaction: transaction.toJSON()
        });
      }
      
      logger.info(`Created transaction: ${transaction.hash}`);
      return transaction;
    } catch (error) {
      logger.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Update transaction status
  async updateTransactionStatus(hash, status, additionalData = {}) {
    try {
      const transaction = await Transaction.findOne({ hash });
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      await transaction.updateStatus(status, additionalData);
      
      // Update user statistics
      if (status === 'confirmed') {
        await User.findByIdAndUpdate(transaction.userId, {
          $inc: { 'stats.totalTransactions': 1 },
          $set: { 'stats.lastTransaction': new Date() }
        });
      }
      
      // Notify user via WebSocket
      if (this.io) {
        this.io.to(`user-${transaction.userId}`).emit('transaction-updated', {
          hash,
          status,
          additionalData
        });
      }
      
      logger.info(`Updated transaction ${hash} status to ${status}`);
      return transaction;
    } catch (error) {
      logger.error(`Error updating transaction status: ${error.message}`);
      throw error;
    }
  }

  // Get user transactions
  async getUserTransactions(userId, options = {}) {
    try {
      const transactions = await Transaction.getUserTransactions(userId, options);
      return transactions;
    } catch (error) {
      logger.error(`Error getting user transactions: ${error.message}`);
      throw error;
    }
  }

  // Get transaction by hash
  async getTransactionByHash(hash) {
    try {
      const transaction = await Transaction.findOne({ hash });
      return transaction;
    } catch (error) {
      logger.error(`Error getting transaction by hash: ${error.message}`);
      throw error;
    }
  }

  // Check pending transactions
  async checkPendingTransactions() {
    try {
      const pendingTransactions = await Transaction.find({ 
        status: 'pending',
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });
      
      for (const transaction of pendingTransactions) {
        try {
          const aptosTransaction = await aptosService.getTransaction(transaction.hash);
          
          if (aptosTransaction) {
            let status = 'pending';
            let additionalData = {};
            
            if (aptosTransaction.success) {
              status = 'confirmed';
              additionalData = {
                blockNumber: aptosTransaction.version,
                gasUsed: aptosTransaction.gas_used,
                fee: aptosTransaction.gas_unit_price
              };
            } else if (aptosTransaction.vm_status && aptosTransaction.vm_status.includes('ABORTED')) {
              status = 'failed';
              additionalData = {
                error: aptosTransaction.vm_status
              };
            }
            
            await this.updateTransactionStatus(transaction.hash, status, additionalData);
          }
        } catch (error) {
          logger.error(`Error checking transaction ${transaction.hash}: ${error.message}`);
        }
      }
    } catch (error) {
      logger.error('Error checking pending transactions:', error);
    }
  }

  // Monitor new transactions for addresses
  async monitorAddressTransactions(address) {
    try {
      const transactions = await aptosService.getAccountTransactions(address, 10);
      
      for (const aptosTx of transactions) {
        // Check if transaction already exists
        const existingTx = await Transaction.findOne({ hash: aptosTx.hash });
        
        if (!existingTx && this.isRelevantTransaction(aptosTx, address)) {
          // Find user by address
          const user = await User.findByWalletAddress(address);
          
          if (user) {
            const transactionData = this.parseAptosTransaction(aptosTx, user._id);
            await this.createTransaction(transactionData);
          }
        }
      }
    } catch (error) {
      logger.error(`Error monitoring transactions for ${address}: ${error.message}`);
    }
  }

  // Check if transaction is relevant
  isRelevantTransaction(aptosTx, address) {
    // Check if transaction involves the monitored address
    if (aptosTx.sender === address) return true;
    
    // Check if transaction involves token transfers
    if (aptosTx.payload && aptosTx.payload.type === 'entry_function_payload') {
      const functionName = aptosTx.payload.function;
      if (functionName.includes('transfer') || functionName.includes('swap')) {
        return true;
      }
    }
    
    return false;
  }

  // Parse Aptos transaction to our format
  parseAptosTransaction(aptosTx, userId) {
    const transactionData = {
      hash: aptosTx.hash,
      userId,
      fromAddress: aptosTx.sender,
      toAddress: aptosTx.sender, // Will be updated based on payload
      tokenAddress: '0x1::aptos_coin::AptosCoin',
      tokenName: 'AptosCoin',
      tokenSymbol: 'APT',
      amount: '0',
      amountInDecimals: 8,
      type: 'transfer',
      timestamp: new Date(parseInt(aptosTx.timestamp) * 1000),
      network: 'mainnet',
      chainId: 1
    };
    
    // Parse payload for more details
    if (aptosTx.payload && aptosTx.payload.type === 'entry_function_payload') {
      const functionName = aptosTx.payload.function;
      
      if (functionName.includes('transfer')) {
        transactionData.type = 'transfer';
        // Parse arguments for transfer details
        if (aptosTx.payload.arguments && aptosTx.payload.arguments.length >= 2) {
          transactionData.toAddress = aptosTx.payload.arguments[0];
          transactionData.amount = aptosTx.payload.arguments[1];
        }
      } else if (functionName.includes('swap')) {
        transactionData.type = 'swap';
      }
    }
    
    return transactionData;
  }

  // Update token prices
  async updateTokenPrices() {
    try {
      // This would integrate with price APIs like CoinGecko
      // For now, just log the action
      logger.debug('Updating token prices...');
      
      if (this.io) {
        this.io.to('price-updates').emit('price-update', {
          timestamp: new Date(),
          prices: {} // Would contain actual price data
        });
      }
    } catch (error) {
      logger.error('Error updating token prices:', error);
    }
  }

  // Get transaction statistics
  async getTransactionStats(userId, timeRange = '30d') {
    try {
      const stats = await Transaction.getTransactionStats(userId, timeRange);
      return stats;
    } catch (error) {
      logger.error(`Error getting transaction stats: ${error.message}`);
      throw error;
    }
  }

  // Analyze transaction for risk
  async analyzeTransactionRisk(transaction) {
    try {
      const riskFactors = [];
      let riskScore = 0;
      
      // Check for suspicious patterns
      if (transaction.amount > 10000) {
        riskFactors.push('large_amount');
        riskScore += 20;
      }
      
      if (transaction.toAddress && !aptosService.isValidAddress(transaction.toAddress)) {
        riskFactors.push('invalid_address');
        riskScore += 30;
      }
      
      // Check for known scam addresses (would need a database of known scams)
      // This is a placeholder for actual scam detection logic
      
      const analysis = {
        isScam: riskScore > 50,
        confidence: Math.min(riskScore / 100, 1),
        riskFactors,
        recommendations: this.generateRecommendations(riskFactors)
      };
      
      // Update transaction with analysis
      transaction.aiAnalysis = analysis;
      transaction.riskScore = riskScore;
      await transaction.save();
      
      return analysis;
    } catch (error) {
      logger.error('Error analyzing transaction risk:', error);
      throw error;
    }
  }

  // Generate recommendations based on risk factors
  generateRecommendations(riskFactors) {
    const recommendations = [];
    
    if (riskFactors.includes('large_amount')) {
      recommendations.push('Consider breaking large transactions into smaller amounts');
    }
    
    if (riskFactors.includes('invalid_address')) {
      recommendations.push('Verify the recipient address before proceeding');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Transaction appears safe to proceed');
    }
    
    return recommendations;
  }

  // Stop monitoring
  stopMonitoring() {
    this.monitoring = false;
    logger.info('Transaction monitoring stopped');
  }
}

module.exports = new TransactionService(); 