// Content Script for SafeSwap Wallet Extension
// This script injects the wallet adapter into web pages

(function() {
  'use strict';

  // SafeSwap Wallet Adapter Implementation
  class SafeSwapWalletAdapter {
    constructor() {
      this.name = 'SafeSwap';
      this.url = 'https://safeswap-frontend.onrender.com';
      this.icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iIzM4NEVGRiIvPgo8L3N2Zz4K';
      this.readyState = 'Detected';
      this.isAIP62Standard = true;
      
      this.connected = false;
      this.account = null;
      this.publicKey = null;
      this.listeners = new Map();
    }

    async connect() {
      try {
        // Get stored wallet data from extension storage
        const result = await chrome.storage.local.get(['safeSwapWallet']);
        if (result.safeSwapWallet) {
          const walletData = result.safeSwapWallet;
          this.account = walletData.address;
          this.publicKey = walletData.publicKey;
          this.connected = true;
          
          this.notifyListeners('connect', { account: this.account, publicKey: this.publicKey });
          return { account: this.account, publicKey: this.publicKey };
        }
        
        // Create new wallet account
        const account = await this.createAccount();
        this.account = account.address;
        this.publicKey = account.publicKey;
        this.connected = true;
        
        // Store wallet data
        await chrome.storage.local.set({
          safeSwapWallet: {
            address: this.account,
            publicKey: this.publicKey,
            createdAt: Date.now()
          }
        });
        
        this.notifyListeners('connect', { account: this.account, publicKey: this.publicKey });
        return { account: this.account, publicKey: this.publicKey };
      } catch (error) {
        console.error('Error connecting to SafeSwap wallet:', error);
        throw error;
      }
    }

    async disconnect() {
      try {
        this.connected = false;
        this.account = null;
        this.publicKey = null;
        
        // Clear stored wallet data
        await chrome.storage.local.remove(['safeSwapWallet']);
        
        this.notifyListeners('disconnect');
      } catch (error) {
        console.error('Error disconnecting from SafeSwap wallet:', error);
        throw error;
      }
    }

    async signAndSubmitTransaction(transaction) {
      try {
        if (!this.connected) {
          throw new Error('Wallet not connected');
        }
        
        const signedTransaction = await this.signTransaction(transaction);
        // In a real implementation, this would submit to the Aptos network
        const result = { hash: '0x' + Math.random().toString(16).substr(2, 64) };
        
        this.notifyListeners('transaction', result);
        return result;
      } catch (error) {
        console.error('Error signing and submitting transaction:', error);
        throw error;
      }
    }

    async signTransaction(transaction) {
      try {
        if (!this.connected) {
          throw new Error('Wallet not connected');
        }
        
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

    async signMessage(message) {
      try {
        if (!this.connected) {
          throw new Error('Wallet not connected');
        }
        
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

    async createAccount() {
      const address = '0x' + Math.random().toString(16).substr(2, 64);
      const publicKey = '0x' + Math.random().toString(16).substr(2, 64);
      
      return {
        address,
        publicKey,
        authKey: address
      };
    }

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
  }

  // Create wallet instance
  const safeSwapWallet = new SafeSwapWalletAdapter();

  // Register wallet with the page
  function registerWallet(wallet) {
    if (typeof window !== 'undefined') {
      // Make wallet available to the page
      window.safeSwapWallet = wallet;
      
      // Dispatch custom event to notify dapps
      window.dispatchEvent(new CustomEvent('safeSwapWalletReady', {
        detail: { wallet }
      }));
      
      console.log('SafeSwap wallet registered with page');
    }
  }

  // Auto-register wallet when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      registerWallet(safeSwapWallet);
    });
  } else {
    registerWallet(safeSwapWallet);
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'getWalletInfo') {
      sendResponse({
        name: safeSwapWallet.name,
        url: safeSwapWallet.url,
        icon: safeSwapWallet.icon,
        readyState: safeSwapWallet.readyState,
        isAIP62Standard: safeSwapWallet.isAIP62Standard,
        connected: safeSwapWallet.connected,
        account: safeSwapWallet.account,
        publicKey: safeSwapWallet.publicKey
      });
    }
  });

})();
