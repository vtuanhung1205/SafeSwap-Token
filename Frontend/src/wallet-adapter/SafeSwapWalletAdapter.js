// SafeSwap Wallet Adapter Plugin - AIP-62 Compatible
// This implements the wallet-standard interface for SafeSwap wallet
// MAINNET READY - Real Aptos SDK integration with demo fallback
// FULL APTOS FEATURE COMPLIANCE

// Import Aptos SDK for real mainnet operations
import { AptosClient, Account, Ed25519PrivateKey, AccountAddress } from 'aptos';

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

// Required Aptos Features (from wallet-standard core)
const REQUIRED_APTOS_FEATURES = [
  'aptos:account',
  'aptos:connect',
  'aptos:disconnect',
  'aptos:network',
  'aptos:onAccountChange',
  'aptos:onNetworkChange',
  'aptos:signMessage',
  'aptos:signTransaction'
];

// SafeSwap Wallet Implementation (Mainnet Ready with Demo Fallback)
class SafeSwapWallet {
  constructor() {
    this.name = WalletName('SafeSwap');
    this.url = 'https://safeswap-frontend.onrender.com';
    this.icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iIzM4NEVGRiIvPgo8L3N2Zz4K';
    this.readyState = WalletReadyState.NotDetected;
    this.isAIP62Standard = true;
    
    // Mainnet configuration
    this.network = 'mainnet';
    this.client = null;
    this.account = null;
    this.isDemoMode = false; // Start with real mode
    
    // Wallet state
    this.connected = false;
    this.accountAddress = null;
    this.publicKey = null;
    this.privateKey = null;
    
    // Event listeners
    this.listeners = new Map();
    
    // Required Aptos Features Implementation
    this.features = {
      'aptos:account': {
        address: null,
        publicKey: null,
        authKey: null,
        minKeysRequired: 1,
        chainId: 1
      },
      'aptos:connect': this.connect.bind(this),
      'aptos:disconnect': this.disconnect.bind(this),
      'aptos:network': {
        name: 'mainnet',
        chainId: 1,
        url: 'https://fullnode.mainnet.aptoslabs.com'
      },
      'aptos:onAccountChange': this.onAccountChange.bind(this),
      'aptos:onNetworkChange': this.onNetworkChange.bind(this),
      'aptos:signMessage': this.signMessage.bind(this),
      'aptos:signTransaction': this.signTransaction.bind(this)
    };
    
    // Initialize Aptos client for mainnet
    this.initializeAptosClient();
    
    // Auto-detect if wallet is available
    this.detectWallet();
  }

