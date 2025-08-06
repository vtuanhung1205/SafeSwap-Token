import React, { useState, useEffect } from 'react';
import { Wallet, Loader2, Shield, Key, User } from 'lucide-react';
import toast from 'react-hot-toast';

const AptosWalletLogin = ({ onSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [account, setAccount] = useState(null);
  const [client, setClient] = useState(null);

  // Initialize Aptos SDK
  useEffect(() => {
    const initializeAptos = async () => {
      try {
        // Import Aptos SDK dynamically
        const { AptosClient, AptosAccount } = await import('aptos');
        
        // Initialize client - you can change the network as needed
        const aptosClient = new AptosClient("https://fullnode.devnet.aptoslabs.com");
        setClient(aptosClient);
        setIsInitialized(true);
        
        console.log('Aptos SDK initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Aptos SDK:', error);
        toast.error('Failed to initialize Aptos SDK');
      }
    };

    initializeAptos();
  }, []);

  // Create new wallet
  const createNewWallet = async () => {
    if (!isInitialized) {
      toast.error('Aptos SDK not initialized');
      return;
    }

    setIsLoading(true);
    try {
      const { AptosAccount } = await import('aptos');
      
      // Create new account
      const newAccount = new AptosAccount();
      const address = newAccount.address().hex();
      
      setAccount(newAccount);
      setWalletAddress(address);
      
      toast.success('New wallet created successfully!');
      
      // Store wallet info (in production, you'd want to encrypt this)
      const walletInfo = {
        address: address,
        publicKey: newAccount.publicKey().hex(),
        privateKey: newAccount.toPrivateKeyObject().privateKeyHex,
      };
      
      localStorage.setItem('aptos_wallet', JSON.stringify(walletInfo));
      
      if (onSuccess) {
        onSuccess({
          type: 'new_wallet',
          address: address,
          account: newAccount
        });
      }
      
    } catch (error) {
      console.error('Error creating wallet:', error);
      toast.error('Failed to create new wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Import existing wallet
  const importExistingWallet = async () => {
    if (!isInitialized) {
      toast.error('Aptos SDK not initialized');
      return;
    }

    setIsLoading(true);
    try {
      const { AptosAccount } = await import('aptos');
      
      // For demo purposes, we'll create a new account
      // In production, you'd want to import from private key or seed phrase
      const newAccount = new AptosAccount();
      const address = newAccount.address().hex();
      
      setAccount(newAccount);
      setWalletAddress(address);
      
      toast.success('Wallet imported successfully!');
      
      if (onSuccess) {
        onSuccess({
          type: 'imported_wallet',
          address: address,
          account: newAccount
        });
      }
      
    } catch (error) {
      console.error('Error importing wallet:', error);
      toast.error('Failed to import wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to existing wallet (if available)
  const connectExistingWallet = async () => {
    const storedWallet = localStorage.getItem('aptos_wallet');
    
    if (!storedWallet) {
      toast.error('No existing wallet found');
      return;
    }

    setIsLoading(true);
    try {
      const { AptosAccount } = await import('aptos');
      const walletInfo = JSON.parse(storedWallet);
      
      // Recreate account from stored private key
      const existingAccount = new AptosAccount(walletInfo.privateKey);
      const address = existingAccount.address().hex();
      
      setAccount(existingAccount);
      setWalletAddress(address);
      
      toast.success('Connected to existing wallet!');
      
      if (onSuccess) {
        onSuccess({
          type: 'connected_wallet',
          address: address,
          account: existingAccount
        });
      }
      
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      toast.error('Failed to connect to existing wallet');
    } finally {
      setIsLoading(false);
    }
  };

  // Get account balance
  const getAccountBalance = async () => {
    if (!client || !account) {
      toast.error('No wallet connected');
      return;
    }

    try {
      const balance = await client.getAccountBalance(account.address());
      toast.success(`Balance: ${balance.octa} octa`);
    } catch (error) {
      console.error('Error getting balance:', error);
      toast.error('Failed to get account balance');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Aptos Wallet</h2>
        <p className="text-gray-400">Connect to your Aptos wallet</p>
      </div>

      {/* Wallet Address Display */}
      {walletAddress && (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <User size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">Wallet Address</span>
          </div>
          <div className="font-mono text-sm text-white break-all">
            {walletAddress}
          </div>
          <button
            onClick={getAccountBalance}
            className="mt-3 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition-colors"
          >
            Check Balance
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Create New Wallet */}
        <button
          onClick={createNewWallet}
          disabled={isLoading || !isInitialized}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl py-3 px-4 font-semibold flex items-center justify-center gap-3 hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Creating...
            </div>
          ) : (
            <>
              <Key size={20} />
              Create New Wallet
            </>
          )}
        </button>

        {/* Import Existing Wallet */}
        <button
          onClick={importExistingWallet}
          disabled={isLoading || !isInitialized}
          className="w-full bg-gray-700 text-white rounded-xl py-3 px-4 font-semibold flex items-center justify-center gap-3 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Importing...
            </div>
          ) : (
            <>
              <Shield size={20} />
              Import Wallet
            </>
          )}
        </button>

        {/* Connect to Existing Wallet */}
        <button
          onClick={connectExistingWallet}
          disabled={isLoading || !isInitialized}
          className="w-full bg-green-600 text-white rounded-xl py-3 px-4 font-semibold flex items-center justify-center gap-3 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Connecting...
            </div>
          ) : (
            <>
              <Wallet size={20} />
              Connect Existing Wallet
            </>
          )}
        </button>
      </div>

      {/* Info Section */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-2">About Aptos Wallets</h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Create new wallets for testing and development</li>
          <li>• Import existing wallets using private keys</li>
          <li>• Connect to previously created wallets</li>
          <li>• All wallet data is stored locally</li>
        </ul>
      </div>

      {/* Network Info */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Connected to: <span className="text-blue-400">Aptos Devnet</span>
        </p>
      </div>
    </div>
  );
};

export default AptosWalletLogin; 