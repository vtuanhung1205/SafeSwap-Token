import React, { useState, useEffect } from 'react';
import { Wallet, Loader2, Shield, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { createAptosConnectUrl, APTOS_CONNECT_UTILS } from '../../config/aptos';

const AptosConnectSimple = ({ onSuccess, onClose }) => {
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle Aptos Connect with popup
  const handleAptosConnect = () => {
    setIsConnecting(true);
    
    // Create Aptos Connect URL using config
    const connectUrl = createAptosConnectUrl();
    
    // Create popup window
    const popup = window.open(
      connectUrl,
      'AptosConnect',
      'width=400,height=600,scrollbars=yes,resizable=yes'
    );

    // Check for popup closure
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        setIsConnecting(false);
        
        // Check if we have wallet data
        const storedWallet = localStorage.getItem('aptos_connect_wallet');
        if (storedWallet) {
          try {
            const walletData = JSON.parse(storedWallet);
            toast.success(`Connected: ${walletData.address.slice(0, 6)}...${walletData.address.slice(-4)}`);
            if (onSuccess) {
              onSuccess(walletData);
            }
          } catch (error) {
            console.error('Failed to parse stored wallet:', error);
            toast.error('Connection failed');
          }
        }
      }
    }, 1000);

    // Cleanup after 30 seconds
    setTimeout(() => {
      clearInterval(checkClosed);
      setIsConnecting(false);
    }, 30000);
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet size={24} className="text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Connect Aptos Wallet
        </h2>
        <p className="text-sm text-gray-600">
          Connect your Aptos wallet to use SafeSwap
        </p>
      </div>

      {/* Aptos Connect Options */}
      <div className="space-y-4">
        {/* Option 1: Popup */}
        <div className="relative">
          <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            Recommended
          </div>
          <button
            onClick={handleAptosConnect}
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Connect with Popup</span>
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Opens Aptos Connect in popup window
          </p>
        </div>

        {/* Option 2: Direct Redirect */}
        <div className="relative">
          <button
            onClick={() => {
              setIsConnecting(true);
              const connectUrl = createAptosConnectUrl();
              window.location.href = connectUrl;
            }}
            disabled={isConnecting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Redirecting...</span>
              </>
            ) : (
              <>
                <Shield className="w-5 h-5" />
                <span>Direct Redirect</span>
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Redirects directly to Aptos Connect
          </p>
        </div>

      </div>

      {/* Info */}
      <div className="text-xs text-gray-500 text-center pt-4">
        <p>By connecting, you agree to our Terms of Service and Privacy Policy</p>
        <p className="mt-1">Your wallet data is stored securely and never shared</p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">How it works:</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
          <li>Click "Connect with Popup" or "Direct Redirect"</li>
          <li>You'll be taken to Aptos Connect</li>
          <li>Choose your wallet (Petra, Martian, etc.)</li>
          <li>Approve the connection</li>
          <li>You'll be redirected back to SafeSwap</li>
        </ol>
      </div>
    </div>
  );
};

export default AptosConnectSimple; 