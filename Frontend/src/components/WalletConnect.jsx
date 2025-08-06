import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import { Loader2, LogOut, PlusCircle, Wallet as WalletIcon } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';

const WalletConnect = ({ onWalletConnected }) => {
    const { isAuthenticated, googleLogin, connectWallet, disconnectWallet } = useAuth();
    const { connected, account, disconnect, wallet, select, wallets } = useWallet();

    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);
    const [showLinkedWalletModal, setShowLinkedWalletModal] = useState(false);
    const [showAddNewWalletModal, setShowAddNewWalletModal] = useState(false);
    const [linkedWallets, setLinkedWallets] = useState([]);

    const startGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                // Get user info from Google
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoResponse.json();
                
                // Login with Google data
                await googleLogin({
                    access_token: tokenResponse.access_token,
                    user: userInfo
                });
                
                toast.success('Successfully logged in with Google!');
                setShowLoginPromptModal(false);
                
                // After successful login, show wallet options
                fetchAndShowLinkedWallets();
            } catch (error) {
                console.error("Failed to sync with backend after Google login:", error);
                toast.error("Google login failed. Please try again.");
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => {
            toast.error("Google login failed. Please try again.");
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

    // Handle wallet login - Login with Aptos wallet and get wallet ID
    const handleWalletLogin = async (walletAddress, walletType = 'other') => {
        setIsLoading(true);
        try {
            // Create a simple message for signature (you can customize this)
            const message = `Login to SafeSwap with wallet ${walletAddress} at ${new Date().toISOString()}`;
            
            // For now, we'll use a placeholder signature
            // In a real implementation, you would get the signature from the wallet
            const signature = `placeholder_signature_${Date.now()}`;
            
            // Call wallet login API
            const response = await authAPI.walletLogin({
                walletAddress,
                signature,
                message,
                walletType
            });
            
            if (response.data.success) {
                // Store the token and user data
                localStorage.setItem('authToken', response.data.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.data.user));
                
                toast.success('Wallet login successful!');
                setShowLoginPromptModal(false);
                
                // Trigger wallet connection
                if (onWalletConnected) {
                    onWalletConnected({
                        address: walletAddress,
                        walletType: walletType,
                        ...response.data.data.wallet
                    });
                }
                
                return response.data.data;
            } else {
                throw new Error(response.data.error || 'Wallet login failed');
            }
        } catch (error) {
            console.error('Wallet login error:', error);
            toast.error(error.response?.data?.error || 'Wallet login failed. Please try again.');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Handle wallet verification
    const handleWalletVerification = async (walletAddress) => {
        setIsLoading(true);
        try {
            const message = `Verify wallet ${walletAddress} at ${new Date().toISOString()}`;
            const signature = `placeholder_signature_${Date.now()}`;
            
            const response = await authAPI.verifyWallet({
                walletAddress,
                signature,
                message
            });
            
            if (response.data.success) {
                toast.success('Wallet verification successful!');
                return response.data.data;
            } else {
                throw new Error(response.data.error || 'Wallet verification failed');
            }
        } catch (error) {
            console.error('Wallet verification error:', error);
            toast.error(error.response?.data?.error || 'Wallet verification failed.');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Get wallet information
    const getWalletInfo = async (address) => {
        try {
            const response = await authAPI.getWalletInfo(address);
            if (response.data.success) {
                return response.data.data;
            } else {
                throw new Error(response.data.error || 'Failed to get wallet info');
            }
        } catch (error) {
            console.error('Get wallet info error:', error);
            toast.error(error.response?.data?.error || 'Failed to get wallet information.');
            throw error;
        }
    };

    useEffect(() => {
        if (isAuthenticated && showLoginPromptModal) {
            setShowLoginPromptModal(false);
            fetchAndShowLinkedWallets();
        }
    }, [isAuthenticated, showLoginPromptModal]);

    useEffect(() => {
        const syncWallet = async () => {
            if (!isAuthenticated || !connected || !account || isConnecting) return;
            try {
                setIsConnecting(true);
                const addressString = String(account.address);
                const walletType = wallet?.adapter.name || 'other';
                
                // User is authenticated, connect wallet
                await connectWallet(addressString, walletType);
                toast.success("Wallet connected successfully!");
                
                if (onWalletConnected) {
                    onWalletConnected({ 
                        ...account, 
                        address: addressString, 
                        publicKey: String(account.publicKey),
                        walletType: walletType
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
    }, [connected, account, isAuthenticated, connectWallet, onWalletConnected]);

    const handleConnectClick = () => {
        if (connected) return;
        
        // Only allow wallet connection if authenticated
        if (!isAuthenticated) {
            setShowLoginPromptModal(true);
        } else {
            fetchAndShowLinkedWallets();
        }
    };

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
            toast.success("Wallet disconnected successfully!");
        } catch (error) {
            console.error("Disconnect error:", error);
            toast.error("Failed to disconnect wallet");
        }
    };
    const handleWalletSelect = (walletName) => select(walletName);
    const formatAddress = (address) => address ? `${String(address).slice(0, 6)}...${String(address).slice(-4)}` : 'Invalid Address';

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
                        <img src={wallet?.adapter?.icon || '/default-wallet-icon.png'} alt={wallet?.adapter?.name || 'Wallet'} className="w-6 h-6 rounded-full mr-3" />
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

            {/* Modal 1: Login Prompt */}
            {showLoginPromptModal && !isAuthenticated && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#1c1c24] rounded-2xl p-8 border border-[#2a2a35] shadow-lg w-full max-w-sm text-center">
                        <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" onClick={() => setShowLoginPromptModal(false)}>×</button>
                        <div className="mx-auto bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                            <WalletIcon className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Sign In to Connect Wallet</h3>
                        <p className="text-gray-400 mb-8">Sign in with your account to securely connect your Aptos wallets.</p>
                        
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