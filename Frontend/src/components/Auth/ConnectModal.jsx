import React, { useState } from 'react';
import { X, Wallet, Mail, Lock } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';

import { createAptosConnectUrl } from '../../config/aptos';

const ConnectModal = ({ isOpen, onClose, onSuccess }) => {
  const [showAptosConnect, setShowAptosConnect] = useState(false);
  const { googleLogin } = useAuth();

  const googleLoginHook = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoResponse.json();
        
        await googleLogin({
          access_token: tokenResponse.access_token,
          user: userInfo,
          googleId: userInfo.sub,
          email: userInfo.email,
          name: userInfo.name
        });
        
        if (onSuccess) {
          onSuccess({ type: 'google', data: userInfo });
        }
        onClose();
      } catch (error) {
        console.error("Google login failed:", error);
      }
    },
    onError: () => {
      console.error("Google login failed");
    },
  });

  const handleGoogleLogin = () => {
    googleLoginHook();
  };

  const handleAptosConnectSuccess = (walletData) => {
    if (onSuccess) {
      onSuccess({ type: 'aptos-connect', data: walletData });
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Connect to SafeSwap
              </h2>
              <button
                onClick={onClose}
                className="rounded-full p-1 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Recommended Option - Aptos SDK */}
              <div className="relative">
                <div className="absolute -top-2 -left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  Recommended
                </div>
                <button
                  onClick={() => {
                    // Go directly to Aptos Connect instead of opening another modal
                    const connectUrl = createAptosConnectUrl();
                    window.location.href = connectUrl;
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3"
                >
                  <Wallet className="w-5 h-5" />
                  <span>Connect Aptos Wallet</span>
                </button>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  Connect with Aptos Connect for secure wallet connection
                </p>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Google OAuth */}
              <button
                onClick={handleGoogleLogin}
                className="w-full bg-white border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-3"
              >
                <Mail className="w-5 h-5" />
                <span>Continue with Google</span>
              </button>

              {/* Coming Soon Options */}
              <div className="space-y-2">
                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-400 font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-3 cursor-not-allowed"
                >
                  <Lock className="w-5 h-5" />
                  <span>Apple Sign-In (Coming Soon)</span>
                </button>
                
                <button
                  disabled
                  className="w-full bg-gray-100 text-gray-400 font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-3 cursor-not-allowed"
                >
                  <Lock className="w-5 h-5" />
                  <span>Facebook Login (Coming Soon)</span>
                </button>
              </div>

              {/* Info */}
              <div className="text-xs text-gray-500 text-center pt-4">
                <p>By connecting, you agree to our Terms of Service and Privacy Policy</p>
                <p className="mt-1">Your data is stored securely and never shared</p>
              </div>
            </div>
          </div>
        </div>
      </div>


    </>
  );
};

export default ConnectModal; 