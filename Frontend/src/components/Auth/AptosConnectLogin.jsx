import React, { useState, useEffect } from 'react';
import { Wallet, Loader2, Shield, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { createAptosConnectUrl, APTOS_CONNECT_UTILS } from '../../config/aptos';

const AptosConnectLogin = ({ onSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle Aptos Connect redirect
  const handleAptosConnect = () => {
    setIsConnecting(true);
    
    // Create Aptos Connect URL using config
    const connectUrl = createAptosConnectUrl();
    
    // Redirect to Aptos Connect
    window.location.href = connectUrl;
  };

  // Check for callback data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const callbackData = urlParams.get('data');
    const error = urlParams.get('error');
    
    if (callbackData) {
      try {
        const walletData = JSON.parse(atob(callbackData));
        console.log('Aptos Connect callback data:', walletData);
        
        if (walletData.address) {
          // Store wallet data
          const walletInfo = {
            address: walletData.address,
            publicKey: walletData.publicKey,
            provider: 'aptos-connect',
            createdAt: Date.now()
          };
          
          localStorage.setItem('aptos_connect_wallet', JSON.stringify(walletInfo));
          
          toast.success(`Connected with Aptos Connect: ${walletInfo.address.slice(0, 6)}...${walletInfo.address.slice(-4)}`);
          
          if (onSuccess) {
            onSuccess(walletInfo);
          }
        }
      } catch (error) {
        console.error('Failed to parse callback data:', error);
        toast.error('Failed to connect wallet');
      }
    } else if (error) {
      console.error('Aptos Connect error:', error);
      toast.error('Connection failed. Please try again.');
    }
  }, [onSuccess]);

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

      {/* Aptos Connect Option */}
      <div className="space-y-4">
        {/* Recommended - Aptos Connect */}
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
                <span>Connect with Aptos Connect</span>
                <ExternalLink className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Opens Aptos Connect for secure wallet connection
          </p>
        </div>

        {/* Alternative - Direct SDK */}
        <div className="relative">
          <button
            onClick={() => {
              // This will use the existing AptosSDKLogin
              if (onSuccess) {
                // Create a mock wallet for testing
                const mockWallet = {
                  address: '0x' + Math.random().toString(16).substr(2, 40),
                  publicKey: '0x' + Math.random().toString(16).substr(2, 64),
                  provider: 'aptos-sdk',
                  createdAt: Date.now()
                };
                onSuccess(mockWallet);
              }
            }}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3"
          >
            <Shield className="w-5 h-5" />
            <span>Use Direct SDK (Testing)</span>
          </button>
          <p className="text-xs text-gray-500 mt-1 text-center">
            Direct SDK connection for testing purposes
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
          <li>Click "Connect with Aptos Connect"</li>
          <li>You'll be redirected to Aptos Connect</li>
          <li>Choose your wallet (Petra, Martian, etc.)</li>
          <li>Approve the connection</li>
          <li>You'll be redirected back to SafeSwap</li>
        </ol>
      </div>
    </div>
  );
};

export default AptosConnectLogin; 