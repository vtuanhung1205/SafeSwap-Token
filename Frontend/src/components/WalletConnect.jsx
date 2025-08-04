import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, LogOut, PlusCircle, Wallet as WalletIcon } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { api } from '../utils/api'; // Assuming you have an api utility file

const WalletConnect = ({ onWalletConnected }) => {
  // Get the googleLogin function from your AuthContext.
  // This function is responsible for sending the Google token to your backend.
  const { isAuthenticated, googleLogin } = useAuth(); 
  
  const { connected, account, disconnect, wallet, select, wallets } = useWallet();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);
  const [showLinkedWalletModal, setShowLinkedWalletModal] = useState(false); 
  const [showAddNewWalletModal, setShowAddNewWalletModal] = useState(false);
  const [linkedWallets, setLinkedWallets] = useState([]);

  // This hook from @react-oauth/google handles the popup window.
  const startGoogleLogin = useGoogleLogin({
    // This callback runs AFTER the user successfully signs in with Google.
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        // Now, call the function from your AuthContext, passing the token
        // you just received from Google.
        await googleLogin(tokenResponse);
        // The useEffect below will handle closing the modal and showing the next one.
      } catch (error) {
        // Your googleLogin function already shows a toast on error.
        console.error("Failed to sync with backend after Google login.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      toast.error("Google login failed. Please try again.");
      setIsLoading(false);
    },
  });

  // This function is called when the user clicks your custom "Sign in with Google" button.
  const handleGoogleLoginClick = () => {
    setIsLoading(true);
    startGoogleLogin(); // This opens the Google popup.
  };

  // Effect 1: This runs when `isAuthenticated` becomes true, advancing the flow.
  useEffect(() => {
    if (isAuthenticated && showLoginPromptModal) {
      setShowLoginPromptModal(false);
      fetchAndShowLinkedWallets();
    }
  }, [isAuthenticated, showLoginPromptModal]);

  // Effect 2: This runs when a wallet connection is fully established.
  useEffect(() => {
    const syncWallet = async () => {
      if (!isAuthenticated || !connected || !account || isConnecting) return;
      try {
        setIsConnecting(true);
        toast.success("Wallet connected successfully!");
        const addressString = String(account.address);
        const isAlreadyLinked = linkedWallets.some(w => w.address === addressString);
        if (!isAlreadyLinked) {
          await api.linkNewWallet({ address: addressString, walletName: wallet?.adapter.name });
        }
        if (onWalletConnected) {
          onWalletConnected({ ...account, address: addressString, publicKey: String(account.publicKey) });
        }
      } catch (error) {
        console.error("Wallet sync error:", error);
        toast.error("Failed to sync wallet with backend.");
      } finally {
        setIsConnecting(false);
        setShowLinkedWalletModal(false);
        setShowAddNewWalletModal(false);
      }
    };
    const timeoutId = setTimeout(syncWallet, 100);
    return () => clearTimeout(timeoutId);
  }, [connected, account]);

  // This is the entry point for the entire flow.
  const handleConnectClick = () => {
    if (connected) return;
    setShowLoginPromptModal(true);
  };

  const fetchAndShowLinkedWallets = async () => {
    setIsLoading(true);
    setShowLinkedWalletModal(true);
    try {
      const userWallets = await api.getLinkedWallets();
      setLinkedWallets(userWallets);
      if (userWallets.length === 0) {
        setShowLinkedWalletModal(false);
        setShowAddNewWalletModal(true);
      }
    } catch (error) {
      toast.error("Could not fetch your wallets.");
      setShowLinkedWalletModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => disconnect();
  const handleWalletSelect = (walletName) => select(walletName);
  const formatAddress = (address) => address ? `${String(address).slice(0, 6)}...${String(address).slice(-4)}` : 'Invalid Address';

  return (
    <>
      {!connected ? (
        <button onClick={handleConnectClick} className="w-full py-3 rounded-xl font-medium transition bg-cyan-600 text-white hover:bg-cyan-700">
          Connect Wallet
        </button>
      ) : (
        <div className="flex items-center justify-between w-full bg-[#111112] rounded-xl p-2 border border-[#2a2a35]">
          <div className="flex items-center">
            <img src={wallet?.adapter.icon} alt={wallet?.adapter.name} className="w-7 h-7 rounded-full mr-2" />
            <span className="text-white font-mono text-sm">{formatAddress(account?.address)}</span>
          </div>
          <button onClick={handleDisconnect} className="text-gray-400 hover:text-red-500 transition p-2 rounded-lg" title="Disconnect">
            <LogOut size={18} />
          </button>
        </div>
      )}

      {/* Modal 1: Login Prompt */}
      {showLoginPromptModal && !isAuthenticated && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1c1c24] rounded-2xl p-8 border border-[#2a2a35] shadow-lg w-full max-w-sm text-center">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" onClick={() => setShowLoginPromptModal(false)}>×</button>
            <div className="mx-auto bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <WalletIcon className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Login to Continue</h3>
            <p className="text-gray-400 mb-8">Sign in with Google to securely manage and link your wallets.</p>
            <button onClick={handleGoogleLoginClick} disabled={isLoading} className="w-full flex items-center justify-center space-x-3 py-3 rounded-xl font-medium transition bg-white text-black hover:bg-gray-200 disabled:bg-gray-300">
              {isLoading ? <Loader2 className="animate-spin" /> : (<> <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-6 h-6" /> <span>Sign in with Google</span> </>)}
            </button>
          </div>
        </div>
      )}

      {/* Modal 2: Your Linked Wallets */}
      {showLinkedWalletModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1c1c24] rounded-2xl p-6 border border-[#2a2a35] shadow-lg w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Your Wallets</h3>
              <button className="text-gray-400 hover:text-white text-2xl" onClick={() => setShowLinkedWalletModal(false)}>×</button>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {isLoading ? <div className="flex justify-center items-center h-24"><Loader2 className="animate-spin text-cyan-500" /></div> : (<>
                  {linkedWallets.map((linkedWallet) => (
                    <button key={linkedWallet.address} onClick={() => handleWalletSelect(linkedWallet.walletName)} className="flex items-center w-full p-3 hover:bg-[#2a2a35] rounded-lg transition">
                      <img src={wallets.find(w => w?.adapter?.name === linkedWallet.walletName)?.adapter.icon} alt={linkedWallet.walletName} className="w-8 h-8 rounded-full mr-4" />
                      <div className="text-left">
                        <div className="text-white font-medium">{linkedWallet.walletName}</div>
                        <div className="text-gray-400 text-sm">{formatAddress(linkedWallet.address)}</div>
                      </div>
                    </button>
                  ))}
                  <button onClick={() => { setShowLinkedWalletModal(false); setShowAddNewWalletModal(true); }} className="flex items-center w-full p-3 mt-2 text-cyan-400 hover:bg-[#2a2a35] rounded-lg transition">
                    <PlusCircle size={20} className="mr-4" />
                    <span className="font-medium">Link a New Wallet</span>
                  </button>
                </>)}
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Add a New Wallet */}
      {showAddNewWalletModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1c1c24] rounded-2xl p-6 border border-[#2a2a35] shadow-lg w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Link a New Wallet</h3>
              <button className="text-gray-400 hover:text-white text-2xl" onClick={() => setShowAddNewWalletModal(false)}>×</button>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {wallets?.map((wallet) => (
                wallet?.adapter?.name && (
                  <button key={wallet.adapter.name} onClick={() => handleWalletSelect(wallet.adapter.name)} className="flex items-center w-full p-3 hover:bg-[#2a2a35] rounded-lg transition">
                    <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-8 h-8 rounded-full mr-4" />
                    <span className="text-white font-medium text-lg">{wallet.adapter.name}</span>
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