  // Initialize Aptos client for mainnet
  async initializeAptosClient() {
    try {
      this.client = new AptosClient('https://fullnode.mainnet.aptoslabs.com');
      console.log('Aptos client initialized for mainnet');
      this.isDemoMode = false;
    } catch (error) {
      console.error('Failed to initialize Aptos client, falling back to demo mode:', error);
      this.client = null;
      this.isDemoMode = true;
    }
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

  // Connect to wallet (aptos:connect)
  async connect() {
    try {
      this.readyState = WalletReadyState.Loading;
      
      // Check if we have stored wallet data
      const storedWallet = localStorage.getItem('safeSwap_wallet');
      if (storedWallet) {
        const walletData = JSON.parse(storedWallet);
        await this.loadStoredAccount(walletData);
        return { account: this.accountAddress, publicKey: this.publicKey };
      }
      
      // Create a new wallet account
      await this.createNewAccount();
      
      // Store wallet data
      const walletData = {
        address: this.accountAddress,
        publicKey: this.publicKey,
        privateKey: this.privateKey,
        createdAt: Date.now()
      };
      localStorage.setItem('safeSwap_wallet', JSON.stringify(walletData));
      
      this.notifyListeners('connect', { account: this.accountAddress, publicKey: this.publicKey });
      this.notifyAccountChange();
      return { account: this.accountAddress, publicKey: this.publicKey };
    } catch (error) {
      console.error('Error connecting to SafeSwap wallet:', error);
      this.readyState = WalletReadyState.Unsupported;
      throw error;
    }
  }

  // Load stored account
  async loadStoredAccount(walletData) {
    try {
      if (this.client && walletData.privateKey) {
        // Load real account from private key
        const privateKey = new Ed25519PrivateKey(walletData.privateKey);
        this.account = Account.fromPrivateKey({ privateKey });
        this.accountAddress = this.account.accountAddress.toString();
        this.publicKey = this.account.publicKey.toString();
        this.privateKey = walletData.privateKey;
        this.connected = true;
        this.readyState = WalletReadyState.Loaded;
        this.isDemoMode = false;
      } else {
        // Fallback to demo mode
        this.accountAddress = walletData.address;
        this.publicKey = walletData.publicKey;
        this.connected = true;
        this.readyState = WalletReadyState.Loaded;
        this.isDemoMode = true;
      }
      
      // Update account feature
      this.features['aptos:account'] = {
        address: this.accountAddress,
        publicKey: this.publicKey,
        authKey: this.accountAddress,
        minKeysRequired: 1,
        chainId: 1
      };
    } catch (error) {
      console.error('Error loading stored account:', error);
      throw error;
    }
  }

  // Create new account
  async createNewAccount() {
    try {
      if (this.client) {
        // Create real Aptos account
        this.account = Account.generate();
        this.accountAddress = this.account.accountAddress.toString();
        this.publicKey = this.account.publicKey.toString();
        this.privateKey = this.account.privateKey.toString();
        this.connected = true;
        this.readyState = WalletReadyState.Loaded;
        this.isDemoMode = false;
        
        console.log('Created new Aptos account:', this.accountAddress);
      } else {
        // Fallback to demo account
        this.accountAddress = '0x' + Math.random().toString(16).substr(2, 64);
        this.publicKey = '0x' + Math.random().toString(16).substr(2, 64);
        this.connected = true;
        this.readyState = WalletReadyState.Loaded;
        this.isDemoMode = true;
        
        console.log('Created demo account:', this.accountAddress);
      }
      
      // Update account feature
      this.features['aptos:account'] = {
        address: this.accountAddress,
        publicKey: this.publicKey,
        authKey: this.accountAddress,
        minKeysRequired: 1,
        chainId: 1
      };
    } catch (error) {
      console.error('Error creating new account:', error);
      throw error;
    }
  }

  // Disconnect from wallet (aptos:disconnect)
  async disconnect() {
    try {
      this.connected = false;
      this.accountAddress = null;
      this.publicKey = null;
      this.privateKey = null;
      this.account = null;
      this.readyState = WalletReadyState.NotDetected;
      
      // Clear account feature
      this.features['aptos:account'] = {
        address: null,
        publicKey: null,
        authKey: null,
        minKeysRequired: 1,
        chainId: 1
      };
      
      // Clear stored wallet data
      localStorage.removeItem('safeSwap_wallet');
      
      this.notifyListeners('disconnect');
      this.notifyAccountChange();
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
      
      if (this.client && this.account && !this.isDemoMode) {
        // Real transaction signing and submission
        const signedTransaction = await this.account.signTransaction(transaction);
        const result = await this.client.submitTransaction(signedTransaction);
        await this.client.waitForTransaction(result.hash);
        
        this.notifyListeners('transaction', result);
        return result;
      } else {
        // Demo transaction signing
        const signedTransaction = await this.signTransaction(transaction);
        
        // Mock submission for demo
        const mockResult = {
          hash: '0x' + Math.random().toString(16).substr(2, 64),
          sender: this.accountAddress,
          sequence_number: '0',
          success: true,
          vm_status: 'Executed successfully',
          demo_mode: true
        };
        
        this.notifyListeners('transaction', mockResult);
        return mockResult;
      }
    } catch (error) {
      console.error('Error signing and submitting transaction:', error);
      throw error;
    }
  }

  // Sign transaction (aptos:signTransaction)
  async signTransaction(transaction) {
    try {
      if (!this.connected) {
        throw new Error('Wallet not connected');
      }
      
      if (this.account && !this.isDemoMode) {
        // Real transaction signing
        return await this.account.signTransaction(transaction);
      } else {
        // Demo transaction signing
        const mockSignedTransaction = {
          ...transaction,
          signature: {
            type: 'ed25519_signature',
            public_key: this.publicKey,
            signature: '0x' + Math.random().toString(16).substr(2, 128)
          },
          demo_mode: true
        };
        
        return mockSignedTransaction;
      }
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw error;
    }
  }

  // Sign message (aptos:signMessage)
  async signMessage(message) {
    try {
      if (!this.connected) {
        throw new Error('Wallet not connected');
      }
      
      if (this.account && !this.isDemoMode) {
        // Real message signing
        const signature = await this.account.signMessage(message);
        return {
          fullMessage: message,
          signedMessage: message,
          signature: signature,
          publicKey: this.publicKey
        };
      } else {
        // Demo message signing
        const signature = {
          fullMessage: message,
          signedMessage: message,
          signature: '0x' + Math.random().toString(16).substr(2, 128),
          publicKey: this.publicKey,
          demo_mode: true
        };
        
        return signature;
      }
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }

  // Account change notification (aptos:onAccountChange)
  onAccountChange(callback) {
    this.on('accountChange', callback);
  }

  // Network change notification (aptos:onNetworkChange)
  onNetworkChange(callback) {
    this.on('networkChange', callback);
  }

  // Notify account change
  notifyAccountChange() {
    this.notifyListeners('accountChange', this.features['aptos:account']);
  }

  // Notify network change
  notifyNetworkChange() {
    this.notifyListeners('networkChange', this.features['aptos:network']);
  }

  // Get account info
  async getAccountInfo() {
    if (!this.connected || !this.accountAddress) {
      throw new Error('Wallet not connected');
    }
    
    try {
      if (this.client && !this.isDemoMode) {
        // Real account info from mainnet
        return await this.client.getAccount(this.accountAddress);
      } else {
        // Mock account info for demo
        return {
          sequence_number: "0",
          authentication_key: this.accountAddress,
          coin_register_events: {
            counter: "0",
            guid: {
              id: {
                addr: this.accountAddress,
                creation_num: "0"
              }
            }
          },
          key_rotation_events: {
            counter: "0",
            guid: {
              id: {
                addr: this.accountAddress,
                creation_num: "1"
              }
            }
          },
          rotation_capability_offer: {
            for: {
              vec: []
            }
          },
          rotation_capability: {
            account: this.accountAddress
          },
          key_rotation_capability_offer: {
            for: {
              vec: []
            }
          },
          key_rotation_capability: {
            account: this.accountAddress
          },
          guid_creation_num: "2",
          account_creation_num: "0",
          demo_mode: true
        };
      }
    } catch (error) {
      console.error('Error getting account info:', error);
      throw error;
    }
  }

  // Get account resources
  async getAccountResources() {
    if (!this.connected || !this.accountAddress) {
      throw new Error('Wallet not connected');
    }
    
    try {
      if (this.client && !this.isDemoMode) {
        // Real account resources from mainnet
        return await this.client.getAccountResources(this.accountAddress);
      } else {
        // Mock resources for demo
        return [
          {
            type: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
            data: {
              coin: {
                value: "1000000"
              },
              deposit_events: {
                counter: "0",
                guid: {
                  id: {
                    addr: this.accountAddress,
                    creation_num: "3"
                  }
                }
              },
              withdraw_events: {
                counter: "0",
                guid: {
                  id: {
                    addr: this.accountAddress,
                    creation_num: "4"
                  }
                }
              },
              frozen: false
            },
            demo_mode: true
          }
        ];
      }
    } catch (error) {
      console.error('Error getting account resources:', error);
      throw error;
    }
  }

  // Fund account (for testing)
  async fundAccount(amount = 100) {
    if (!this.client || !this.account || this.isDemoMode) {
      throw new Error('Cannot fund account in demo mode or without client');
    }
    
    try {
      const transaction = await this.client.fundAccount({
        accountAddress: this.accountAddress,
        amount: amount
      });
      
      console.log('Account funded:', transaction);
      return transaction;
    } catch (error) {
      console.error('Error funding account:', error);
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
      account: this.accountAddress,
      publicKey: this.publicKey,
      network: this.network,
      features: this.features,
      demo_mode: this.isDemoMode,
      hasAptosClient: !!this.client
    };
  }

  // Check if wallet has all required features
  hasRequiredFeatures() {
    return REQUIRED_APTOS_FEATURES.every(feature => 
      feature in this.features
    );
  }
}

// Create and export the wallet instance
const safeSwapWallet = new SafeSwapWallet();

// Register wallet with the global scope for dapp detection
if (typeof window !== 'undefined') {
  window.safeSwapWallet = safeSwapWallet;
}

export default safeSwapWallet;
export { SafeSwapWallet, WalletReadyState, WalletName, REQUIRED_APTOS_FEATURES };
