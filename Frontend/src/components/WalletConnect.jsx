import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, LogOut } from 'lucide-react';

const WalletConnect = ({ onWalletConnected }) => {
  // --- LOGIC (Unchanged) ---
  const { 
    connected, 
    account, 
    disconnect, 
    wallet, 
    select,
    wallets 
  } = useWallet();
  const { isAuthenticated, connectWallet } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const syncWallet = async () => {
      if (!isAuthenticated) {
        if (connected) {
          disconnect();
        }
        return;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (connected && account && !isConnecting && isAuthenticated) {
        try {
          setIsConnecting(true);
          
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
          }
        } catch (error) {
          console.error("Wallet sync error:", error);
        } finally {
          setIsConnecting(false);
          setIsModalOpen(false);
        }
      }
    };
    
    const timeoutId = setTimeout(syncWallet, 500);
    return () => clearTimeout(timeoutId);
  }, [connected, account, wallet, onWalletConnected, isConnecting, isAuthenticated, disconnect, connectWallet]);

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

  const handleWalletSelect = (walletName) => {
    select(walletName);
  };

  const formatAddress = (address) => {
    if (!address) return 'Invalid Address';
    const addressString = String(address);
    return `${addressString.slice(0, 6)}...${addressString.slice(-4)}`;
  };

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
            {/* --- FIX APPLIED: Added optional chaining to prevent crash if wallet is temporarily null --- */}
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
              {/* --- FIX APPLIED: Added optional chaining to prevent crash if wallets array is not ready --- */}
              {wallets?.map((wallet) => (
                // Also ensure wallet and adapter exist before rendering the button
                wallet?.adapter?.name && (
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
                )
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WalletConnect;