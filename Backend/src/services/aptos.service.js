const { logger } = require('../utils/logger');
const { createError } = require('../middleware/errorHandler');
const { Wallet } = require('../models/Wallet.model');
const axios = require('axios');
const { PriceFeedService } = require('./priceFeed.service'); // Import PriceFeedService
// Correct import based on official documentation for new versions
const { Aptos, AptosConfig, Network } = require("@aptos-labs/ts-sdk");

class AptosService {
  constructor() {
    this.network = process.env.APTOS_NETWORK || 'testnet';
    const networkEnum = this.network.toUpperCase() === 'MAINNET' ? Network.MAINNET : Network.TESTNET;
    
    // Official way to configure the client
    const config = new AptosConfig({ network: networkEnum });
    this.client = new Aptos(config); // This is the main entrypoint now, not AptosClient directly

    this.nodeUrl = this.client.config.fullnode; // Get the node URL from the config
    this.faucetUrl = this.client.config.faucet; // Get the faucet URL from the config
    
    this.priceFeedService = new PriceFeedService();
    
    // Liquidswap contract addresses
    this.liquidswapModuleAddress = '0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12';
    this.liquidswapScriptsAddress = '0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12';
    
    // Common token addresses
    this.tokens = {
      APT: {
        address: '0x1::aptos_coin::AptosCoin',
        decimals: 8
      },
      USDC: {
        address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
        decimals: 6
      },
      USDT: {
        address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT',
        decimals: 6
      }
    };
  }

  async connectWallet(userId, walletData) {
    try {
      const { address, publicKey } = walletData;

      // Check if userId is 'guest' (non-authenticated user)
      const isGuestUser = userId === 'guest';

      // 1. Check if the wallet address is already registered
      const existingWallet = await Wallet.findOne({ address });

      if (existingWallet) {
        // 2. If it exists, check if it belongs to the current user or is a guest wallet
        if (existingWallet.userId.toString() === userId || 
            (isGuestUser && existingWallet.userId === 'guest')) {
          // It's the same user or a guest wallet, just update the connection status and public key
          existingWallet.publicKey = publicKey;
          existingWallet.isConnected = true;
          existingWallet.lastSyncAt = new Date();
          await existingWallet.save();
          logger.info(`Wallet re-connected for user ${userId}: ${address}`);
          return existingWallet;
        } else {
          // 3. The wallet is linked to another account, throw a specific error
          throw createError(409, 'This wallet is already linked to another account.');
        }
      } else {
        // 4. If the wallet does not exist, create a new one for the current user
        let balance = 0;
        try {
          balance = await this.getAccountBalance(address);
        } catch (error) {
          logger.error(`Failed to get balance for ${address}:`, error.message);
          // Continue with zero balance
        }

        const newWallet = new Wallet({
          userId,
          address,
          publicKey,
          chainId: `aptos-${this.network}`,
          balance,
          isConnected: true,
        });

        await newWallet.save();
        logger.info(`New wallet created for user ${userId}: ${address}`);
        return newWallet;
      }
    } catch (error) {
      // Re-throw specific errors, otherwise throw a generic one
      if (error.statusCode) {
        throw error;
      }
      logger.error('Failed to connect wallet:', {
        message: error.message,
        userId,
        address: walletData.address,
      });
      throw createError(500, 'Could not connect wallet due to a server error.');
    }
  }

  async getAccountBalance(address) {
    try {
      const response = await axios.get(`${this.nodeUrl}/accounts/${address}/resource/0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>`, {
        timeout: 10000
      });

      if (response.data && response.data.data) {
        const balance = parseInt(response.data.data.coin.value) / 100000000; // Convert from octas to APT
        return parseFloat(balance.toFixed(8));
      }

      return 0;
    } catch (error) {
      if (error.response?.status === 404) {
        // Account doesn't exist or has no APT
        return 0;
      }
      
      logger.error(`Failed to get balance for ${address}:`, error.message);
      return 0; // Return 0 on error rather than throwing
    }
  }

  async getAccountInfo(address) {
    try {
      const response = await axios.get(`${this.nodeUrl}/accounts/${address}`, {
        timeout: 10000
      });

      return {
        address: response.data.address,
        sequenceNumber: response.data.sequence_number,
        authenticationKey: response.data.authentication_key
      };
    } catch (error) {
      if (error.response?.status === 404) {
        throw createError(404, 'Account not found');
      }
      
      logger.error(`Failed to get account info for ${address}:`, error.message);
      throw createError(500, 'Failed to fetch account information');
    }
  }

