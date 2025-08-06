import React, { useState } from 'react';
import { Wallet, User, CheckCircle, XCircle } from 'lucide-react';
import ConnectModal from './Auth/ConnectModal';
import AptosConnectAPIModal from './Auth/AptosConnectAPIModal';

const AptosConnectAPIDemo = () => {
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showAptosConnectAPI, setShowAptosConnectAPI] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [userData, setUserData] = useState(null);

  const handleConnectionSuccess = (connectionData) => {
    console.log('Connection success:', connectionData);
    
    if (connectionData.type === 'aptos-connect') {
      setUserData(connectionData.data);
      setConnectionStatus({
        type: 'success',
        message: `Connected with Aptos Connect: ${connectionData.data.name || connectionData.data.walletAddress}`,
        data: connectionData.data
      });
    } else if (connectionData.type === 'google') {
      setUserData(connectionData.data);
      setConnectionStatus({
        type: 'success',
        message: `Connected with Google: ${connectionData.data.name}`,
        data: connectionData.data
      });
    }
  };

  const handleAptosConnectSuccess = (userData) => {
    console.log('Aptos Connect API success:', userData);
    setUserData(userData);
    setConnectionStatus({
      type: 'success',
      message: `Connected with Aptos Connect API: ${userData.name || userData.walletAddress}`,
      data: userData
    });
  };

  const clearConnection = () => {
    setConnectionStatus(null);
    setUserData(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Aptos Connect API Demo
        </h1>
        <p className="text-gray-600">
          Test the new Aptos Connect API integration for unified authentication and wallet connection
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
            Test the main Connect Modal that combines Aptos Connect API and Google OAuth
          </p>
          <button
            onClick={() => setShowConnectModal(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Open Connect Modal
          </button>
        </div>

        {/* Direct Aptos Connect API Demo */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold">Direct Aptos Connect API</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Test Aptos Connect API directly without the unified modal
          </p>
          <button
            onClick={() => setShowAptosConnectAPI(true)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Open Aptos Connect API
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

      {/* User Data Display */}
      {userData && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">User Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <p className="text-sm text-gray-900">{userData.name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-sm text-gray-900">{userData.email || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wallet Address
              </label>
              <p className="text-sm text-gray-900 font-mono">
                {userData.walletAddress || userData.address || 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provider
              </label>
              <p className="text-sm text-gray-900">{userData.provider || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Features List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Aptos Connect API Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Unified Authentication & Wallet Connection</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">User Profile Data (Email, Name, Avatar)</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Secure OAuth Flow</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Multiple Wallet Support</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Session Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Backend API Integration</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Error Handling & Fallbacks</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">Loading States & User Feedback</span>
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

      <AptosConnectAPIModal
        isOpen={showAptosConnectAPI}
        onClose={() => setShowAptosConnectAPI(false)}
        onSuccess={handleAptosConnectSuccess}
      />
    </div>
  );
};

export default AptosConnectAPIDemo; 