const { Wallet } = require('../models/Wallet.model');
const { Token } = require('../models/Token.model');
const { WalletService } = require('../services/wallet.service');
const { AptosBlockchainService } = require('../services/aptosBlockchain.service');
const { createError } = require('../middleware/errorHandler');
const { logger } = require('../utils/logger');

const walletService = new WalletService();
const aptosService = new AptosBlockchainService();

class WalletController {
  async connectWallet(req, res, next) {
    try {
      console.log("Received wallet connect request:", req.body);
      let { address, publicKey, signature } = req.body;
      
      // Get userId from authenticated user
      if (!req.user || !req.user._id) {
        throw createError(401, 'Authentication required to connect wallet');
      }
      
      const userId = req.user._id;
      console.log(`Connecting wallet for user: ${userId}`);

      // Normalize address and publicKey
      try {
        if (typeof address === 'object') {
          address = address.hexString || JSON.stringify(address);
        } else if (address) {
          address = String(address);
        }
        
        if (typeof publicKey === 'object') {
          publicKey = publicKey.hexString || JSON.stringify(publicKey);
        } else if (publicKey) {
          publicKey = String(publicKey);
        }
      } catch (error) {
        logger.error('Error normalizing wallet data:', error);
      }

      // Validation
      if (!address || !publicKey) {
        throw createError(400, 'Wallet address and public key are required');
      }

      // Validate Aptos address format
      if (!aptosService.validateAddress(address)) {
        throw createError(400, 'Invalid Aptos address format');
      }

      try {
        // Get account info from Aptos blockchain
        const accountInfo = await aptosService.getAccountInfo(address);
        
        // Get APT balance
        const aptBalance = await aptosService.getAccountBalance(address);
        
        // Get all token balances
        const tokenBalances = await aptosService.getAllTokenBalances(address);

        // Check if wallet already exists
        const existingWallet = await Wallet.findOne({ address });
        
        if (existingWallet) {
          if (existingWallet.userId.toString() === userId.toString()) {
            // Update existing wallet
            existingWallet.publicKey = publicKey;
            existingWallet.aptBalance = aptBalance;
            existingWallet.sequenceNumber = accountInfo.sequence_number;
            existingWallet.authenticationKey = accountInfo.authentication_key;
            existingWallet.isConnected = true;
            existingWallet.lastSyncAt = new Date();
            
            // Update token balances
            for (const [tokenAddress, balanceData] of Object.entries(tokenBalances)) {
              existingWallet.tokenBalances.set(tokenAddress, {
                amount: balanceData.amount,
                type: balanceData.type,
                lastUpdated: new Date()
              });
            }
            
            await existingWallet.save();
            
            logger.info(`Wallet re-connected for user ${userId}: ${address}`);
            
            res.json({
              success: true,
              message: 'Wallet reconnected successfully',
              data: { wallet: existingWallet },
            });
          } else {
            throw createError(409, 'This wallet is already linked to another account');
          }
        } else {
          // Create new wallet
          const newWallet = new Wallet({
            userId,
            address,
            publicKey,
            aptBalance,
            sequenceNumber: accountInfo.sequence_number,
            authenticationKey: accountInfo.authentication_key,
            isConnected: true,
            chainId: `aptos-${aptosService.network}`,
          });

          // Add token balances
          for (const [tokenAddress, balanceData] of Object.entries(tokenBalances)) {
            newWallet.tokenBalances.set(tokenAddress, {
              amount: balanceData.amount,
              type: balanceData.type,
              lastUpdated: new Date()
            });
          }

          await newWallet.save();
          
          logger.info(`New wallet created for user ${userId}: ${address}`);
          
          res.json({
            success: true,
            message: 'Wallet connected successfully',
            data: { wallet: newWallet },
          });
        }
      } catch (error) {
        if (error.statusCode) {
          throw error;
        }
        logger.error('Wallet connection error:', error);
        throw createError(500, 'Failed to connect wallet');
      }
    } catch (error) {
      logger.error('Wallet connection error:', {
        message: error.message,
        stack: error.stack
      });
      next(error);
    }
  }

