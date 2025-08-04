const { AptosAccount, AptosClient, TxnBuilderTypes, BCS, HexString } = require('aptos');
const logger = require('../utils/logger');
const aptosService = require('./aptosService');

class WalletService {
  constructor() {
    this.supportedWallets = ['petra', 'martian', 'pontem', 'fewcha', 'nightly'];
  }

  // Generate new wallet
  async generateWallet() {
    try {
      const account = new AptosAccount();
      
      return {
        address: account.address().hex(),
        publicKey: account.publicKey().hex(),
        privateKey: account.toPrivateKeyObject().privateKeyHex,
        authKey: account.authKey().hex()
      };
    } catch (error) {
      logger.error('Error generating wallet:', error);
      throw error;
    }
  }

  // Import wallet from private key
  async importWallet(privateKeyHex) {
    try {
      const account = new AptosAccount(HexString.ensure(privateKeyHex).toUint8Array());
      
      return {
        address: account.address().hex(),
        publicKey: account.publicKey().hex(),
        authKey: account.authKey().hex()
      };
    } catch (error) {
      logger.error('Error importing wallet:', error);
      throw error;
    }
  }

  // Validate wallet address
  validateWalletAddress(address) {
    return aptosService.isValidAddress(address);
  }

  // Get wallet balance
  async getWalletBalance(address) {
    try {
      const balance = await aptosService.getAccountBalance(address);
      return balance;
    } catch (error) {
      logger.error(`Error getting wallet balance for ${address}:`, error);
      throw error;
    }
  }

  // Get wallet tokens
  async getWalletTokens(address) {
    try {
      const balances = await aptosService.getAllTokenBalances(address);
      return balances;
    } catch (error) {
      logger.error(`Error getting wallet tokens for ${address}:`, error);
      throw error;
    }
  }

  // Sign and submit transaction
  async signAndSubmitTransaction(privateKeyHex, payload, maxGasAmount = 2000) {
    try {
      const account = new AptosAccount(HexString.ensure(privateKeyHex).toUint8Array());
      
      const result = await aptosService.submitTransaction(account, payload, maxGasAmount);
      
      return {
        success: true,
        hash: result.hash,
        gasUsed: result.gasUsed,
        vmStatus: result.vmStatus
      };
    } catch (error) {
      logger.error('Error signing and submitting transaction:', error);
      throw error;
    }
  }

  // Create transfer transaction
  async createTransferTransaction(privateKeyHex, toAddress, amount, tokenAddress, tokenName) {
    try {
      // Validate addresses
      if (!this.validateWalletAddress(toAddress)) {
        throw new Error('Invalid recipient address');
      }
      
      if (!this.validateWalletAddress(tokenAddress)) {
        throw new Error('Invalid token address');
      }
      
      // Create transfer payload
      const payload = aptosService.createTransferPayload(toAddress, amount, tokenAddress, tokenName);
      
      // Sign and submit
      const result = await this.signAndSubmitTransaction(privateKeyHex, payload);
      
      return result;
    } catch (error) {
      logger.error('Error creating transfer transaction:', error);
      throw error;
    }
  }

  // Estimate transaction fee
  async estimateTransactionFee(senderAddress, payload) {
    try {
      const estimation = await aptosService.estimateGas(payload, senderAddress);
      return estimation;
    } catch (error) {
      logger.error('Error estimating transaction fee:', error);
      throw error;
    }
  }

  // Get transaction history
  async getTransactionHistory(address, limit = 50) {
    try {
      const transactions = await aptosService.getAccountTransactions(address, limit);
      return transactions;
    } catch (error) {
      logger.error(`Error getting transaction history for ${address}:`, error);
      throw error;
    }
  }

  // Check wallet connection
  async checkWalletConnection(address) {
    try {
      const exists = await aptosService.accountExists(address);
      if (!exists) {
        return {
          connected: false,
          error: 'Wallet address does not exist on Aptos network'
        };
      }
      
      const balance = await this.getWalletBalance(address);
      
      return {
        connected: true,
        address,
        balance: balance.formattedAmount,
        hasBalance: parseFloat(balance.amount) > 0
      };
    } catch (error) {
      logger.error(`Error checking wallet connection for ${address}:`, error);
      return {
        connected: false,
        error: error.message
      };
    }
  }

