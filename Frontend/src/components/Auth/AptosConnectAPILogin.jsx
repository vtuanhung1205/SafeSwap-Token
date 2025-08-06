import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { Loader2, Wallet, ExternalLink, CheckCircle } from 'lucide-react';

const AptosConnectAPILogin = ({ onSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [aptosConnect, setAptosConnect] = useState(null);
  const { aptosConnectLogin } = useAuth();

  // Initialize Aptos Connect API
  useEffect(() => {
    const initializeAptosConnect = async () => {
      try {
        // Import Aptos Connect API dynamically
        const { AptosConnect } = await import('@aptos-connect/wallet-api');
        
        // Get client ID from environment or use fallback
        const clientId = import.meta.env.VITE_APTOS_CONNECT_CLIENT_ID || 'safeswap-demo';
        
        // Initialize Aptos Connect API
        const aptosConnectInstance = new AptosConnect({
          clientId: clientId,
          network: 'mainnet', // or 'devnet', 'testnet'
          redirectUri: window.location.origin,
        });

        setAptosConnect(aptosConnectInstance);
        setIsInitialized(true);
        console.log('Aptos Connect API initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Aptos Connect API:', error);
        toast.error('Failed to initialize Aptos Connect API');
      }
    };

    initializeAptosConnect();
  }, []);

  // Handle Aptos Connect API login
  const handleAptosConnectLogin = async () => {
    if (!isInitialized || !aptosConnect) {
      toast.error('Aptos Connect API not initialized');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting Aptos Connect API authentication...');
      
      // Start OAuth authentication flow
      const authResult = await aptosConnect.authenticate({
        provider: 'google', // or 'apple', 'facebook'
        scope: ['email', 'profile'],
      });

      console.log('Aptos Connect API auth result:', authResult);

      // Extract user and wallet data
      const userData = {
        email: authResult.user?.email,
        name: authResult.user?.name,
        avatar: authResult.user?.avatar,
        walletAddress: authResult.wallet?.address,
        publicKey: authResult.wallet?.publicKey,
        authKey: authResult.wallet?.authKey,
        provider: authResult.wallet?.provider || 'aptos-connect',
        accessToken: authResult.auth?.accessToken,
        refreshToken: authResult.auth?.refreshToken,
      };

      // Call backend API to register/login user
      const apiResponse = await authAPI.aptosConnectAuth(userData);
      
      if (apiResponse.data.success) {
        // Store user data in AuthContext
        await aptosConnectLogin(userData);
        
        toast.success(`Welcome back, ${userData.name || 'User'}!`);
        
        if (onSuccess) {
          onSuccess(userData);
        }
      } else {
        throw new Error(apiResponse.data.error || 'Authentication failed');
      }

    } catch (error) {
      console.error('Aptos Connect API login error:', error);
      
      if (error.message.includes('User not found')) {
        // Handle new user registration
        await handleNewUserRegistration();
      } else {
        toast.error(error.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle new user registration
  const handleNewUserRegistration = async () => {
    try {
      console.log('Handling new user registration...');
      
      // Re-authenticate to get fresh data
      const authResult = await aptosConnect.authenticate({
        provider: 'google',
        scope: ['email', 'profile'],
      });

      const userData = {
        email: authResult.user?.email,
        name: authResult.user?.name,
        avatar: authResult.user?.avatar,
        walletAddress: authResult.wallet?.address,
        publicKey: authResult.wallet?.publicKey,
        authKey: authResult.wallet?.authKey,
        provider: authResult.wallet?.provider || 'aptos-connect',
        accessToken: authResult.auth?.accessToken,
        refreshToken: authResult.auth?.refreshToken,
        isNewUser: true, // Flag for registration
      };

      // Register new user
      const registerResponse = await authAPI.register(userData);
      
      if (registerResponse.data.success) {
        await aptosConnectLogin(userData);
        toast.success(`Welcome to SafeSwap, ${userData.name || 'User'}!`);
        
        if (onSuccess) {
          onSuccess(userData);
        }
      } else {
        throw new Error(registerResponse.data.error || 'Registration failed');
      }

    } catch (error) {
      console.error('New user registration error:', error);
      toast.error('Registration failed. Please try again.');
    }
  };

  // Handle direct wallet connection (fallback)
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

        // Call backend API
        const apiResponse = await authAPI.walletLogin(walletData);
        
        if (apiResponse.data.success) {
          await aptosConnectLogin(walletData);
          toast.success('Wallet connected successfully!');
          
          if (onSuccess) {
            onSuccess(walletData);
          }
        } else {
          throw new Error(apiResponse.data.error || 'Wallet connection failed');
        }
      } else {
        // Redirect to Aptos Connect
        const currentUrl = encodeURIComponent(window.location.href);
        const aptosConnectUrl = `https://aptosconnect.app/prompt/?request=${btoa(JSON.stringify({
          connect: {
            url: currentUrl,
            name: 'SafeSwap',
            icon: 'https://your-app-icon.com/icon.png'
          }
        }))}`;
        
        window.location.href = aptosConnectUrl;
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
          Securely connect your Aptos wallet and authenticate
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center justify-center space-x-2">
        {isInitialized ? (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Aptos Connect API Ready</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-yellow-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Initializing...</span>
          </div>
        )}
      </div>

      {/* Main Login Button */}
      <button
        onClick={handleAptosConnectLogin}
        disabled={!isInitialized || isLoading}
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
            <span className="px-2 bg-white text-gray-500">Or connect directly</span>
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
      <div className="text-xs text-gray-500 text-center">
        <p>By connecting, you agree to our Terms of Service and Privacy Policy</p>
        <p className="mt-1">Your wallet data is stored securely and never shared</p>
      </div>
    </div>
  );
};

export default AptosConnectAPILogin; 