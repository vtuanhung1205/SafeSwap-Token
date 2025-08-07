import React, { useState, useEffect } from 'react';
import { Wallet, Send, MessageSquare, RefreshCw, X, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import safeSwapWallet from '../wallet-adapter/SafeSwapWalletAdapter.js';
import { registerSafeSwapWallet } from '../wallet-adapter/registerWallet.js';

// Error boundary component for wallet adapter
class WalletAdapterErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Wallet Adapter Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-900 mb-4">
              Wallet Adapter Error
            </h2>
            <p className="text-red-800 mb-4">
              There was an error with the wallet adapter. This might be due to network issues or Aptos Connect conflicts.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const WalletAdapterDemo = () => {
  const [walletInfo, setWalletInfo] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [resources, setResources] = useState([]);
  const [error, setError] = useState(null);
  const [walletRegistered, setWalletRegistered] = useState(false);

  useEffect(() => {
    // Manually register the wallet for this demo
    const registerWallet = async () => {
      try {
        const success = registerSafeSwapWallet();
        setWalletRegistered(success);
        console.log('Wallet registration result:', success);
      } catch (err) {
        console.error('Failed to register wallet:', err);
        setWalletRegistered(false);
      }
    };

    registerWallet();
    
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
    try {
      const info = safeSwapWallet.getWalletInfo();
      setWalletInfo(info);
      setIsConnected(info.connected);
      setError(null);
    } catch (err) {
      console.error('Error checking wallet state:', err);
      setError('Failed to check wallet state');
    }
  };

  const handleWalletConnect = (data) => {
    console.log('Wallet connected:', data);
    setIsConnected(true);
    setWalletInfo(safeSwapWallet.getWalletInfo());
    setError(null);
    toast.success('Wallet connected successfully!');
  };

  const handleWalletDisconnect = () => {
    console.log('Wallet disconnected');
    setIsConnected(false);
    setWalletInfo(safeSwapWallet.getWalletInfo());
    setAccountInfo(null);
    setResources([]);
    setError(null);
    toast.success('Wallet disconnected');
  };

  const handleTransaction = (result) => {
    console.log('Transaction completed:', result);
    toast.success('Transaction completed successfully!');
  };

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await safeSwapWallet.connect();
      console.log('Connection result:', result);
    } catch (error) {
      console.error('Connection error:', error);
      setError('Failed to connect wallet: ' + error.message);
      toast.error('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await safeSwapWallet.disconnect();
    } catch (error) {
      console.error('Disconnection error:', error);
      setError('Failed to disconnect wallet: ' + error.message);
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
    setError(null);
    try {
      const info = await safeSwapWallet.getAccountInfo();
      setAccountInfo(info);
      toast.success('Account info retrieved');
    } catch (error) {
      console.error('Error getting account info:', error);
      setError('Failed to get account info: ' + error.message);
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
    setError(null);
    try {
      const accountResources = await safeSwapWallet.getAccountResources();
      setResources(accountResources);
      toast.success('Account resources retrieved');
    } catch (error) {
      console.error('Error getting account resources:', error);
      setError('Failed to get account resources: ' + error.message);
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
    setError(null);
    try {
      const signature = await safeSwapWallet.signMessage(message);
      console.log('Message signature:', signature);
      toast.success('Message signed successfully!');
    } catch (error) {
      console.error('Error signing message:', error);
      setError('Failed to sign message: ' + error.message);
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
    setError(null);
    try {
      const signedTx = await safeSwapWallet.signTransaction(mockTransaction);
      console.log('Signed transaction:', signedTx);
      toast.success('Transaction signed successfully!');
    } catch (error) {
      console.error('Error signing transaction:', error);
      setError('Failed to sign transaction: ' + error.message);
      toast.error('Failed to sign transaction');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WalletAdapterErrorBoundary>
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

        {/* Registration Status */}
        <div className={`border rounded-lg p-4 ${walletRegistered ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center">
            <Info className={`w-5 h-5 mr-2 ${walletRegistered ? 'text-green-600' : 'text-yellow-600'}`} />
            <div>
              <h3 className={`font-semibold ${walletRegistered ? 'text-green-900' : 'text-yellow-900'}`}>
                {walletRegistered ? 'Wallet Registered Successfully' : 'Wallet Registration Pending'}
              </h3>
              <p className={`text-sm ${walletRegistered ? 'text-green-800' : 'text-yellow-800'}`}>
                {walletRegistered 
                  ? 'SafeSwap wallet is registered and ready for use'
                  : 'Attempting to register SafeSwap wallet...'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Demo Mode Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Info className="w-5 h-5 text-blue-600 mr-2" />
            <div>
              <h3 className="font-semibold text-blue-900">Demo Mode Active</h3>
              <p className="text-blue-800 text-sm">
                This wallet adapter is running in demo mode with no external dependencies. 
                All functions return mock data for testing purposes. 
                This ensures complete isolation from Aptos Connect authentication issues.
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">Error:</h3>
            <p className="text-red-800 text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}

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
              <p><strong>Mode:</strong> <span className="text-blue-600 font-semibold">Demo Mode</span></p>
              <p><strong>Registered:</strong> {walletRegistered ? 'Yes' : 'No'}</p>
            </div>
            
            <div className="space-y-2">
              <p><strong>Account:</strong> {walletInfo?.account ? `${walletInfo.account.slice(0, 6)}...${walletInfo.account.slice(-4)}` : 'Not connected'}</p>
              <p><strong>Public Key:</strong> {walletInfo?.publicKey ? `${walletInfo.publicKey.slice(0, 6)}...${walletInfo.publicKey.slice(-4)}` : 'Not connected'}</p>
              <p><strong>URL:</strong> {walletInfo?.url || 'N/A'}</p>
              <p><strong>Demo Mode:</strong> {walletInfo?.demo_mode ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Connection Controls */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Connection</h2>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={connectWallet}
              disabled={isLoading || isConnected || !walletRegistered}
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
            <li>Wait for wallet registration to complete (green status)</li>
            <li>Click "Connect Wallet" to establish a connection</li>
            <li>Use the wallet functions to test different capabilities</li>
            <li>Check the console for detailed logs</li>
            <li>Try signing messages and transactions</li>
            <li>View account information and resources</li>
          </ol>
        </div>

        {/* Troubleshooting */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">Troubleshooting:</h3>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>This wallet adapter is completely isolated from Aptos Connect</li>
            <li>All functions return mock data for demonstration purposes</li>
            <li>No external blockchain calls are made to avoid conflicts</li>
            <li>The 401 errors you see are from Aptos Connect and won't affect this demo</li>
            <li>Check the browser console for detailed error information</li>
            <li>If wallet registration fails, refresh the page and try again</li>
          </ul>
        </div>

        {/* Isolation Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-2">✅ Complete Isolation Achieved</h3>
          <ul className="text-sm text-green-800 space-y-1 list-disc list-inside">
            <li>No external dependencies or API calls</li>
            <li>No conflicts with existing Aptos Connect integration</li>
            <li>All wallet adapter functions work independently</li>
            <li>Perfect for testing AIP-62 compliance</li>
            <li>Ready for production integration with real blockchain calls</li>
            <li>Manual registration prevents interference with other wallet systems</li>
          </ul>
        </div>
      </div>
    </WalletAdapterErrorBoundary>
  );
};

export default WalletAdapterDemo;