  async getAccountResources(address) {
    try {
      const response = await axios.get(`${this.nodeUrl}/accounts/${address}/resources`, {
        timeout: 10000
      });

      return response.data || [];
    } catch (error) {
      if (error.response?.status === 404) {
        return [];
      }
      
      logger.error(`Failed to get resources for ${address}:`, error.message);
      return [];
    }
  }

  async getTransactionHistory(address, limit = 25) {
    try {
      const response = await axios.get(`${this.nodeUrl}/accounts/${address}/transactions`, {
        params: { limit },
        timeout: 10000
      });

      return response.data || [];
    } catch (error) {
      logger.error(`Failed to get transaction history for ${address}:`, error.message);
      return [];
    }
  }

  async getTransaction(txnHash) {
    try {
      const response = await axios.get(`${this.nodeUrl}/transactions/by_hash/${txnHash}`, {
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw createError(404, 'Transaction not found');
      }
      
      logger.error(`Failed to get transaction ${txnHash}:`, error.message);
      throw createError(500, 'Failed to fetch transaction');
    }
  }

  async estimateGasPrice() {
    try {
      const response = await axios.get(`${this.nodeUrl}/estimate_gas_price`, {
        timeout: 5000
      });

      return {
        gasEstimate: response.data.gas_estimate || 100,
        prioritizedGasEstimate: response.data.prioritized_gas_estimate || 150
      };
    } catch (error) {
      logger.error('Failed to estimate gas price:', error.message);
      
      // Return default values if estimation fails
      return {
        gasEstimate: 100,
        prioritizedGasEstimate: 150
      };
    }
  }

  async getLedgerInfo() {
    try {
      const response = await axios.get(`${this.nodeUrl}/`, {
        timeout: 5000
      });

      return {
        chainId: response.data.chain_id,
        ledgerVersion: response.data.ledger_version,
        ledgerTimestamp: response.data.ledger_timestamp
      };
    } catch (error) {
      logger.error('Failed to get ledger info:', error.message);
      throw createError(500, 'Failed to get network information');
    }
  }

  async validateAddress(address) {
    try {
      if (!address || typeof address !== 'string') {
        return false;
      }

      // Normalize the address
      let normalizedAddress = address.trim();
      
      // Ensure it starts with 0x
      if (!normalizedAddress.startsWith('0x')) {
        normalizedAddress = `0x${normalizedAddress}`;
      }
      
      // Basic format validation
      const aptosAddressRegex = /^0x[a-fA-F0-9]{1,64}$/;
      if (!aptosAddressRegex.test(normalizedAddress)) {
        return false;
      }

      // For production environments, we might want to skip the network call
      // and just validate the format
      if (process.env.NODE_ENV === 'production') {
        return true;
      }
      
      // Try to get account info to verify if address exists
      try {
        await axios.get(`${this.nodeUrl}/accounts/${normalizedAddress}`, {
          timeout: 5000
        });
        return true;
      } catch (error) {
        // If we get a 404, the address format is valid but the account doesn't exist yet
        if (error.response?.status === 404) {
          return true; // Valid format, just not initialized
        }
        // For other errors, we'll assume the address is invalid
        logger.warn(`Address validation failed for ${normalizedAddress}:`, error.message);
        return false;
      }
    } catch (error) {
      logger.error(`Error validating address ${address}:`, error.message);
      return false;
    }
  }

  async fundAccount(address, amount = 100000000) { // Default 1 APT in octas
    try {
      if (this.network !== 'testnet') {
        throw createError(400, 'Faucet is only available on testnet');
      }

      const response = await axios.post(`${this.faucetUrl}/mint`, {
        address,
        amount
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      logger.info(`Funded account ${address} with ${amount} octas`);
      return response.data;
    } catch (error) {
      logger.error(`Failed to fund account ${address}:`, error.message);
      throw createError(500, 'Failed to fund account from faucet');
    }
  }

  async getTokenBalance(address, coinType = '0x1::aptos_coin::AptosCoin') {
    try {
      const resourceType = `0x1::coin::CoinStore<${coinType}>`;
      const response = await axios.get(`${this.nodeUrl}/accounts/${address}/resource/${resourceType}`, {
        timeout: 10000
      });

      if (response.data && response.data.data) {
        const balance = parseInt(response.data.data.coin.value);
        return balance;
      }

      return 0;
    } catch (error) {
      if (error.response?.status === 404) {
        return 0;
      }
      
      logger.error(`Failed to get token balance for ${address}:`, error.message);
      return 0;
    }
  }

  getHealthStatus() {
    try {
      return {
        status: 'healthy',
        network: this.network,
        nodeUrl: this.nodeUrl,
        faucetUrl: this.faucetUrl
      };
    } catch (error) {
      return {
        status: 'error',
        message: error.message
      };
    }
  }

  // New methods for Aptos integration
  
  /**
   * Calculate swap rates between two tokens
   * @param {Object} params - Swap parameters
   * @param {string} params.fromToken - Source token symbol (e.g., "APT")
   * @param {string} params.toToken - Target token symbol (e.g., "USDC")
   * @param {number} params.amount - Amount to swap in source token units
   * @returns {Promise<Object>} Swap rate information
   */
  async calculateSwapRates({ fromToken, toToken, amount }) {
    try {
      // Validate tokens
      if (!this.tokens[fromToken] || !this.tokens[toToken]) {
        // Mở rộng hỗ trợ token động
        logger.info(`Token ${fromToken} or ${toToken} not in predefined list. Attempting to fetch price dynamically.`);
      }

      // Lấy giá token động từ PriceFeedService
      const fromTokenData = await this.priceFeedService.getPrice(fromToken);
      const toTokenData = await this.priceFeedService.getPrice(toToken);

      if (!fromTokenData || !toTokenData) {
        throw createError(404, `Could not retrieve price for ${fromToken} or ${toToken}`);
      }
      
      const fromPrice = fromTokenData.price;
      const toPrice = toTokenData.price;

      if (fromPrice === 0 || toPrice === 0) {
        throw createError(400, 'Token price cannot be zero, unable to calculate rate.');
      }
      
      const exchangeRate = fromPrice / toPrice;
      
      // Calculate output amount (with 0.3% fee)
      const fee = amount * 0.003;
      const outputAmount = (amount - fee) * exchangeRate;
      
      // Generate a unique quote ID
      const quoteId = `q_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      return {
        quoteId,
        fromToken,
        toToken,
        fromAmount: amount,
        toAmount: outputAmount,
        exchangeRate,
        fee,
        expiresAt: new Date(Date.now() + 30000).toISOString() // Quote expires in 30 seconds
      };
    } catch (error) {
      logger.error('Failed to calculate swap rates:', error);
      throw error;
    }
  }

  /**
   * Create a swap transaction payload
   * @param {Object} params - Swap parameters
   * @param {string} params.fromToken - Source token symbol
   * @param {string} params.toToken - Target token symbol
   * @param {number} params.fromAmount - Amount to swap in source token units
   * @param {number} params.toAmount - Expected output amount
   * @param {number} params.slippage - Allowed slippage percentage (e.g., 0.5 for 0.5%)
   * @returns {Promise<Object>} Transaction payload
   */
  async createSwapTransactionPayload({ fromToken, toToken, fromAmount, toAmount, slippage = 0.5 }) {
    try {
      // In a real implementation, this would create a proper Aptos transaction payload
      // For this demo, we'll return a simplified payload structure
      
      const fromTokenInfo = this.tokens[fromToken];
      const toTokenInfo = this.tokens[toToken];
      
      if (!fromTokenInfo || !toTokenInfo) {
        throw createError(400, 'Unsupported token');
      }
      
      // Convert amount to on-chain units based on decimals
      const fromAmountRaw = Math.floor(fromAmount * Math.pow(10, fromTokenInfo.decimals));
      
      // Calculate minimum output with slippage
      const minOutputAmount = Math.floor(toAmount * (1 - slippage/100) * Math.pow(10, toTokenInfo.decimals));
      
      // Create a simplified transaction payload
      // In a real implementation, this would use the Aptos SDK to create a proper payload
      return {
        function: `${this.liquidswapModuleAddress}::scripts::swap`,
        type_arguments: [
          fromTokenInfo.address,
          toTokenInfo.address,
          '0x1::aptos_coin::AptosCoin' // Curve type (simplified)
        ],
        arguments: [
          fromAmountRaw.toString(),
          minOutputAmount.toString()
        ]
      };
    } catch (error) {
      logger.error('Failed to create swap transaction payload:', error);
      throw error;
    }
  }

  /**
   * Fetch token list from Panora Exchange API
   * @returns {Promise<Array>} List of tokens
   */
  async getTokenList() {
    try {
      const response = await axios.get('https://api.panora.exchange/tokens', {
        timeout: 10000
      });
      
      return response.data || [];
    } catch (error) {
      logger.error('Failed to fetch token list:', error);
      
      // Return basic tokens if API fails
      return Object.entries(this.tokens).map(([symbol, data]) => ({
        symbol,
        name: symbol,
        tokenAddress: data.address,
        decimals: data.decimals,
        logoUrl: `https://example.com/logos/${symbol.toLowerCase()}.png`,
        panoraTags: ['Native']
      }));
    }
  }
}

module.exports = {
  AptosService
};
