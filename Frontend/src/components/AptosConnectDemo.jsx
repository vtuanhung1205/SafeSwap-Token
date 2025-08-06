import React, { useState } from 'react';
import { Wallet, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import WalletConnect from './WalletConnect';
import AptosConnectModal from './Auth/AptosConnectModal';
import toast from 'react-hot-toast';

const AptosConnectDemo = () => {
  const [showAptosConnectModal, setShowAptosConnectModal] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);

  const handleWalletConnected = (walletData) => {
    setConnectedWallet(walletData);
    console.log('Wallet connected in demo:', walletData);
  };

  const handleAptosConnectSuccess = (walletData) => {
    console.log('Aptos Connect success:', walletData);
    setConnectedWallet({
      address: walletData.address,
      publicKey: walletData.publicKey,
      walletType: walletData.provider,
      balance: null
    });
    toast.success(`Connected with ${walletData.provider}: ${walletData.address}`);
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Aptos Connect Demo</h1>
          <p className="text-gray-400">Test Aptos Connect integration in different components</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo 1: WalletConnect Component */}
          <div className="bg-[#18181c] rounded-2xl border border-[#23232a] p-6">
            <h2 className="text-xl font-bold text-white mb-4">1. WalletConnect Component</h2>
            <p className="text-gray-400 mb-4">This is the main WalletConnect component used throughout the app.</p>
            
            <div className="space-y-4">
              <WalletConnect onWalletConnected={handleWalletConnected} />
              
              {connectedWallet && (
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-green-400" />
                    <span className="text-sm text-gray-400">Connected Wallet</span>
                  </div>
                  <div className="font-mono text-sm text-white break-all">
                    {connectedWallet.address}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Type: {connectedWallet.walletType}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Demo 2: Direct Aptos Connect */}
          <div className="bg-[#18181c] rounded-2xl border border-[#23232a] p-6">
            <h2 className="text-xl font-bold text-white mb-4">2. Direct Aptos Connect</h2>
            <p className="text-gray-400 mb-4">Direct integration with Aptos Connect modal.</p>
            
            <div className="space-y-4">
              <button
                onClick={() => setShowAptosConnectModal(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl py-3 px-4 font-semibold flex items-center justify-center gap-3 hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                <ExternalLink size={20} />
                Connect with Aptos Connect
              </button>
              
              {connectedWallet && (
                <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={16} className="text-green-400" />
                    <span className="text-sm text-gray-400">Connected Wallet</span>
                  </div>
                  <div className="font-mono text-sm text-white break-all">
                    {connectedWallet.address}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Type: {connectedWallet.walletType}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Demo 3: Simulated Swap Form */}
          <div className="bg-[#18181c] rounded-2xl border border-[#23232a] p-6">
            <h2 className="text-xl font-bold text-white mb-4">3. Simulated Swap Form</h2>
            <p className="text-gray-400 mb-4">Simulating the SwapForm component with wallet connection.</p>
            
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold">Swap Tokens</h3>
                    <p className="text-gray-400 text-sm">Connect wallet to start swapping</p>
                  </div>
                </div>
                
                {/* Simulated swap form */}
                <div className="space-y-3">
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">From</span>
                      <span className="text-white">APT</span>
                    </div>
                    <input 
                      type="text" 
                      placeholder="0.0" 
                      className="w-full bg-transparent text-white text-lg font-semibold mt-1 outline-none"
                      disabled
                    />
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">To</span>
                      <span className="text-white">USDC</span>
                    </div>
                    <input 
                      type="text" 
                      placeholder="0.0" 
                      className="w-full bg-transparent text-white text-lg font-semibold mt-1 outline-none"
                      disabled
                    />
                  </div>
                </div>
                
                {/* Connect Wallet Button */}
                <div className="mt-4">
                  <WalletConnect />
                </div>
              </div>
            </div>
          </div>

          {/* Demo 4: Navbar Simulation */}
          <div className="bg-[#18181c] rounded-2xl border border-[#23232a] p-6">
            <h2 className="text-xl font-bold text-white mb-4">4. Navbar Simulation</h2>
            <p className="text-gray-400 mb-4">Simulating the navbar with wallet connection.</p>
            
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-white font-semibold">SafeSwap</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-400">Swap</span>
                    <span className="text-gray-400">|</span>
                    <span className="text-gray-400">Dashboard</span>
                  </div>
                  
                  <div className="w-48">
                    <WalletConnect onWalletConnected={handleWalletConnected} />
                  </div>
                </div>
                
                {connectedWallet && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" />
                      <span className="text-green-400 text-sm">Wallet connected in navbar</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-[#18181c] rounded-2xl border border-[#23232a] p-6">
          <h2 className="text-xl font-bold text-white mb-4">How to Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h3 className="font-semibold text-white mb-2">1. WalletConnect Component</h3>
              <ul className="space-y-1">
                <li>• Click "Connect Aptos Wallet"</li>
                <li>• Choose your preferred wallet</li>
                <li>• Complete authentication</li>
                <li>• Verify connection status</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">2. Direct Aptos Connect</h3>
              <ul className="space-y-1">
                <li>• Click "Connect with Aptos Connect"</li>
                <li>• Redirects to Aptos Connect</li>
                <li>• Choose wallet and authenticate</li>
                <li>• Returns with wallet data</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">3. Swap Form Integration</h3>
              <ul className="space-y-1">
                <li>• Simulates real swap form</li>
                <li>• Shows wallet connection requirement</li>
                <li>• Integrates WalletConnect component</li>
                <li>• Ready for transaction flow</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-2">4. Navbar Integration</h3>
              <ul className="space-y-1">
                <li>• Simulates app navbar</li>
                <li>• Shows wallet connection in header</li>
                <li>• Consistent with app design</li>
                <li>• Responsive layout</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Aptos Connect Modal */}
        <AptosConnectModal
          isOpen={showAptosConnectModal}
          onClose={() => setShowAptosConnectModal(false)}
          onSuccess={handleAptosConnectSuccess}
        />
      </div>
    </div>
  );
};

export default AptosConnectDemo; 