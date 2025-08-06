import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import { Loader2, LogOut, PlusCircle, Wallet as WalletIcon } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import DemoBadge from './DemoBadge';

const WalletConnect = ({ onWalletConnected }) => {
    const { isAuthenticated, googleLogin, connectWallet, disconnectWallet } = useAuth();
    const { connected, account, disconnect, wallet, connect, wallets, signAndSubmitTransaction } = useWallet();

    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);
    const [showLinkedWalletModal, setShowLinkedWalletModal] = useState(false);
    const [showAddNewWalletModal, setShowAddNewWalletModal] = useState(false);
    const [linkedWallets, setLinkedWallets] = useState([]);
    const [walletBalance, setWalletBalance] = useState(null);

    const startGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                // Get user info from Google
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoResponse.json();
                
                // Create SafeSwap account with Google data
                await googleLogin({
                    access_token: tokenResponse.access_token,
                    user: userInfo,
                    googleId: userInfo.sub,
                    email: userInfo.email,
                    name: userInfo.name
                });
                
                // Link wallet to SafeSwap account
                if (connected && account) {
                    try {
                        await connectWallet(account.address, wallet?.adapter?.name || 'other');
                        toast.success('SafeSwap account created! Wallet linked successfully.');
                    } catch (error) {
                        console.error('Failed to link wallet to SafeSwap account:', error);
                        toast.error('Account created but failed to link wallet');
                    }
                }
                
                setShowLoginPromptModal(false);
            } catch (error) {
                console.error("Failed to authenticate:", error);
                toast.error("Authentication failed. Please try again.");
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => {
            toast.error("Authentication failed. Please try again.");
            setIsLoading(false);
        },
    });

    const handleGoogleLoginClick = () => {
        setIsLoading(true);
        startGoogleLogin();
    };

    const handleAppleLoginClick = () => {
        // Apple Sign-In implementation
        toast.info("Apple Sign-In coming soon!");
        setIsLoading(false);
    };

    // Handle wallet connection after authentication
    const handleWalletConnection = async () => {
        if (!isAuthenticated) {
            toast.error("Please authenticate first");
            return;
        }

        try {
            // Find available wallets (Martian or Rise)
            const availableWallets = wallets.filter(w => w.readyState === 'Installed' || w.readyState === 'Loadable');
            if (availableWallets.length > 0) {
                const selectedWallet = availableWallets[0];
                if (selectedWallet && typeof selectedWallet.connect === 'function') {
                    await selectedWallet.connect();
                    toast.success(`Connecting to ${selectedWallet.name}...`);
                } else {
                    toast.error("Selected wallet does not support direct connect method.");
                    console.error('selectedWallet.connect is not a function:', selectedWallet);
                }
            } else {
                toast.error("No wallets available. Please install Martian or Rise wallet.");
            }
        } catch (error) {
            console.error("Wallet connection error:", error);
            toast.error("Failed to connect wallet");
        }
    };

    // Fetch wallet balance when connected
    useEffect(() => {
        const fetchWalletBalance = async () => {
            if (!connected || !account) return;
            
            try {
                // Use AptosClient to fetch balance (as per the guide)
                const client = new (await import('aptos')).AptosClient('https://fullnode.mainnet.aptoslabs.com/v1');
                
                const resource = await client.getAccountResource({
                    address: account.address,
                    resourceType: '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>',
                });
                
                const balanceInApt = Number(resource.data.coin.value) / 100000000;
                setWalletBalance(balanceInApt);
            } catch (error) {
                console.error('Error fetching balance:', error);
                setWalletBalance('Error');
            }
        };

        fetchWalletBalance();
    }, [connected, account]);

    useEffect(() => {
        const syncWallet = async () => {
            if (!connected || !account || isConnecting) return;
            try {
                setIsConnecting(true);
                const addressString = String(account.address);
                const walletType = wallet?.adapter.name || 'other';
                
                // Connect wallet to backend after authentication
                await connectWallet(addressString, walletType);
                toast.success("Wallet connected successfully!");
                
                if (onWalletConnected) {
                    onWalletConnected({ 
                        ...account, 
                        address: addressString, 
                        publicKey: String(account.publicKey),
                        walletType: walletType,
                        balance: walletBalance
                    });
                }
            } catch (error) {
                console.error("Wallet sync error:", error);
                toast.error(error.response?.data?.message || "Failed to sync wallet with backend.");
            } finally {
                setIsConnecting(false);
                setShowLinkedWalletModal(false);
                setShowAddNewWalletModal(false);
            }
        };
        const timeoutId = setTimeout(syncWallet, 100);
        return () => clearTimeout(timeoutId);
    }, [connected, account, connectWallet, onWalletConnected, walletBalance]);

    const handleConnectClick = async () => {
        if (connected) return;
        
        // Nếu chưa đăng nhập, hiện modal login trước
        if (!isAuthenticated) {
            setShowLoginPromptModal(true);
            return;
        }
        
        // Nếu đã đăng nhập, hiện modal chọn ví Aptos ngay
        setShowAddNewWalletModal(true);
    };

    // Xóa useEffect tự động mở modal chọn ví sau khi login
    // Vì login và connect wallet là độc lập, không cần tự động mở

    const handleWalletSelect = async (walletName) => {
        try {
            setIsConnecting(true);
            await connect(walletName);
            toast.success(`Connecting to ${walletName}...`);
            
            // Đóng modal sau khi connect
            setShowAddNewWalletModal(false);
            setShowLinkedWalletModal(false);
        } catch (error) {
            console.error("Wallet connection error:", error);
            toast.error("Failed to connect wallet");
        } finally {
            setIsConnecting(false);
        }
    };

    // Xóa useEffect tự động mở modal connect ví sau khi login

    const fetchAndShowLinkedWallets = async () => {
        setIsLoading(true);
        setShowLinkedWalletModal(true);
        try {
            // For now, show available wallets
            setLinkedWallets([]);
                setShowLinkedWalletModal(false);
                setShowAddNewWalletModal(true);
        } catch (error) {
            toast.error("Could not fetch your wallets.");
            setShowLinkedWalletModal(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await disconnectWallet();
            disconnect();
            setWalletBalance(null);
            toast.success("Wallet disconnected successfully!");
        } catch (error) {
            console.error("Disconnect error:", error);
            toast.error("Failed to disconnect wallet");
        }
    };

    const formatAddress = (address) => address ? `${String(address).slice(0, 6)}...${String(address).slice(-4)}` : 'Invalid Address';

  return (
    <>
      {/* Chỉ hiện nút Connect Wallet khi đã đăng nhập và chưa connect ví */}
      {isAuthenticated && !connected && (
          <button onClick={handleConnectClick} className="w-full py-3 rounded-xl font-medium transition bg-cyan-600 text-white hover:bg-cyan-700 disabled:bg-cyan-600/50 disabled:text-cyan-300 disabled:cursor-not-allowed"
                    disabled={isConnecting}
          >
            {isConnecting ? (
              <div className="flex items-center justify-center space-x-2">
                <Loader2 size={18} className="animate-spin" />
                <span>Connecting...</span>
              </div>
            ) : (
              "Connect Aptos Wallet"
            )}
          </button>
      )}
      {/* Nếu đã connect ví, hiện địa chỉ ví */}
      {isAuthenticated && connected && account && (
          <div className="flex items-center justify-between w-full bg-[#111112] rounded-xl p-3 border border-[#2a2a35]">
              <div className="flex items-center">
                  <img src={wallet?.adapter?.icon || '/default-wallet-icon.png'} alt={wallet?.adapter?.name || 'Wallet'} className="w-6 h-6 rounded-full mr-3" />
                  <div className="text-left">
                      <div className="flex items-center space-x-2">
                          <span className="text-white font-mono text-sm">
                              {formatAddress(account?.address)}
                          </span>
                          <DemoBadge isDemoMode={walletBalance === '0.0000 (Demo Mode)'} />
                      </div>
                      {walletBalance !== null && (
                          <div className="text-gray-400 text-xs">
                              {typeof walletBalance === 'number' ? `${walletBalance.toFixed(4)} APT` : walletBalance}
                          </div>
                      )}
                  </div>
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

            {/* Modal 1: Authentication Prompt */}
            {showLoginPromptModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#1c1c24] rounded-2xl p-8 border border-[#2a2a35] shadow-lg w-full max-w-sm text-center">
                        <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" onClick={() => setShowLoginPromptModal(false)}>×</button>
                        <div className="mx-auto bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                            <WalletIcon className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {connected && account ? 'Wallet Connected! Create SafeSwap Account' : 'Connect to Aptos Mainnet'}
                        </h3>
                        <p className="text-gray-400 mb-8">
                            {connected && account 
                                ? `✅ Wallet: ${wallet?.adapter?.name || 'Unknown'} (${formatAddress(account.address)}) - ${walletBalance ? `${walletBalance} APT` : 'Loading balance...'}`
                                : 'Please connect your Aptos wallet to mainnet first, then create your SafeSwap account.'
                            }
                        </p>
                        
                        {/* Google Sign-In */}
                        <button 
                            onClick={handleGoogleLoginClick} 
                            disabled={isLoading} 
                            className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl font-medium transition bg-white text-black hover:bg-gray-200 disabled:bg-gray-300 mb-3"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin w-6 h-6" />
                            ) : (
                                <>
                                    <img 
                                        src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
                                        alt="Google" 
                                        className="w-6 h-6" 
                                    />
                                    <span>Continue with Google</span>
                                </>
                            )}
                        </button>
                        
                        {/* Apple Sign-In */}
                        <button 
                            onClick={handleAppleLoginClick} 
                            disabled={isLoading} 
                            className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl font-medium transition bg-black text-white hover:bg-gray-800 disabled:bg-gray-600 border border-gray-600"
                        >
                            {isLoading ? (
                                <Loader2 className="animate-spin w-6 h-6" />
                            ) : (
                                <>
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                                    </svg>
                                    <span>Continue with Apple</span>
                                </>
                            )}
                        </button>
                        
                        <div className="mt-6 text-xs text-gray-500">
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </div>
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
                    <div className="bg-[#1c1c24] rounded-2xl p-8 border border-[#2a2a35] shadow-lg w-full max-w-md">
                        <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" onClick={() => setShowAddNewWalletModal(false)}>×</button>
                        <div className="mx-auto bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                            <WalletIcon className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 text-center">
                            Connect Aptos Wallet
                        </h3>
                        <p className="text-gray-400 mb-8 text-center">
                            Choose your Aptos wallet to connect
                        </p>
                        
                        {/* Debug info */}
                        <div className="mb-4 p-3 bg-gray-800 rounded text-xs text-gray-300">
                            <p>Debug: Found {wallets?.length || 0} wallets</p>
                            {wallets?.map((w, i) => (
                                <p key={i}>- {w?.adapter?.name || 'Unknown'} ({w?.readyState || 'Unknown'})</p>
                            ))}
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto space-y-2">
                            {wallets?.map((wallet) => (
                                wallet?.adapter?.name && (
                                    <button 
                                        key={wallet.adapter.name} 
                                        onClick={() => handleWalletSelect(wallet.adapter.name)} 
                                        disabled={isConnecting}
                                        className="flex items-center w-full p-4 hover:bg-[#2a2a35] rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <img src={wallet.adapter.icon} alt={wallet.adapter.name} className="w-8 h-8 rounded-full mr-4" />
                                        <div className="flex-1 text-left">
                                            <span className="text-white font-medium text-lg">{wallet.adapter.name}</span>
                                            <p className="text-gray-400 text-sm">{wallet.readyState === 'Installed' ? 'Installed' : 'Not Installed'}</p>
                                        </div>
                                        {isConnecting && <Loader2 size={20} className="animate-spin text-cyan-400" />}
                                    </button>
                                )
                            ))}
                        </div>
                        
                        {wallets?.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-400 mb-4">No wallets available</p>
                                <p className="text-sm text-gray-500">
                                    Please install Petra, Martian, or other Aptos wallets
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default WalletConnect;