  // Get wallet info
  async getWalletInfo(address) {
    try {
      const accountInfo = await aptosService.getAccountInfo(address);
      const balance = await this.getWalletBalance(address);
      const tokens = await this.getWalletTokens(address);
      
      return {
        address,
        accountInfo,
        balance,
        tokens: tokens.length,
        totalTokens: tokens,
        sequenceNumber: accountInfo.sequence_number,
        hasResources: accountInfo.hasResources
      };
    } catch (error) {
      logger.error(`Error getting wallet info for ${address}:`, error);
      throw error;
    }
  }

  // Validate transaction before submission
  async validateTransaction(senderAddress, toAddress, amount, tokenAddress) {
    try {
      const validations = {
        senderAddress: this.validateWalletAddress(senderAddress),
        recipientAddress: this.validateWalletAddress(toAddress),
        tokenAddress: this.validateWalletAddress(tokenAddress),
        amount: parseFloat(amount) > 0
      };
      
      const isValid = Object.values(validations).every(v => v === true);
      
      if (!isValid) {
        const errors = [];
        if (!validations.senderAddress) errors.push('Invalid sender address');
        if (!validations.recipientAddress) errors.push('Invalid recipient address');
        if (!validations.tokenAddress) errors.push('Invalid token address');
        if (!validations.amount) errors.push('Invalid amount');
        
        return {
          isValid: false,
          errors
        };
      }
      
      // Check if sender has sufficient balance
      const balance = await this.getWalletBalance(senderAddress);
      const hasSufficientBalance = parseFloat(balance.amount) >= parseFloat(amount);
      
      return {
        isValid: hasSufficientBalance,
        balance: balance.formattedAmount,
        requiredAmount: amount,
        hasSufficientBalance,
        errors: hasSufficientBalance ? [] : ['Insufficient balance']
      };
    } catch (error) {
      logger.error('Error validating transaction:', error);
      return {
        isValid: false,
        errors: [error.message]
      };
    }
  }

  // Get supported wallets
  getSupportedWallets() {
    return this.supportedWallets.map(wallet => ({
      name: wallet,
      displayName: this.getWalletDisplayName(wallet),
      website: this.getWalletWebsite(wallet)
    }));
  }

  // Get wallet display name
  getWalletDisplayName(walletName) {
    const displayNames = {
      petra: 'Petra Wallet',
      martian: 'Martian Wallet',
      pontem: 'Pontem Wallet',
      fewcha: 'Fewcha Wallet',
      nightly: 'Nightly Wallet'
    };
    
    return displayNames[walletName] || walletName;
  }

  // Get wallet website
  getWalletWebsite(walletName) {
    const websites = {
      petra: 'https://petra.app',
      martian: 'https://martianwallet.xyz',
      pontem: 'https://pontem.wallet',
      fewcha: 'https://fewcha.app',
      nightly: 'https://wallet.nightly.app'
    };
    
    return websites[walletName] || '';
  }

  // Generate wallet QR code data
  generateWalletQRData(address) {
    return {
      type: 'aptos-wallet',
      address,
      network: 'mainnet',
      timestamp: Date.now()
    };
  }

  // Parse wallet QR code data
  parseWalletQRData(qrData) {
    try {
      const data = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
      
      if (data.type === 'aptos-wallet' && this.validateWalletAddress(data.address)) {
        return {
          isValid: true,
          address: data.address,
          network: data.network || 'mainnet',
          timestamp: data.timestamp
        };
      }
      
      return {
        isValid: false,
        error: 'Invalid QR code data'
      };
    } catch (error) {
      return {
        isValid: false,
        error: 'Invalid QR code format'
      };
    }
  }
}

module.exports = new WalletService(); 