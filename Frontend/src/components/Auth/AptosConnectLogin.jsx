import React, { useState, useEffect } from 'react';
import { Wallet, Loader2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const AptosConnectLogin = ({ onSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Aptos Connect
  useEffect(() => {
    const initializeAptosConnect = async () => {
      try {
        // Check if Aptos Connect is available
        if (typeof window !== 'undefined' && window.aptos) {
          setIsInitialized(true);
          console.log('Aptos Connect detected');
        } else {
          // Fallback: redirect to Aptos Connect
          console.log('Aptos Connect not detected, will redirect');
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Failed to initialize Aptos Connect:', error);
        toast.error('Failed to initialize Aptos Connect');
      }
    };

    initializeAptosConnect();
  }, []);

  // Handle Aptos Connect login
  const handleAptosConnectLogin = async () => {
    setIsLoading(true);
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        throw new Error('Not in browser environment');
      }

      // Check if Aptos Connect is available
      if (window.aptos) {
        // Use Aptos Connect if available
        const result = await window.aptos.connect();
        console.log('Aptos Connect result:', result);
        
        if (result.address) {
          const walletData = {
            type: 'aptos-connect',
            address: result.address,
            publicKey: result.publicKey,
            authKey: result.authKey,
            provider: 'aptos-connect'
          };

          if (onSuccess) {
            onSuccess(walletData);
          }
          
          toast.success('Connected with Aptos Connect!');
        } else {
          throw new Error('No wallet address received');
        }
      } else {
        // Redirect to Aptos Connect
        const currentUrl = encodeURIComponent(window.location.href);
        const aptosConnectUrl = `https://aptosconnect.app/prompt/?request=${btoa(JSON.stringify({
          connect: {
            url: currentUrl,
            name: 'SafeSwap',
            icon: 'https://your-app-icon.com/icon.png' // Replace with your app icon
          }
        }))}`;
        
        window.location.href = aptosConnectUrl;
      }
    } catch (error) {
      console.error('Aptos Connect login error:', error);
      
      if (error.message.includes('User rejected')) {
        toast.error('Connection was cancelled by user');
      } else {
        toast.error('Failed to connect with Aptos Connect. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle wallet selection
  const handleWalletSelection = (walletName) => {
    setIsLoading(true);
    
    // Redirect to specific wallet or Aptos Connect
    const currentUrl = encodeURIComponent(window.location.href);
    let redirectUrl;
    
    switch (walletName) {
      case 'martian':
        redirectUrl = `https://martianwallet.xyz/connect?url=${currentUrl}`;
        break;
      case 'pontem':
        redirectUrl = `https://pontem.network/connect?url=${currentUrl}`;
        break;
      case 'petra':
        redirectUrl = `https://petra.app/connect?url=${currentUrl}`;
        break;
      default:
        redirectUrl = `https://aptosconnect.app/prompt/?request=${btoa(JSON.stringify({
          connect: {
            url: currentUrl,
            name: 'SafeSwap',
            icon: 'https://your-app-icon.com/icon.png'
          }
        }))}`;
    }
    
    window.location.href = redirectUrl;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Connect Aptos Wallet</h2>
        <p className="text-gray-400">Choose your preferred Aptos wallet</p>
      </div>

      {/* Aptos Connect Button */}
      <div className="space-y-3">
        <button
          onClick={handleAptosConnectLogin}
          disabled={isLoading || !isInitialized}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl py-3 px-4 font-semibold flex items-center justify-center gap-3 hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Connecting...
            </div>
          ) : (
            <>
              <ExternalLink size={20} />
              Connect with Aptos Connect
            </>
          )}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#18181c] px-2 text-gray-400">Or choose wallet</span>
          </div>
        </div>

        {/* Popular Wallets */}
        <div className="space-y-2">
          <button
            onClick={() => handleWalletSelection('martian')}
            className="w-full bg-gray-700 text-white rounded-xl py-3 px-4 font-semibold flex items-center justify-center gap-3 hover:bg-gray-600 transition-colors"
          >
            <div className="w-6 h-6 bg-orange-500 rounded"></div>
            Martian Wallet
          </button>

          <button
            onClick={() => handleWalletSelection('pontem')}
            className="w-full bg-gray-700 text-white rounded-xl py-3 px-4 font-semibold flex items-center justify-center gap-3 hover:bg-gray-600 transition-colors"
          >
            <div className="w-6 h-6 bg-blue-500 rounded"></div>
            Pontem Wallet
          </button>

          <button
            onClick={() => handleWalletSelection('petra')}
            className="w-full bg-gray-700 text-white rounded-xl py-3 px-4 font-semibold flex items-center justify-center gap-3 hover:bg-gray-600 transition-colors"
          >
            <div className="w-6 h-6 bg-green-500 rounded"></div>
            Petra Wallet
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-2">About Aptos Connect</h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Connect with any Aptos wallet</li>
          <li>• Secure Web3 authentication</li>
          <li>• No private key storage</li>
          <li>• Official Aptos solution</li>
        </ul>
      </div>

      {/* Instructions */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Don't have a wallet?{' '}
          <a 
            href="https://aptos.dev/ecosystem/wallets" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-cyan-500 hover:text-cyan-400"
          >
            Get one here
          </a>
        </p>
      </div>
    </div>
  );
};

export default AptosConnectLogin; 