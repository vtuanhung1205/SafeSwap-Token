import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, LogOut, PlusCircle, Wallet as WalletIcon } from 'lucide-react';

// --- MOCK API & AUTH FUNCTIONS ---
// In your real app, these would come from your api.js and AuthContext files.
const api = {
  getLinkedWallets: async (authToken) => {
    console.log("Fetching linked wallets...");
    // To test the "first time user" flow, return an empty array: return [];
    return [{ address: "0x1234...abcd", walletName: "Petra" }];
  },
  linkNewWallet: async (authToken, wallet) => {
    console.log("Linking new wallet:", wallet);
    toast.success(`${wallet.walletName} wallet linked!`);
    return { success: true };
  }
};

const mockAuth = {
  loginWithGoogle: async () => {
    console.log("Simulating Google Login...");
    toast.success("Logged in successfully!");
    // In your real app, this would trigger the Google OAuth flow.
    // The useAuth hook would then update its state.
    return { success: true };
  }
};
// --- END MOCK FUNCTIONS ---


const WalletConnect = ({ onWalletConnected }) => {
  const { connected, account, disconnect, wallet, select, wallets } = useWallet();
  // Assuming your useAuth hook provides these values
  const { isAuthenticated, authToken, loginWithGoogle } = useAuth(); 
  
  const [isConnecting, setIsConnecting] = useState(false);
  
  // --- MODAL STATE MANAGEMENT ---
  const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);
  const [showLinkedWalletModal, setShowLinkedWalletModal] = useState(false); 
  const [showAddNewWalletModal, setShowAddNewWalletModal] = useState(false);
  
  const [linkedWallets, setLinkedWallets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // --- EFFECT 1: This triggers AFTER a user successfully logs in with Google ---
  useEffect(() => {
    // When the user is authenticated AND we were in the login flow...
    if (isAuthenticated && showLoginPromptModal) {
      setShowLoginPromptModal(false); // Close the login prompt
      fetchAndShowLinkedWallets(); // ...immediately proceed to the wallet selection step.
    }
  }, [isAuthenticated, showLoginPromptModal]);


  // --- EFFECT 2: This syncs a connected wallet with the backend ---
  useEffect(() => {
    const syncWallet = async () => {
      if (!isAuthenticated || !connected || !account || isConnecting) return;

      try {
        setIsConnecting(true);
        const addressString = String(account.address);
        const isAlreadyLinked = linkedWallets.some(w => w.address === addressString);
        if (!isAlreadyLinked) {
          await api.linkNewWallet(authToken, { address: addressString, walletName: wallet?.adapter.name });
        }
        if (onWalletConnected) {
          onWalletConnected({ ...account, address: addressString, publicKey: String(account.publicKey) });
        }
      } catch (error) {
        console.error("Wallet sync error:", error);
      } finally {
        setIsConnecting(false);
        setShowLinkedWalletModal(false);
        setShowAddNewWalletModal(false);
      }
    };
    
    const timeoutId = setTimeout(syncWallet, 500);
    return () => clearTimeout(timeoutId);
  }, [connected, account, wallet]);


  // --- ACTION: Main function to start the whole connection flow ---
  const handleConnectClick = () => {
    if (connected) return; // Already connected, do nothing.
    setShowLoginPromptModal(true); // The new first step is always to show the login prompt.
  };

  // --- ACTION: Fetches linked wallets and shows the appropriate modal ---
  const fetchAndShowLinkedWallets = async () => {
    setIsLoading(true);
    setShowLinkedWalletModal(true);
    try {
      const userWallets = await api.getLinkedWallets(authToken);
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

  // --- ACTION: Handles the actual Google login from the prompt modal ---
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Use the login function from your AuthContext
      await loginWithGoogle(); // or mockAuth.loginWithGoogle() for testing
    } catch (error) {
      toast.error("Google login failed. Please try again.");
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
        <button 
          onClick={handleConnectClick}
          className="w-full py-3 rounded-xl font-medium transition bg-cyan-600 text-white hover:bg-cyan-700"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="flex items-center justify-between w-full bg-[#111112] rounded-xl p-3 border border-[#2a2a35]">
          <div className="flex items-center">
            <img src={wallet?.adapter.icon} alt={wallet?.adapter.name} className="w-6 h-6 rounded-full mr-3" />
            <span className="text-white font-mono text-sm">{formatAddress(account?.address)}</span>
          </div>
          <button onClick={handleDisconnect} className="text-gray-400 hover:text-white transition" title="Disconnect">
            <LogOut size={18} />
          </button>
        </div>
      )}

      {/* --- NEW: The First Modal - Login Prompt --- */}
      {showLoginPromptModal && !isAuthenticated && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1c1c24] rounded-2xl p-8 border border-[#2a2a35] shadow-lg w-full max-w-sm text-center">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" onClick={() => setShowLoginPromptModal(false)}>×</button>
            
            <div className="mx-auto bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <WalletIcon className="w-8 h-8 text-cyan-400" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">
              Login to Continue
            </h3>
            <p className="text-gray-400 mb-8">
              Sign in with Google to securely manage and link your wallets.
            </p>
            
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 py-3 rounded-xl font-medium transition bg-white text-black hover:bg-gray-200 disabled:bg-gray-300"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="w-6 h-6" />
                  <span>Sign in with Google</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* --- Modal to show wallets linked to Google Account (Unchanged UI) --- */}
      {showLinkedWalletModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1c1c24] rounded-2xl p-6 border border-[#2a2a35] shadow-lg w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Your Wallets</h3>
              <button className="text-gray-400 hover:text-white text-2xl" onClick={() => setShowLinkedWalletModal(false)}>×</button>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {isLoading ? (
                <div className="flex justify-center items-center h-24"><Loader2 className="animate-spin text-cyan-500" /></div>
              ) : (
                <>
                  {linkedWallets.map((linkedWallet) => (
                    <button key={linkedWallet.address} onClick={() => handleWalletSelect(linkedWallet.walletName)} className="flex items-center w-full p-3 hover:bg-[#2a2a35] rounded-lg transition">
                      <img src={wallets.find(w => w.adapter.name === linkedWallet.walletName)?.adapter.icon} alt={linkedWallet.walletName} className="w-8 h-8 rounded-full mr-4" />
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
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Modal to add a new wallet (Unchanged UI) --- */}
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