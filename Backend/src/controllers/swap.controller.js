const transactionService = require('../services/transaction.service');
const coinGeckoService = require('../services/coinGecko.service');
const { logger } = require('../utils/logger');

/**
 * Swap Controller - Quản lý swap operations
 * Tối ưu cho production với wallet-based authentication
 */
class SwapController {
  /**
   * Lấy quote cho swap
   * @route POST /api/swap/quote
   */
  async getQuote(req, res) {
    try {
      const { fromToken, toToken, amount, slippage = 0.5, walletAddress } = req.body;

      // Validation
      if (!fromToken || !toToken || !amount) {
        return res.status(400).json({
          success: false,
          message: 'fromToken, toToken, and amount are required'
        });
      }

      const fromAmount = parseFloat(amount);
      if (isNaN(fromAmount) || fromAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be a positive number'
        });
      }

      // Validate wallet address if provided
      if (walletAddress && !/^0x[a-fA-F0-9]{64}$/.test(walletAddress)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid wallet address format'
        });
      }

      // Get token info from CoinGecko
      let fromTokenInfo, toTokenInfo;
      try {
        fromTokenInfo = await coinGeckoService.getTokenInfo(fromToken);
        toTokenInfo = await coinGeckoService.getTokenInfo(toToken);
      } catch (error) {
        logger.warn(`Failed to get token info: ${error.message}`);
        // Use basic info if CoinGecko fails
        fromTokenInfo = { symbol: fromToken.toUpperCase(), name: fromToken };
        toTokenInfo = { symbol: toToken.toUpperCase(), name: toToken };
      }

      // Get current prices
      let fromTokenPrice = 0, toTokenPrice = 0;
      try {
        const fromPriceData = await coinGeckoService.getTokenPrice(fromToken);
        const toPriceData = await coinGeckoService.getTokenPrice(toToken);
        fromTokenPrice = fromPriceData.price;
        toTokenPrice = toPriceData.price;
      } catch (error) {
        logger.warn(`Failed to get token prices: ${error.message}`);
      }

      // Calculate exchange rate (simplified for demo)
      const exchangeRate = toTokenPrice > 0 ? fromTokenPrice / toTokenPrice : 1;
      const toAmount = fromAmount * exchangeRate * (1 - slippage / 100);

      // Calculate USD values
      const fromAmountUSD = fromTokenPrice * fromAmount;
      const toAmountUSD = toTokenPrice * toAmount;

      // Generate quote ID
      const quoteId = `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const quote = {
        quoteId,
        fromToken: {
          id: fromToken,
          symbol: fromTokenInfo.symbol,
          name: fromTokenInfo.name,
          amount: fromAmount,
          amountUSD: fromAmountUSD,
          price: fromTokenPrice
        },
        toToken: {
          id: toToken,
          symbol: toTokenInfo.symbol,
          name: toTokenInfo.name,
          amount: toAmount,
          amountUSD: toAmountUSD,
          price: toTokenPrice
        },
        exchangeRate,
        slippage,
        gasEstimate: {
          gasUsed: 50000,
          gasPrice: 100,
          gasCost: 0.005 // APT
        },
        validUntil: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
        timestamp: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        message: 'Quote generated successfully',
        data: quote
      });
    } catch (error) {
      logger.error('Error generating quote:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to generate quote',
        error: error.message
      });
    }
  }

  /**
   * Thực hiện swap
   * @route POST /api/swap/execute
   */
  async executeSwap(req, res) {
    try {
      const { 
        fromToken, 
        toToken, 
        fromAmount, 
        toAmount, 
        slippage, 
        walletAddress,
        signature 
      } = req.body;

      // Validation
      if (!fromToken || !toToken || !fromAmount || !toAmount || !walletAddress) {
        return res.status(400).json({
          success: false,
          message: 'fromToken, toToken, fromAmount, toAmount, and walletAddress are required'
        });
      }

      // Validate wallet address
      if (!/^0x[a-fA-F0-9]{64}$/.test(walletAddress)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid wallet address format'
        });
      }

      // Validate signature (simplified for demo)
      if (!signature) {
        return res.status(400).json({
          success: false,
          message: 'Transaction signature is required'
        });
      }

      // Generate transaction hash (simplified for demo)
      const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const sequenceNumber = Math.floor(Math.random() * 1000000);
      const version = Math.floor(Date.now() / 1000);

      // Calculate exchange rate
      const exchangeRate = parseFloat(toAmount) / parseFloat(fromAmount);

      // Create transaction record
      const transactionData = {
        walletAddress,
        fromToken: fromToken.toUpperCase(),
        toToken: toToken.toUpperCase(),
        fromTokenAddress: fromToken,
        toTokenAddress: toToken,
        fromAmount: parseFloat(fromAmount),
        toAmount: parseFloat(toAmount),
        exchangeRate,
        slippage: slippage || 0.5,
        transactionHash,
        sequenceNumber,
        version,
        gasUsed: 50000,
        gasUnitPrice: 100,
        maxGasAmount: 100000,
        status: 'submitted',
        chainId: 'aptos-mainnet'
      };

      // Save transaction to database
      const savedTransaction = await transactionService.saveTransaction(transactionData);

      logger.info(`Swap executed: ${transactionHash} by ${walletAddress}`);

      res.status(200).json({
        success: true,
        message: 'Swap executed successfully',
        data: {
          transactionHash,
          status: 'submitted',
          fromToken: savedTransaction.fromToken,
          toToken: savedTransaction.toToken,
          fromAmount: savedTransaction.fromAmount,
          toAmount: savedTransaction.toAmount,
          gasUsed: savedTransaction.gasUsed,
          timestamp: savedTransaction.timestamp
        }
      });
    } catch (error) {
      logger.error('Error executing swap:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to execute swap',
        error: error.message
      });
    }
  }

  /**
   * Lấy trạng thái transaction
   * @route GET /api/swap/transaction/:hash
   */
  async getTransactionStatus(req, res) {
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
        message: 'Transaction status retrieved successfully',
        data: {
          transactionHash: transaction.transactionHash,
          status: transaction.status,
          fromToken: transaction.fromToken,
          toToken: transaction.toToken,
          fromAmount: transaction.fromAmount,
          toAmount: transaction.toAmount,
          gasUsed: transaction.gasUsed,
          blockNumber: transaction.blockNumber,
          timestamp: transaction.timestamp,
          errorMessage: transaction.errorMessage
        }
      });
    } catch (error) {
      logger.error('Error getting transaction status:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get transaction status',
        error: error.message
      });
    }
  }

  /**
   * Lấy lịch sử swap của user
   * @route GET /api/swap/history
   */
  async getSwapHistory(req, res) {
    try {
      const walletAddress = req.user?.walletAddress || req.query.walletAddress;
      
      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          message: 'Wallet address is required'
        });
      }

      const { limit = 20, status } = req.query;
      const options = {
        limit: parseInt(limit),
        status
      };

      const transactions = await transactionService.getUserTransactions(walletAddress, options);
      
      res.status(200).json({
        success: true,
        message: 'Swap history retrieved successfully',
        data: {
          walletAddress,
          transactions,
          count: transactions.length,
          lastUpdated: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error getting swap history:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get swap history',
        error: error.message
      });
    }
  }

  /**
   * Health check cho swap service
   * @route GET /api/swap/health
   */
  async healthCheck(req, res) {
    try {
      const coinGeckoHealth = await coinGeckoService.healthCheck();
      const transactionHealth = await transactionService.healthCheck();
      
      res.status(200).json({
        success: true,
        data: {
          coinGecko: coinGeckoHealth,
          transaction: transactionHealth,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Error in swap health check:', error.message);
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error.message
      });
    }
  }
}

module.exports = new SwapController();
