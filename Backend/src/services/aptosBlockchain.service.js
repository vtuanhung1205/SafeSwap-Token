const { AptosClient } = require('aptos');
const { logger } = require('../utils/logger');

class AptosBlockchainService {
  constructor() {
    this.network = process.env.APTOS_NETWORK || 'testnet';
    this.nodeUrl = process.env.APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com/v1';
    this.client = new AptosClient(this.nodeUrl);
  }

  async getAccountInfo(address) {
    try {
      const accountInfo = await this.client.getAccount(address);
      return accountInfo;
    } catch (error) {
      logger.error('Failed to get account info:', error);
      throw error;
    }
  }

  async getAccountResources(address) {
    try {
      const resources = await this.client.getAccountResources(address);
      return resources;
    } catch (error) {
      logger.error('Failed to get account resources:', error);
      throw error;
    }
  }

  async getTokenBalance(address, tokenAddress) {
    try {
      const resources = await this.getAccountResources(address);
      const tokenResource = resources.find(resource => 
        resource.type === `${tokenAddress}::coin::CoinStore<${tokenAddress}::coin::T>`
      );
      
      if (!tokenResource) {
        return { amount: 0, decimals: 6 };
      }

      return {
        amount: parseInt(tokenResource.data.coin.value),
        decimals: parseInt(tokenResource.data.coin.decimals)
      };
    } catch (error) {
      logger.error('Failed to get token balance:', error);
      return { amount: 0, decimals: 6 };
    }
  }

  async getAptBalance(address) {
    try {
      const accountInfo = await this.getAccountInfo(address);
      return parseInt(accountInfo.coin.value);
    } catch (error) {
      logger.error('Failed to get APT balance:', error);
      return 0;
    }
  }

  async submitTransaction(signedTransaction) {
    try {
      const result = await this.client.submitTransaction(signedTransaction);
      return result;
    } catch (error) {
      logger.error('Failed to submit transaction:', error);
      throw error;
    }
  }

  async getTransactionByHash(hash) {
    try {
      const transaction = await this.client.getTransactionByHash(hash);
      return transaction;
    } catch (error) {
      logger.error('Failed to get transaction:', error);
      throw error;
    }
  }

  async waitForTransaction(hash, timeout = 10000) {
    try {
      const transaction = await this.client.waitForTransaction(hash, { timeoutSecs: timeout / 1000 });
      return transaction;
    } catch (error) {
      logger.error('Failed to wait for transaction:', error);
      throw error;
    }
  }

  async estimateGasPrice() {
    try {
      const gasPrice = await this.client.estimateGasPrice();
      return gasPrice;
    } catch (error) {
      logger.error('Failed to estimate gas price:', error);
      return { gas_estimate: 1000 };
    }
  }

  async getChainId() {
    try {
      const chainId = await this.client.getChainId();
      return chainId;
    } catch (error) {
      logger.error('Failed to get chain ID:', error);
      return 1;
    }
  }

  async getLedgerInfo() {
    try {
      const ledgerInfo = await this.client.getLedgerInfo();
      return ledgerInfo;
    } catch (error) {
      logger.error('Failed to get ledger info:', error);
      throw error;
    }
  }

  // Helper method to validate Aptos address
  isValidAddress(address) {
    return /^0x[a-fA-F0-9]{64}$/.test(address);
  }

  // Helper method to validate public key
  isValidPublicKey(publicKey) {
    return /^0x[a-fA-F0-9]{64}$/.test(publicKey);
  }

  // Get network info
  getNetworkInfo() {
    return {
      network: this.network,
      nodeUrl: this.nodeUrl,
      chainId: this.getChainId()
    };
  }
}

module.exports = { AptosBlockchainService }; 