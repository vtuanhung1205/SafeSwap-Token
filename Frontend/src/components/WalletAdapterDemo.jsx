import React, { useState, useEffect } from 'react';
import { Wallet, Send, MessageSquare, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import safeSwapWallet from '../wallet-adapter/SafeSwapWalletAdapter.js';

const WalletAdapterDemo = () => {
  const [walletInfo, setWalletInfo] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [resources, setResources] = useState([]);

  useEffect(() => {
    // Check initial wallet state
    checkWalletState();
    
    // Listen for wallet events
    safeSwapWallet.on('connect', handleWalletConnect);
    safeSwapWallet.on('disconnect', handleWalletDisconnect);
    safeSwapWallet.on('transaction', handleTransaction);
    
    return () => {
      safeSwapWallet.off('connect', handleWalletConnect);
      safeSwapWallet.off('disconnect', handleWalletDisconnect);
      safeSwapWallet.off('transaction', handleTransaction);
    };
  }, []);

  const checkWalletState = () => {
    const info = safeSwapWallet.getWalletInfo();
    setWalletInfo(info);
    setIsConnected(info.connected);
  };

  const handleWalletConnect = (data) => {
    console.log('Wallet connected:', data);
    setIsConnected(true);
    setWalletInfo(safeSwapWallet.getWalletInfo());
    toast.success('Wallet connected successfully!');
  };

  const handleWalletDisconnect = () => {
    console.log('Wallet disconnected');
    setIsConnected(false);
    setWalletInfo(safeSwapWallet.getWalletInfo());
    setAccountInfo(null);
    setResources([]);
    toast.success('Wallet disconnected');
  };

  const handleTransaction = (result) => {
    console.log('Transaction completed:', result);
    toast.success('Transaction completed successfully!');
  };

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      const result = await safeSwapWallet.connect();
      console.log('Connection result:', result);
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    setIsLoading(true);
    try {
      await safeSwapWallet.disconnect();
    } catch (error) {
      console.error('Disconnection error:', error);
      toast.error('Failed to disconnect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const getAccountInfo = async () => {
    if (!isConnected) {
      toast.error('Please connect wallet first');
      return;
    }
    
    setIsLoading(true);
    try {
      const info = await safeSwapWallet.getAccountInfo();
      setAccountInfo(info);
      toast.success('Account info retrieved');
    } catch (error) {
      console.error('Error getting account info:', error);
      toast.error('Failed to get account info');
    } finally {
      setIsLoading(false);
    }
  };

  const getAccountResources = async () => {
    if (!isConnected) {
      toast.error('Please connect wallet first');
      return;
    }
    
    setIsLoading(true);
    try {
      const accountResources = await safeSwapWallet.getAccountResources();
      setResources(accountResources);
      toast.success('Account resources retrieved');
    } catch (error) {
      console.error('Error getting account resources:', error);
      toast.error('Failed to get account resources');
    } finally {
      setIsLoading(false);
    }
  };

  const signMessage = async () => {
    if (!isConnected) {
      toast.error('Please connect wallet first');
      return;
    }
    
    const message = prompt('Enter message to sign:');
    if (!message) return;
    
    setIsLoading(true);
    try {
      const signature = await safeSwapWallet.signMessage(message);
      console.log('Message signature:', signature);
      toast.success('Message signed successfully!');
    } catch (error) {
      console.error('Error signing message:', error);
      toast.error('Failed to sign message');
    } finally {
      setIsLoading(false);
    }
  };

  const signTransaction = async () => {
    if (!isConnected) {
      toast.error('Please connect wallet first');
      return;
    }
    
    // Create a mock transaction for demo
    const mockTransaction = {
      sender: walletInfo?.account,
      sequence_number: "0",
      max_gas_amount: "1000",
      gas_unit_price: "1",
      expiration_timestamp_secs: Math.floor(Date.now() / 1000) + 600,
      payload: {
        type: "entry_function_payload",
        function: "0x1::coin::transfer",
        type_arguments: ["0x1::aptos_coin::AptosCoin"],
        arguments: ["0x123", "1000"]
      }
    };
    
    setIsLoading(true);
    try {
      const signedTx = await safeSwapWallet.signTransaction(mockTransaction);
      console.log('Signed transaction:', signedTx);
      toast.success('Transaction signed successfully!');
    } catch (error) {
      console.error('Error signing transaction:', error);
      toast.error('Failed to sign transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          SafeSwap Wallet Adapter Demo
        </h1>
        <p className="text-gray-600">
          Test the AIP-62 compatible wallet adapter functionality
        </p>
      </div>

      {/* Wallet Status */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Wallet className="w-5 h-5 mr-2" />
          Wallet Status
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p><strong>Name:</strong> {walletInfo?.name || 'Unknown'}</p>
            <p><strong>Ready State:</strong> {walletInfo?.readyState || 'Unknown'}</p>
            <p><strong>AIP-62 Standard:</strong> {walletInfo?.isAIP62Standard ? 'Yes' : 'No'}</p>
            <p><strong>Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
          </div>
          
          <div className="space-y-2">
            <p><strong>Account:</strong> {walletInfo?.account ? `${walletInfo.account.slice(0, 6)}...${walletInfo.account.slice(-4)}` : 'Not connected'}</p>
            <p><strong>Public Key:</strong> {walletInfo?.publicKey ? `${walletInfo.publicKey.slice(0, 6)}...${walletInfo.publicKey.slice(-4)}` : 'Not connected'}</p>
            <p><strong>URL:</strong> {walletInfo?.url || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Connection Controls */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Connection</h2>
        
        <div className="flex flex-wrap gap-4">
          <button
            onClick={connectWallet}
            disabled={isLoading || isConnected}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Connect Wallet
          </button>
          
          <button
            onClick={disconnectWallet}
            disabled={isLoading || !isConnected}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <X className="w-4 h-4 mr-2" />
            Disconnect Wallet
          </button>
        </div>
      </div>

      {/* Wallet Functions */}
      {isConnected && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Functions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={getAccountInfo}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Get Account Info
            </button>
            
            <button
              onClick={getAccountResources}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Get Resources
            </button>
            
            <button
              onClick={signMessage}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Sign Message
            </button>
            
            <button
              onClick={signTransaction}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Sign Transaction
            </button>
          </div>
        </div>
      )}

      {/* Account Info Display */}
      {accountInfo && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            {JSON.stringify(accountInfo, null, 2)}
          </pre>
        </div>
      )}

      {/* Resources Display */}
      {resources.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Account Resources</h2>
          <div className="space-y-2">
            {resources.map((resource, index) => (
              <div key={index} className="bg-gray-100 p-3 rounded-lg">
                <p><strong>Type:</strong> {resource.type}</p>
                <p><strong>Data:</strong> {JSON.stringify(resource.data, null, 2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">How to Test:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Click "Connect Wallet" to establish a connection</li>
          <li>Use the wallet functions to test different capabilities</li>
          <li>Check the console for detailed logs</li>
          <li>Try signing messages and transactions</li>
          <li>View account information and resources</li>
        </ol>
      </div>
    </div>
  );
};

export default WalletAdapterDemo;
