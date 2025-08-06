import React, { useState } from 'react';
import { Wallet, ExternalLink, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AptosConnectSimple = ({ onSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Handle Aptos Connect redirect
  const handleAptosConnectRedirect = () => {
    setIsLoading(true);
    
    try {
      // Create Aptos Connect URL
      const currentUrl = encodeURIComponent(window.location.href);
      const appName = 'SafeSwap';
      const appIcon = 'https://your-app-icon.com/icon.png'; // Replace with your app icon
      
      // Create the request object
      const request = {
        connect: {
          url: currentUrl,
          name: appName,
          icon: appIcon
        }
      };
      
      // Encode the request
      const encodedRequest = btoa(JSON.stringify(request));
      
      // Create the full URL
      const aptosConnectUrl = `https://aptosconnect.app/prompt/?request=${encodedRequest}`;
      
      console.log('Redirecting to Aptos Connect:', aptosConnectUrl);
      
      // Redirect to Aptos Connect
      window.location.href = aptosConnectUrl;
      
    } catch (error) {
      console.error('Failed to create Aptos Connect URL:', error);
      toast.error('Failed to connect. Please try again.');
      setIsLoading(false);
    }
  };

  // Handle direct wallet connection
  const handleDirectWalletConnection = async () => {
    setIsLoading(true);
    
    try {
      // Check if wallet extension is available
      if (typeof window !== 'undefined' && window.aptos) {
        const result = await window.aptos.connect();
        
        const walletData = {
          type: 'aptos-connect',
          address: result.address,
          publicKey: result.publicKey,
          authKey: result.authKey,
          provider: 'aptos-extension'
        };

        toast.success('Wallet connected successfully!');
        
        if (onSuccess) {
          onSuccess(walletData);
        }
      } else {
        // Fallback to Aptos Connect redirect
        handleAptosConnectRedirect();
      }
    } catch (error) {
      console.error('Direct wallet connection error:', error);
      toast.error('Wallet connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle specific wallet selection
  const handleWalletSelection = (walletName) => {
    const walletUrls = {
      martian: 'https://martianwallet.xyz/connect',
      pontem: 'https://pontem.network/connect',
      petra: 'https://petra.app/connect',
      fewcha: 'https://fewcha.app/connect',
      nightly: 'https://nightly.app/connect'
    };

    const walletUrl = walletUrls[walletName.toLowerCase()];
    if (walletUrl) {
      window.open(walletUrl, '_blank');
    } else {
      toast.error('Wallet not supported');
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
          Connect with Aptos Connect
        </h3>
        <p className="text-sm text-gray-600">
          Securely connect your Aptos wallet
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center justify-center space-x-2">
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Ready to Connect</span>
        </div>
      </div>

      {/* Main Connect Button */}
      <button
        onClick={handleAptosConnectRedirect}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Wallet className="w-5 h-5" />
            <span>Connect with Aptos Connect</span>
          </>
        )}
      </button>

      {/* Alternative Options */}
      <div className="space-y-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or try alternative methods</span>
          </div>
        </div>

        {/* Direct Wallet Connection */}
        <button
          onClick={handleDirectWalletConnection}
          disabled={isLoading}
          className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet Extension</span>
        </button>

        {/* Popular Wallets */}
        <div className="grid grid-cols-2 gap-2">
          {['Martian', 'Pontem', 'Petra', 'Fewcha'].map((wallet) => (
            <button
              key={wallet}
              onClick={() => handleWalletSelection(wallet)}
              disabled={isLoading}
              className="bg-white border border-gray-300 hover:border-gray-400 disabled:border-gray-200 text-gray-700 font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm flex items-center justify-center space-x-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>{wallet}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="text-xs text-gray-500 text-center space-y-1">
        <p>By connecting, you agree to our Terms of Service and Privacy Policy</p>
        <p>Your wallet data is stored securely and never shared</p>
        <p className="mt-2 text-blue-600">
          This will redirect you to Aptos Connect for secure authentication
        </p>
      </div>
    </div>
  );
};

export default AptosConnectSimple; 