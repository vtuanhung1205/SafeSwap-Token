import React, { useState, useEffect } from 'react';
import { Wallet, Loader2, Shield, Key, User, Plus, Download, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { AptosClient, AptosAccount } from 'aptos';

const AptosSDKLogin = ({ onSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [client, setClient] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [walletData, setWalletData] = useState(null);

  // Initialize Aptos SDK
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Initialize client for mainnet with QuickNode
        const aptosClient = new AptosClient("https://responsive-weathered-hill.aptos-mainnet.quiknode.pro/b363dcabb59e76d6355f22f77644f3a924bce229");
        setClient(aptosClient);
        setIsInitialized(true);
        
        console.log('Aptos SDK initialized successfully');
        
        // Check for existing wallet
        const stored = localStorage.getItem('aptos_sdk_wallet');
        if (stored) {
          try {
            const existingWallet = JSON.parse(stored);
            setWalletData(existingWallet);
            console.log('Found existing wallet:', existingWallet.address);
          } catch (error) {
            console.error('Failed to parse stored wallet:', error);
            localStorage.removeItem('aptos_sdk_wallet');
          }
        }
      } catch (error) {
        console.error('Failed to initialize Aptos SDK:', error);
        toast.error('Failed to initialize Aptos SDK');
      }
    };

    initializeSDK();
  }, []);

  // Create new wallet
  const createNewWallet = async () => {
    if (!isInitialized || !client) {
      toast.error('Aptos SDK not initialized');
      return;
    }

    setIsLoading(true);
    try {
      // Create new account
      const account = new AptosAccount();
      
      const walletData = {
        address: account.address().toString(),
        publicKey: account.pubKey().toString(),
        privateKey: account.toPrivateKeyObject(),
        provider: 'aptos-sdk',
        createdAt: Date.now()
      };

      // Store wallet data securely
      localStorage.setItem('aptos_sdk_wallet', JSON.stringify(walletData));
      setWalletData(walletData);
      
      console.log('New wallet created:', walletData.address);
      toast.success('New wallet created successfully!');
      
      if (onSuccess) {
        onSuccess(walletData);
      }
    } catch (error) {
      console.error('Failed to create wallet:', error);
      toast.error('Failed to create wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Import existing wallet
  const importWallet = async () => {
    if (!privateKey.trim()) {
      toast.error('Please enter a private key');
      return;
    }

    setIsLoading(true);
    try {
      // Parse private key
      let privateKeyObj;
      try {
        if (privateKey.startsWith('0x')) {
          privateKeyObj = { privateKeyHex: privateKey.slice(2) };
        } else {
          privateKeyObj = JSON.parse(privateKey);
        }
      } catch (e) {
        privateKeyObj = { privateKeyHex: privateKey };
      }

      // Create account from private key
      const account = AptosAccount.fromPrivateKeyObject(privateKeyObj);
      
      const walletData = {
        address: account.address().toString(),
        publicKey: account.pubKey().toString(),
        privateKey: account.toPrivateKeyObject(),
        provider: 'aptos-sdk',
        imported: true,
        createdAt: Date.now()
      };

      // Store wallet data
      localStorage.setItem('aptos_sdk_wallet', JSON.stringify(walletData));
      setWalletData(walletData);
      setShowImport(false);
      setPrivateKey('');
      
      console.log('Wallet imported:', walletData.address);
      toast.success('Wallet imported successfully!');
      
      if (onSuccess) {
        onSuccess(walletData);
      }
    } catch (error) {
      console.error('Failed to import wallet:', error);
      toast.error('Invalid private key. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to existing wallet
  const connectExistingWallet = async () => {
    if (!walletData) {
      toast.error('No wallet found');
      return;
    }

    if (!client) {
      toast.error('Aptos SDK not initialized');
      return;
    }

    setIsLoading(true);
    try {
      // Verify wallet is valid by getting account info
      const accountInfo = await client.getAccount(walletData.address);
      console.log('Account info:', accountInfo);
      
      // Get balance
      const balance = await client.getAccountBalance(walletData.address);
      console.log('Balance:', balance);
      
      toast.success(`Connected to wallet: ${walletData.address.slice(0, 6)}...${walletData.address.slice(-4)}`);
      
      if (onSuccess) {
        onSuccess(walletData);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      if (error.message.includes('Account not found')) {
        toast.error('Wallet address not found on blockchain. Please check your wallet.');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Clear wallet data
  const clearWallet = () => {
    localStorage.removeItem('aptos_sdk_wallet');
    setWalletData(null);
    toast.success('Wallet data cleared');
  };

  // Copy address to clipboard
  const copyAddress = () => {
    if (walletData) {
      navigator.clipboard.writeText(walletData.address);
      toast.success('Address copied to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Wallet className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aptos SDK Wallet
        </h3>
        <p className="text-sm text-gray-600">
          Create, import, or connect to your Aptos wallet
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center justify-center space-x-2">
        {isInitialized ? (
          <div className="flex items-center space-x-2 text-green-600">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Aptos SDK Ready</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-yellow-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Initializing...</span>
          </div>
        )}
      </div>

      {/* Existing Wallet */}
      {walletData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-green-600" />
              <span className="font-medium text-green-800">Existing Wallet</span>
            </div>
            <button
              onClick={clearWallet}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Clear
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Address:</span>
              <code className="text-xs bg-green-100 px-2 py-1 rounded">
                {walletData.address.slice(0, 6)}...{walletData.address.slice(-4)}
              </code>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={connectExistingWallet}
                disabled={isLoading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-1" />
                    Connect
                  </>
                )}
              </button>
              
              <button
                onClick={copyAddress}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Options */}
      {!walletData && (
        <div className="space-y-3">
          {/* Create New Wallet */}
          <button
            onClick={createNewWallet}
            disabled={!isInitialized || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>Create New Wallet</span>
              </>
            )}
          </button>

          {/* Import Wallet */}
          <button
            onClick={() => setShowImport(!showImport)}
            disabled={!isInitialized}
            className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>Import Existing Wallet</span>
          </button>
        </div>
      )}

      {/* Import Form */}
      {showImport && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Private Key
            </label>
            <textarea
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Enter your private key..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={importWallet}
              disabled={!privateKey.trim() || isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-1" />
                  Import
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowImport(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>Your private key is stored locally and never shared</p>
        <p>Keep your private key secure and never share it with anyone</p>
        <p className="mt-2 text-blue-600">
          This uses Aptos SDK for direct blockchain interaction
        </p>
      </div>
    </div>
  );
};

export default AptosSDKLogin; 