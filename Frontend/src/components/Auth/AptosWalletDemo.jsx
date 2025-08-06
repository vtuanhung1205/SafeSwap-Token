import React, { useState } from 'react';
import { Wallet, Send, Download, Upload, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const AptosWalletDemo = () => {
  const [walletData, setWalletData] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get stored wallet data
  const getStoredWallet = () => {
    const stored = localStorage.getItem('aptos_wallet');
    if (stored) {
      const walletInfo = JSON.parse(stored);
      setWalletData(walletInfo);
      return walletInfo;
    }
    return null;
  };

  // Check balance
  const checkBalance = async () => {
    if (!walletData) {
      toast.error('No wallet connected');
      return;
    }

    setIsLoading(true);
    try {
      const { AptosClient } = await import('aptos');
      const client = new AptosClient("https://fullnode.devnet.aptoslabs.com");
      
      const balance = await client.getAccountBalance(walletData.address);
      setBalance(balance.octa);
      toast.success(`Balance: ${balance.octa} octa`);
    } catch (error) {
      console.error('Error checking balance:', error);
      toast.error('Failed to check balance');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear wallet data
  const clearWallet = () => {
    localStorage.removeItem('aptos_wallet');
    setWalletData(null);
    setBalance(null);
    toast.success('Wallet data cleared');
  };

  // Load wallet on component mount
  React.useEffect(() => {
    getStoredWallet();
  }, []);

  return (
    <div className="max-w-md mx-auto bg-[#18181c] rounded-2xl border border-[#23232a] p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Aptos Wallet Demo</h2>
        <p className="text-gray-400">Test your Aptos wallet functionality</p>
      </div>

      {walletData ? (
        <div className="space-y-4">
          {/* Wallet Info */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-white mb-2">Wallet Information</h3>
            <div className="space-y-2">
              <div>
                <span className="text-xs text-gray-400">Address:</span>
                <div className="font-mono text-xs text-white break-all">
                  {walletData.address}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-400">Public Key:</span>
                <div className="font-mono text-xs text-white break-all">
                  {walletData.publicKey}
                </div>
              </div>
            </div>
          </div>

          {/* Balance */}
          <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white">Balance</h3>
              <button
                onClick={checkBalance}
                disabled={isLoading}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
              >
                <RefreshCw size={12} className={`${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="text-lg font-bold text-white">
              {balance ? `${balance} octa` : 'Not checked'}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={checkBalance}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2 px-4 font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Send size={16} />
              Check Balance
            </button>
            
            <button
              onClick={clearWallet}
              className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-2 px-4 font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Download size={16} />
              Clear Wallet Data
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Upload size={48} className="mx-auto mb-2" />
            <p>No wallet connected</p>
            <p className="text-xs">Create or import a wallet first</p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h3 className="text-sm font-semibold text-white mb-2">How to use:</h3>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Click "Connect Aptos Wallet" in the login modal</li>
          <li>• Create a new wallet or import existing one</li>
          <li>• Check your balance and manage your wallet</li>
          <li>• All data is stored locally in your browser</li>
        </ul>
      </div>
    </div>
  );
};

export default AptosWalletDemo; 