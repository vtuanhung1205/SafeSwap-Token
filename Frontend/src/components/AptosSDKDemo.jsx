import React, { useState } from 'react';
import { Wallet, User, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import ConnectModal from './Auth/ConnectModal';
import AptosSDKModal from './Auth/AptosSDKModal';

const AptosSDKDemo = () => {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showAptosSDK, setShowAptosSDK] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [walletData, setWalletData] = useState(null);

  const handleConnectionSuccess = (connectionData) => {
    console.log('Connection success:', connectionData);
    
    if (connectionData.type === 'aptos-sdk') {
      setWalletData(connectionData.data);
      setConnectionStatus({
        type: 'success',
        message: `Connected with Aptos SDK: ${connectionData.data.address}`,
        data: connectionData.data
      });
    } else if (connectionData.type === 'google') {
      setWalletData(connectionData.data);
      setConnectionStatus({
        type: 'success',
        message: `Connected with Google: ${connectionData.data.name}`,
        data: connectionData.data
      });
    }
  };

  const handleAptosSDKSuccess = (walletData) => {
    console.log('Aptos SDK success:', walletData);
    setWalletData(walletData);
    setConnectionStatus({
      type: 'success',
      message: `Connected with Aptos SDK: ${walletData.address}`,
      data: walletData
    });
  };

  const clearConnection = () => {
    setConnectionStatus(null);
    setWalletData(null);
    localStorage.removeItem('aptos_sdk_wallet');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Aptos SDK Demo
        </h1>
        <p className="text-gray-600">
          Test the new Aptos SDK integration for direct blockchain interaction
        </p>
      </div>

      {/* Demo Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Connect Modal Demo */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Wallet className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Unified Connect Modal</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Test the main Connect Modal that combines Aptos SDK and Google OAuth
          </p>
          <button
            onClick={() => setShowConnectModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Open Connect Modal
          </button>
        </div>

        {/* Direct Aptos SDK Demo */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold">Direct Aptos SDK</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Test Aptos SDK directly without the unified modal
          </p>
          <button
            onClick={() => setShowAptosSDK(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Open Aptos SDK
          </button>
        </div>
      </div>

      {/* Connection Status */}
      {connectionStatus && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Connection Status</h3>
            <button
              onClick={clearConnection}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
          
          <div className={`flex items-center space-x-2 mb-4 ${
            connectionStatus.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}>
            {connectionStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{connectionStatus.message}</span>
          </div>

          {connectionStatus.data && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Connection Data:</h4>
              <pre className="text-xs text-gray-700 overflow-auto">
                {JSON.stringify(connectionStatus.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Wallet Data Display */}
      {walletData && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Wallet Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <p className="text-sm text-gray-900 font-mono">
                {walletData.address || 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider
              </label>
              <p className="text-sm text-gray-900">{walletData.provider || 'N/A'}</p>
            </div>
            {walletData.publicKey && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Public Key
                </label>
                <p className="text-sm text-gray-900 font-mono">
                  {walletData.publicKey.slice(0, 20)}...
                </p>
              </div>
            )}
            {walletData.createdAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created At
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(walletData.createdAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Features List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Aptos SDK Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Direct Blockchain Interaction</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Wallet Creation & Import</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Local Private Key Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">No External Dependencies</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Transaction Signing</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Balance Checking</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Secure Local Storage</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Offline Capable</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onSuccess={handleConnectionSuccess}
      />

      <AptosSDKModal
        isOpen={showAptosSDK}
        onClose={() => setShowAptosSDK(false)}
        onSuccess={handleAptosSDKSuccess}
      />
    </div>
  );
};

export default AptosSDKDemo; 