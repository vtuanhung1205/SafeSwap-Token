import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, LogOut } from 'lucide-react'; // Import necessary icons

// This component is a drop-in replacement.
// It maintains all existing logic while matching the UI of SwapForm.
const WalletConnect = ({ onWalletConnected }) => {
  // --- LOGIC (Unchanged) ---
  const { 
    connected, 
    account, 
    disconnect, 
    wallet, 
    select, // Added to manually select a wallet
    wallets // Added to list available wallets
  } = useWallet();
  const { isAuthenticated, connectWallet } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Only disconnect wallet if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated && connected) {
      disconnect();
    }
  }, [isAuthenticated, connected, disconnect]);

  // --- Event Handlers (Logic is the same, adapted for new UI flow) ---
  const handleConnectClick = () => {
    if (isConnecting) return;
    
    if (!isAuthenticated) {
      toast.error("Please login with Google before connecting your wallet", { duration: 3000 });
      return;
    }
    
    if (!connected) {
      setIsModalOpen(true);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const handleWalletSelect = async (walletName) => {
    try {
      setIsConnecting(true);
      select(walletName);
      
      // Wait for wallet to connect
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (connected && account && isAuthenticated) {
        let addressString = typeof account.address === 'object' ? account.address.hexString : String(account.address);
        let publicKeyString = typeof account.publicKey === 'object' ? account.publicKey.hexString : String(account.publicKey);
        
        if (!addressString || !publicKeyString) {
          throw new Error("Invalid wallet address or public key");
        }
        
        const result = await connectWallet({
          address: addressString,
          publicKey: publicKeyString
        });
        
        if (result.success && onWalletConnected) {
          onWalletConnected({...account, address: addressString, publicKey: publicKeyString});
          setIsModalOpen(false);
          toast.success("Wallet connected successfully!");
        }
      }
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'Invalid Address';
    const addressString = String(address);
    return `${addressString.slice(0, 6)}...${addressString.slice(-4)}`;
  };

  // --- UI (Redesigned to match SwapForm) ---
  return (
    <>
      {!connected ? (
        <button 
          onClick={handleConnectClick}
          className="w-full py-3 rounded-xl font-medium transition bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-cyan-600/50 disabled:text-cyan-300 disabled:cursor-not-allowed"
          disabled={!isAuthenticated || isConnecting}
        >
          {isConnecting ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 size={18} className="animate-spin" />
              <span>Connecting...</span>
            </div>
          ) : isAuthenticated ? (
            "Connect Wallet"
          ) : (
            "Login Required"
          )}
        </button>
      ) : (
        <div className="flex items-center justify-between w-full bg-[#111112] rounded-xl p-3 border border-[#2a2a35]">
          <div className="flex items-center">
            <img src={wallet?.adapter.icon} alt={wallet?.adapter.name} className="w-6 h-6 rounded-full mr-3" />
            <span className="text-white font-mono text-sm">
              {formatAddress(account?.address)}
            </span>
          </div>
          <button 
            onClick={handleDisconnect}
            className="text-gray-400 hover:text-white transition"
            title="Disconnect"
            disabled={isConnecting}
          >
            <LogOut size={18} />
          </button>
        </div>
      )}

      {/* --- Custom Wallet Selection Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1c1c24] rounded-2xl p-6 border border-[#2a2a35] shadow-lg w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                Select a Wallet
              </h3>
              <button
                className="text-gray-400 hover:text-white text-2xl"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {wallets.map((wallet) => (
                <button
                  key={wallet.adapter.name}
                  onClick={() => handleWalletSelect(wallet.adapter.name)}
                  className="flex items-center w-full p-3 hover:bg-[#2a2a35] rounded-lg transition"
                >
                  <img
                    src={wallet.adapter.icon}
                    alt={wallet.adapter.name}
                    className="w-8 h-8 rounded-full mr-4"
                  />
                  <span className="text-white font-medium text-lg">
                    {wallet.adapter.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletConnect;