import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import AptosWalletDemo from '../Auth/AptosWalletDemo';
import AptosWalletModal from '../Auth/AptosWalletModal';

const AptosWalletTest = () => {
  const [showWalletModal, setShowWalletModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white">
      {/* Header */}
      <div className="bg-[#18181c] border-b border-[#23232a]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-bold">Aptos Wallet Test</h1>
            </div>
            <button
              onClick={() => setShowWalletModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Component */}
          <div>
            <AptosWalletDemo />
          </div>

          {/* Instructions */}
          <div className="space-y-6">
            <div className="bg-[#18181c] rounded-2xl border border-[#23232a] p-6">
              <h2 className="text-xl font-bold text-white mb-4">How to Test</h2>
              <div className="space-y-4 text-sm text-gray-300">
                <div>
                  <h3 className="font-semibold text-white mb-2">1. Connect Wallet</h3>
                  <p>Click the "Connect Wallet" button in the header to open the wallet connection modal.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">2. Create New Wallet</h3>
                  <p>Choose "Create New Wallet" to generate a new Aptos wallet for testing purposes.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">3. Check Balance</h3>
                  <p>Use the "Check Balance" button to query your wallet's balance on the Aptos devnet.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-white mb-2">4. Manage Wallet</h3>
                  <p>View your wallet information and manage your wallet data through the demo interface.</p>
                </div>
              </div>
            </div>

            <div className="bg-[#18181c] rounded-2xl border border-[#23232a] p-6">
              <h2 className="text-xl font-bold text-white mb-4">Features</h2>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Create new Aptos wallets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Import existing wallets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Check wallet balance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Local wallet storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Secure private key management</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#18181c] rounded-2xl border border-[#23232a] p-6">
              <h2 className="text-xl font-bold text-white mb-4">Technical Details</h2>
              <div className="space-y-3 text-sm text-gray-300">
                <div>
                  <span className="text-blue-400 font-semibold">Network:</span>
                  <span className="ml-2">Aptos Devnet</span>
                </div>
                <div>
                  <span className="text-blue-400 font-semibold">SDK:</span>
                  <span className="ml-2">Aptos JavaScript SDK</span>
                </div>
                <div>
                  <span className="text-blue-400 font-semibold">Storage:</span>
                  <span className="ml-2">LocalStorage (browser)</span>
                </div>
                <div>
                  <span className="text-blue-400 font-semibold">Security:</span>
                  <span className="ml-2">Private keys stored locally</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Modal */}
      <AptosWalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSuccess={(walletData) => {
          console.log('Wallet connected:', walletData);
          setShowWalletModal(false);
        }}
      />
    </div>
  );
};

export default AptosWalletTest; 