  async disconnectWallet(req, res, next) {
    try {
      const userId = req.user._id;

      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw createError(404, 'No wallet found for this user');
      }

      await wallet.disconnect();

      logger.info(`Wallet disconnected for user ${userId}`);

      res.json({
        success: true,
        message: 'Wallet disconnected successfully',
        data: { wallet },
      });
    } catch (error) {
      next(error);
    }
  }

  async getWalletInfo(req, res, next) {
    try {
      const userId = req.user._id;

      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw createError(404, 'No wallet found for this user');
      }

      // Refresh balances from blockchain
      try {
        const aptBalance = await aptosService.getAccountBalance(wallet.address);
        const tokenBalances = await aptosService.getAllTokenBalances(wallet.address);
        
        // Update APT balance
        await wallet.updateAptBalance(aptBalance);
        
        // Update token balances
        for (const [tokenAddress, balanceData] of Object.entries(tokenBalances)) {
          await wallet.updateTokenBalance(tokenAddress, balanceData);
        }
        
        await wallet.save();
      } catch (error) {
        logger.error('Failed to refresh balances:', error);
        // Continue with cached data
      }

      res.json({
        success: true,
        data: { wallet },
      });
    } catch (error) {
      next(error);
    }
  }

  async getBalance(req, res, next) {
    try {
      const userId = req.user._id;
      const { tokenAddress } = req.query;

      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw createError(404, 'No wallet found for this user');
      }

      let balance = 0;
      let tokenInfo = null;

      if (tokenAddress) {
        // Get specific token balance
        balance = await aptosService.getTokenBalance(wallet.address, tokenAddress);
        
        // Get token info
        const token = await Token.findOne({ address: tokenAddress });
        if (token) {
          tokenInfo = token;
        }
      } else {
        // Get APT balance
        balance = await aptosService.getAccountBalance(wallet.address);
      }

      res.json({
        success: true,
        data: {
          balance,
          tokenInfo,
          walletAddress: wallet.address,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTokenBalances(req, res, next) {
    try {
      const userId = req.user._id;

      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw createError(404, 'No wallet found for this user');
      }

      // Get all token balances from blockchain
      const tokenBalances = await aptosService.getAllTokenBalances(wallet.address);
      
      // Get token metadata for each token
      const balancesWithMetadata = [];
      
      for (const [tokenAddress, balanceData] of Object.entries(tokenBalances)) {
        const token = await Token.findOne({ address: tokenAddress });
        
        balancesWithMetadata.push({
          address: tokenAddress,
          balance: balanceData.amount,
          type: balanceData.type,
          token: token || null
        });
      }

      res.json({
        success: true,
        data: {
          balances: balancesWithMetadata,
          walletAddress: wallet.address,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransactionHistory(req, res, next) {
    try {
      const userId = req.user._id;
      const { limit = 20, offset = 0 } = req.query;

      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw createError(404, 'No wallet found for this user');
      }

      // Get transactions from database
      const transactions = await SwapTransaction.find({ walletAddress: wallet.address })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(offset));

      res.json({
        success: true,
        data: {
          transactions,
          walletAddress: wallet.address,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async validateAddress(req, res, next) {
    try {
      const { address } = req.params;

      if (!address) {
        throw createError(400, 'Address is required');
      }

      const isValid = aptosService.validateAddress(address);
      
      if (isValid) {
        // Get account info if address is valid
        try {
          const accountInfo = await aptosService.getAccountInfo(address);
          const balance = await aptosService.getAccountBalance(address);
          
          res.json({
            success: true,
            data: {
              isValid: true,
              address,
              accountInfo,
              balance,
            },
          });
        } catch (error) {
          res.json({
            success: true,
            data: {
              isValid: true,
              address,
              accountInfo: null,
              balance: 0,
            },
          });
        }
      } else {
        res.json({
          success: true,
          data: {
            isValid: false,
            address,
            accountInfo: null,
            balance: 0,
          },
        });
      }
    } catch (error) {
      next(error);
    }
  }

  async getAccountInfo(req, res, next) {
    try {
      const { address } = req.params;

      if (!address) {
        throw createError(400, 'Address is required');
      }

      if (!aptosService.validateAddress(address)) {
        throw createError(400, 'Invalid Aptos address format');
      }

      const accountInfo = await aptosService.getAccountInfo(address);
      const balance = await aptosService.getAccountBalance(address);
      const tokenBalances = await aptosService.getAllTokenBalances(address);

      res.json({
        success: true,
        data: {
          address,
          accountInfo,
          balance,
          tokenBalances,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateBalance(req, res, next) {
    try {
      const userId = req.user._id;

      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        throw createError(404, 'No wallet found for this user');
      }

      // Refresh balances from blockchain
      const aptBalance = await aptosService.getAccountBalance(wallet.address);
      const tokenBalances = await aptosService.getAllTokenBalances(wallet.address);

      // Update wallet balances
      await wallet.updateAptBalance(aptBalance);
      
      for (const [tokenAddress, balanceData] of Object.entries(tokenBalances)) {
        await wallet.updateTokenBalance(tokenAddress, balanceData);
      }

      await wallet.save();

      logger.info(`Balance updated for wallet ${wallet.address}`);

      res.json({
        success: true,
        message: 'Balance updated successfully',
        data: { wallet },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = { WalletController };
