import React from 'react';
import WalletConnect from './WalletConnect';
import TransactionHistory from './TransactionHistory';
import TokenList from './TokenList';
import SwapForm from './SwapForm';
import FavoriteTokens from './FavoriteTokens';

const DemoPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            SafeSwap Aptos Integration Demo
          </h1>
          <p className="text-gray-400 text-lg">
            Complete Aptos Web App Integration following the official guide
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Wallet Connection */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                1. Wallet Connection
              </h2>
              <WalletConnect />
            </div>

            {/* Swap Form */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                2. Token Swap
              </h2>
              <SwapForm />
            </div>

            {/* Favorite Tokens */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                3. Favorite Tokens
              </h2>
              <FavoriteTokens />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Transaction History */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                4. Transaction History
              </h2>
              <TransactionHistory />
            </div>

            {/* Token List */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                5. Aptos Token List
              </h2>
              <TokenList />
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-12 bg-[#1c1c24] rounded-xl p-6 border border-[#2a2a35]">
          <h2 className="text-2xl font-bold text-white mb-6">Features Implemented</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#2a2a35] rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Wallet Connection</h3>
              <p className="text-gray-400 text-sm">
                Connect Aptos wallets (Petra, Martian, etc.) with authentication flow
              </p>
            </div>
            <div className="bg-[#2a2a35] rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Token Swap</h3>
              <p className="text-gray-400 text-sm">
                Full-featured swap form with real-time prices and balance display
              </p>
            </div>
            <div className="bg-[#2a2a35] rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Transaction History</h3>
              <p className="text-gray-400 text-sm">
                Fetch and display transaction history from blockchain
              </p>
            </div>
            <div className="bg-[#2a2a35] rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Token Management</h3>
              <p className="text-gray-400 text-sm">
                Complete Aptos token list with favorites and price alerts
              </p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-[#1c1c24] rounded-xl p-6 border border-[#2a2a35]">
          <h2 className="text-2xl font-bold text-white mb-4">Technical Implementation</h2>
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <strong>Aptos SDK:</strong> Using aptos SDK for direct wallet management and blockchain interaction
            </div>
            <div>
              <strong>AptosClient:</strong> Direct blockchain queries for balance and transactions
            </div>
            <div>
              <strong>Token List:</strong> Integration with GeckoTerminal API for comprehensive token data
            </div>
            <div>
              <strong>Authentication:</strong> Google OAuth with backend integration for secure wallet linking
            </div>
            <div>
              <strong>Real-time Data:</strong> Live balance updates and transaction monitoring
            </div>
            <div>
              <strong>User Data:</strong> Favorite tokens, price alerts, and personal swap history
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage; 