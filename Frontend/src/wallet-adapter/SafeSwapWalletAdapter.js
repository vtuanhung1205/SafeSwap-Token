// SafeSwap Wallet Adapter Plugin - AIP-62 Compatible
// This implements the wallet-standard interface for SafeSwap wallet

import { AptosClient } from 'aptos';

// Wallet Standard Types
const WalletReadyState = {
  NotDetected: 'NotDetected',
  Detected: 'Detected',
  Loadable: 'Loadable',
  Loading: 'Loading',
  Loaded: 'Loaded',
  Unsupported: 'Unsupported',
};

const WalletName = (name) => name;

// SafeSwap Wallet Implementation
class SafeSwapWallet {
  constructor() {
    this.name = WalletName('SafeSwap');
    this.url = 'https://safeswap-frontend.onrender.com';
    this.icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iIzM4NEVGRiIvPgo8L3N2Zz4K';
    this.readyState = WalletReadyState.NotDetected;
    this.isAIP62Standard = true;
    
    // Initialize Aptos client
    this.client = new AptosClient('https://fullnode.mainnet.aptoslabs.com');
    
    // Wallet state
    this.connected = false;
    this.account = null;
    this.publicKey = null;
    
    // Event listeners
    this.listeners = new Map();
    
    // Auto-detect if wallet is available
    this.detectWallet();
  }

  // Detect if SafeSwap wallet is available
  async detectWallet() {
    try {
      // Check if we're in a browser extension context
      if (typeof window !== 'undefined' && window.safeSwapWallet) {
        this.readyState = WalletReadyState.Detected;
        return true;
      }
      
      // Check if we have stored wallet data
      const storedWallet = localStorage.getItem('safeSwap_wallet');
      if (storedWallet) {
        this.readyState = WalletReadyState.Loaded;
        return true;
      }
      
      this.readyState = WalletReadyState.NotDetected;
      return false;
    } catch (error) {
      console.error('Error detecting SafeSwap wallet:', error);
      this.readyState = WalletReadyState.Unsupported;
      return false;
    }
  }

  // Connect to wallet
  async connect() {
    try {
      this.readyState = WalletReadyState.Loading;
      
      // Check if we have stored wallet data
      const storedWallet = localStorage.getItem('safeSwap_wallet');
      if (storedWallet) {
        const walletData = JSON.parse(storedWallet);
        this.account = walletData.address;
        this.publicKey = walletData.publicKey;
        this.connected = true;
        this.readyState = WalletReadyState.Loaded;
        
        this.notifyListeners('connect', { account: this.account, publicKey: this.publicKey });
        return { account: this.account, publicKey: this.publicKey };
      }
      
      // Create a new wallet account (for demo purposes)
      const account = await this.createAccount();
      this.account = account.address;
      this.publicKey = account.publicKey;
      this.connected = true;
      this.readyState = WalletReadyState.Loaded;
      
      // Store wallet data
      const walletData = {
        address: this.account,
        publicKey: this.publicKey,
        createdAt: Date.now()
      };
      localStorage.setItem('safeSwap_wallet', JSON.stringify(walletData));
      
      this.notifyListeners('connect', { account: this.account, publicKey: this.publicKey });
      return { account: this.account, publicKey: this.publicKey };
    } catch (error) {
      console.error('Error connecting to SafeSwap wallet:', error);
      this.readyState = WalletReadyState.Unsupported;
      throw error;
    }
  }

  // Disconnect from wallet
  async disconnect() {
    try {
      this.connected = false;
      this.account = null;
      this.publicKey = null;
      this.readyState = WalletReadyState.NotDetected;
      
      // Clear stored wallet data
      localStorage.removeItem('safeSwap_wallet');
      
      this.notifyListeners('disconnect');
    } catch (error) {
      console.error('Error disconnecting from SafeSwap wallet:', error);
      throw error;
    }
  }

  // Sign and submit transaction
  async signAndSubmitTransaction(transaction) {
    try {
      if (!this.connected) {
        throw new Error('Wallet not connected');
      }
      
      // For demo purposes, we'll simulate transaction signing
      // In a real implementation, this would use the actual wallet's signing mechanism
      const signedTransaction = await this.signTransaction(transaction);
      const result = await this.client.submitTransaction(signedTransaction);
      
      this.notifyListeners('transaction', result);
      return result;
    } catch (error) {
      console.error('Error signing and submitting transaction:', error);
      throw error;
    }
  }

  // Sign transaction
  async signTransaction(transaction) {
    try {
      if (!this.connected) {
        throw new Error('Wallet not connected');
      }
      
      // For demo purposes, we'll create a mock signed transaction
      // In a real implementation, this would use the actual wallet's signing mechanism
      const mockSignedTransaction = {
        ...transaction,
        signature: {
          type: 'ed25519_signature',
          public_key: this.publicKey,
          signature: '0x' + Math.random().toString(16).substr(2, 128)
        }
      };
      
      return mockSignedTransaction;
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  }

  // Sign message
  async signMessage(message) {
    try {
      if (!this.connected) {
        throw new Error('Wallet not connected');
      }
      
      // For demo purposes, we'll create a mock signature
      // In a real implementation, this would use the actual wallet's signing mechanism
      const signature = {
        fullMessage: message,
        signedMessage: message,
        signature: '0x' + Math.random().toString(16).substr(2, 128),
        publicKey: this.publicKey
      };
      
      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }

  // Create account (for demo purposes)
  async createAccount() {
    // Generate a mock account for demo purposes
    // In a real implementation, this would create an actual Aptos account
    const address = '0x' + Math.random().toString(16).substr(2, 64);
    const publicKey = '0x' + Math.random().toString(16).substr(2, 64);
    
    return {
      address,
      publicKey,
      authKey: address
    };
  }

  // Get account info
  async getAccountInfo() {
    if (!this.connected || !this.account) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const accountInfo = await this.client.getAccount(this.account);
      return accountInfo;
    } catch (error) {
      console.error('Error getting account info:', error);
      throw error;
    }
  }

  // Get account resources
  async getAccountResources() {
    if (!this.connected || !this.account) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const resources = await this.client.getAccountResources(this.account);
      return resources;
    } catch (error) {
      console.error('Error getting account resources:', error);
      throw error;
    }
  }

  // Event listeners
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in wallet event listener:', error);
        }
      });
    }
  }

  // Get wallet info
  getWalletInfo() {
    return {
      name: this.name,
      url: this.url,
      icon: this.icon,
      readyState: this.readyState,
      isAIP62Standard: this.isAIP62Standard,
      connected: this.connected,
      account: this.account,
      publicKey: this.publicKey
    };
  }
}

// Create and export the wallet instance
const safeSwapWallet = new SafeSwapWallet();

// Register wallet with the global scope for dapp detection
if (typeof window !== 'undefined') {
  window.safeSwapWallet = safeSwapWallet;
}

export default safeSwapWallet;
export { SafeSwapWallet, WalletReadyState, WalletName };
