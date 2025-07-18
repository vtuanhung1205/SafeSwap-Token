const { logger } = require('../utils/logger');
const { createError } = require('../middleware/errorHandler');
const { Wallet } = require('../models/Wallet.model');
const axios = require('axios');

class AptosService {
  constructor() {
    this.nodeUrl = process.env.APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com/v1';
    this.faucetUrl = process.env.APTOS_FAUCET_URL || 'https://faucet.testnet.aptoslabs.com';
    this.network = process.env.APTOS_NETWORK || 'testnet';
  }

  async connectWallet(userId, walletData) {
    try {
      const { address, publicKey } = walletData;

      // Check if wallet already exists
      const existingWallet = await Wallet.findOne({ address });
      
      if (existingWallet && existingWallet.userId.toString() !== userId) {
        throw createError(400, 'Wallet is already connected to another user');
      }

      // Get account balance
      const balance = await this.getAccountBalance(address);

      // Update or create wallet
      const wallet = await Wallet.findOneAndUpdate(
        { userId },
        {
          userId,
          address,
          publicKey,
          chainId: `aptos-${this.network}`,
          balance,
          isConnected: true,
        },
        { upsert: true, new: true }
      );

      logger.info(`Wallet connected for user ${userId}: ${address}`);
      return wallet;
    } catch (error) {
      logger.error('Failed to connect wallet:', error);
      throw error;
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

      // Basic format validation
      const aptosAddressRegex = /^0x[a-fA-F0-9]{1,64}$/;
      if (!aptosAddressRegex.test(address)) {
        return false;
      }

      // Try to get account info to verify if address exists
      try {
        await this.getAccountInfo(address);
        return true;
      } catch (error) {
        // Address format is valid but account doesn't exist
        return true; // Still valid format for potential new accounts
      }
    } catch (error) {
      logger.error(`Failed to validate address ${address}:`, error.message);
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
    return {
      service: 'AptosService',
      network: this.network,
      nodeUrl: this.nodeUrl,
      faucetUrl: this.faucetUrl,
      status: 'operational'
    };
  }
}

module.exports = { AptosService };
