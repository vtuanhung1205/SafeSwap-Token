import React from 'react';
import { WalletSelector } from '../AptosKeylessAuth/WalletSelector';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Wallet, Shield, Zap, Users, Lock } from 'lucide-react';

const AptosKeylessAuthDemo = () => {
  const { account, connected } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Aptos Keyless Auth Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the future of blockchain authentication with Aptos Keyless Auth. 
            No private keys, no seed phrases - just social login!
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Wallet Connection Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Connect Your Wallet
              </h2>
              <p className="text-gray-600">
                Use Aptos Connect to sign in with your social account
              </p>
            </div>
            
            <WalletSelector />
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Secure & Safe</h3>
              </div>
              <p className="text-gray-600">
                No private keys to manage or lose. Your account is secured through 
                social login providers like Google, with zero-knowledge proofs ensuring privacy.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Lightning Fast</h3>
              </div>
              <p className="text-gray-600">
                Connect instantly with your existing social accounts. 
                No need to create new wallets or remember complex seed phrases.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">User Friendly</h3>
              </div>
              <p className="text-gray-600">
                Designed for the next billion users. Anyone can use blockchain 
                without technical knowledge or crypto experience.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                  <Lock className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Recovery Ready</h3>
              </div>
              <p className="text-gray-600">
                Easy account recovery through your social login. 
                Never lose access to your blockchain account again.
              </p>
            </div>
          </div>

          {/* Account Info Section */}
          {connected && account && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
                Your Keyless Account
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Account Address:</span>
                  <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                    {account.address}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Public Key:</span>
                  <span className="font-mono text-sm bg-gray-100 px-3 py-1 rounded">
                    {account.publicKey?.slice(0, 20)}...
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">Authentication Type:</span>
                  <span className="text-green-600 font-medium">Keyless (Social Login)</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-green-800">
                    <strong>Success!</strong> You're now connected with Aptos Keyless Auth. 
                    You can use this account to interact with any Aptos dApp that supports keyless authentication.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* How It Works Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              How Aptos Keyless Auth Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Social Login</h3>
                <p className="text-gray-600">
                  Sign in with your existing Google, Facebook, or other social accounts
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-600">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Zero-Knowledge Proof</h3>
                <p className="text-gray-600">
                  Aptos Connect verifies your identity using ZK proofs without exposing your data
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-600">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Created</h3>
                <p className="text-gray-600">
                  Your keyless account is created and ready to use on any Aptos dApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AptosKeylessAuthDemo;
