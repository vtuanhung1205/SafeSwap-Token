// SafeSwap Wallet Adapter Plugin - AIP-62 Compatible
// This implements the wallet-standard interface for SafeSwap wallet
// DEMO MODE - No external dependencies to avoid conflicts
// FULL APTOS FEATURE COMPLIANCE

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

// SafeSwap Wallet Implementation (Demo Mode with Full Aptos Compliance)
class SafeSwapWallet {
  constructor() {
    this.name = WalletName('SafeSwap');
    this.url = 'https://safeswap-frontend.onrender.com';
    this.icon = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDkuNzRMMTIgMTZMMTAuOTEgOS43NEw0IDlMMTAuOTEgOC4yNkwxMiAyWiIgZmlsbD0iIzM4NEVGRiIvPgo8L3N2Zz4K';
    this.readyState = WalletReadyState.NotDetected;
    this.isAIP62Standard = true;
    
    // Demo mode - no external dependencies
    this.client = null;
    this.isDemoMode = true;
    
    // Wallet state
    this.connected = false;
    this.account = null;
    this.publicKey = null;
    this.network = 'mainnet';
    
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

  // Connect to wallet (aptos:connect)
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
        
        // Update account feature
        this.features['aptos:account'] = {
          address: this.account,
          publicKey: this.publicKey,
          authKey: this.account,
          minKeysRequired: 1,
          chainId: 1
        };
        
        this.notifyListeners('connect', { account: this.account, publicKey: this.publicKey });
        this.notifyAccountChange();
        return { account: this.account, publicKey: this.publicKey };
      }
      
      // Create a new wallet account (for demo purposes)
      const account = await this.createAccount();
      this.account = account.address;
      this.publicKey = account.publicKey;
      this.connected = true;
      this.readyState = WalletReadyState.Loaded;
      
      // Update account feature
      this.features['aptos:account'] = {
        address: this.account,
        publicKey: this.publicKey,
        authKey: this.account,
        minKeysRequired: 1,
        chainId: 1
      };
      
      // Store wallet data
      const walletData = {
        address: this.account,
        publicKey: this.publicKey,
        createdAt: Date.now()
      };
      localStorage.setItem('safeSwap_wallet', JSON.stringify(walletData));
      
      this.notifyListeners('connect', { account: this.account, publicKey: this.publicKey });
      this.notifyAccountChange();
      return { account: this.account, publicKey: this.publicKey };
    } catch (error) {
      console.error('Error connecting to SafeSwap wallet:', error);
      this.readyState = WalletReadyState.Unsupported;
      throw error;
    }
  }

  // Disconnect from wallet (aptos:disconnect)
  async disconnect() {
    try {
      this.connected = false;
      this.account = null;
      this.publicKey = null;
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

  // Sign and submit transaction (Demo Mode)
  async signAndSubmitTransaction(transaction) {
    try {
      if (!this.connected) {
        throw new Error('Wallet not connected');
      }
      
      // For demo purposes, we'll simulate transaction signing
      const signedTransaction = await this.signTransaction(transaction);
      
      // Mock submission for demo
      const mockResult = {
        hash: '0x' + Math.random().toString(16).substr(2, 64),
        sender: this.account,
        sequence_number: '0',
        success: true,
        vm_status: 'Executed successfully',
        demo_mode: true
      };
      
      this.notifyListeners('transaction', mockResult);
      return mockResult;
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
      
      // For demo purposes, we'll create a mock signed transaction
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
      
      // For demo purposes, we'll create a mock signature
      const signature = {
        fullMessage: message,
        signedMessage: message,
        signature: '0x' + Math.random().toString(16).substr(2, 128),
        publicKey: this.publicKey,
        demo_mode: true
      };
      
      return signature;
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

  // Create account (for demo purposes)
  async createAccount() {
    // Generate a mock account for demo purposes
    const address = '0x' + Math.random().toString(16).substr(2, 64);
    const publicKey = '0x' + Math.random().toString(16).substr(2, 64);
    
    return {
      address,
      publicKey,
      authKey: address
    };
  }

  // Get account info (Demo Mode)
  async getAccountInfo() {
    if (!this.connected || !this.account) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // Return mock account info for demo
      return {
        sequence_number: "0",
        authentication_key: this.account,
        coin_register_events: {
          counter: "0",
          guid: {
            id: {
              addr: this.account,
              creation_num: "0"
            }
          }
        },
        key_rotation_events: {
          counter: "0",
          guid: {
            id: {
              addr: this.account,
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
          account: this.account
        },
        key_rotation_capability_offer: {
          for: {
            vec: []
          }
        },
        key_rotation_capability: {
          account: this.account
        },
        guid_creation_num: "2",
        account_creation_num: "0",
        demo_mode: true
      };
    } catch (error) {
      console.error('Error getting account info:', error);
      throw error;
    }
  }

  // Get account resources (Demo Mode)
  async getAccountResources() {
    if (!this.connected || !this.account) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // Return mock resources for demo
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
                  addr: this.account,
                  creation_num: "3"
                }
              }
            },
            withdraw_events: {
              counter: "0",
              guid: {
                id: {
                  addr: this.account,
                  creation_num: "4"
                }
              }
            },
            frozen: false
          },
          demo_mode: true
        }
      ];
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
      publicKey: this.publicKey,
      network: this.network,
      features: this.features,
      demo_mode: this.isDemoMode
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
