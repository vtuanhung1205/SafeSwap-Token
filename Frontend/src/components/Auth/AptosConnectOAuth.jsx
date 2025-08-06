import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { Loader2, Wallet } from 'lucide-react';

const AptosConnectOAuth = ({ onSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { aptosConnectLogin } = useAuth();

  // Initialize Aptos Connect SDK
  useEffect(() => {
    const initializeAptosConnect = async () => {
      try {
        // Import Aptos Connect SDK dynamically
        const { AptosConnect } = await import('@aptos-connect/wallet-api');
        
        // Initialize with your client ID
        const clientId = import.meta.env.VITE_APTOS_CONNECT_CLIENT_ID;
        if (!clientId) {
          console.warn('Aptos Connect Client ID not found. Using fallback mode.');
        }

        // Initialize Aptos Connect
        const aptosConnect = new AptosConnect({
          clientId: clientId || 'safeswap-demo', // Fallback for development
          network: 'mainnet',
          redirectUri: window.location.origin,
        });

        // Store in window for global access
        window.aptosConnect = aptosConnect;
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize Aptos Connect:', error);
        toast.error('Failed to initialize Aptos Connect');
      }
    };

    initializeAptosConnect();
  }, []);

  const handleAptosConnectLogin = async () => {
    if (!isInitialized) {
      toast.error('Aptos Connect not initialized');
      return;
    }

    setIsLoading(true);
    try {
      const aptosConnect = window.aptosConnect;
      
      // Start OAuth flow
      const authResult = await aptosConnect.authenticate({
        provider: 'google', // or 'apple', 'facebook'
        scope: ['email', 'profile'],
      });

      if (authResult.success) {
        const { user, accessToken, idToken } = authResult.data;
        
        // Send to backend for verification
        const loginData = {
          provider: 'aptos-connect',
          accessToken,
          idToken,
          user: {
            email: user.email,
            name: user.name,
            picture: user.picture,
            sub: user.sub,
          }
        };

        await aptosConnectLogin(loginData);
        
        if (onSuccess) {
          onSuccess(loginData);
        }
        
        toast.success('Successfully logged in with Aptos Connect!');
      } else {
        throw new Error(authResult.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Aptos Connect login error:', error);
      toast.error('Aptos Connect login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (!isInitialized) {
      toast.error('Aptos Connect not initialized');
      return;
    }

    setIsLoading(true);
    try {
      const aptosConnect = window.aptosConnect;
      
      const authResult = await aptosConnect.authenticate({
        provider: 'apple',
        scope: ['email', 'name'],
      });

      if (authResult.success) {
        const { user, accessToken, idToken } = authResult.data;
        
        const loginData = {
          provider: 'aptos-connect',
          accessToken,
          idToken,
          user: {
            email: user.email,
            name: user.name,
            picture: user.picture,
            sub: user.sub,
          }
        };

        await aptosConnectLogin(loginData);
        
        if (onSuccess) {
          onSuccess(loginData);
        }
        
        toast.success('Successfully logged in with Apple!');
      } else {
        throw new Error(authResult.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Apple login error:', error);
      toast.error('Apple login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Google Login Button */}
      <button
        onClick={handleAptosConnectLogin}
        disabled={isLoading || !isInitialized}
        className="w-full bg-white text-gray-900 rounded-xl py-3 px-4 font-semibold flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Signing in...
          </div>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </>
        )}
      </button>

      {/* Apple Login Button */}
      <button
        onClick={handleAppleLogin}
        disabled={isLoading || !isInitialized}
        className="w-full bg-black text-white rounded-xl py-3 px-4 font-semibold flex items-center justify-center gap-3 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Signing in...
          </div>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Continue with Apple
          </>
        )}
      </button>

      {/* Fallback message if not initialized */}
      {!isInitialized && (
        <div className="text-center text-sm text-gray-500">
          Initializing Aptos Connect...
        </div>
      )}
    </div>
  );
};

export default AptosConnectOAuth; 