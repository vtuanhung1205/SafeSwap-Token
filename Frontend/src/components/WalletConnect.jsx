import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import { Loader2, LogOut, PlusCircle, Wallet as WalletIcon } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import DemoBadge from './DemoBadge';
import { APTOS_NODE_URL, validateAptosConfig } from '../config/aptos';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

const WalletConnect = ({ onWalletConnected }) => {
    const { isAuthenticated, googleLogin, connectWallet, disconnectWallet } = useAuth();
    const { connect, wallets, connected, account, disconnect } = useWallet();
    
    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [linkedWallets, setLinkedWallets] = useState([]);
    const [walletBalance, setWalletBalance] = useState(null);
    const [connectedWallet, setConnectedWallet] = useState(null);

    const startGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsLoading(true);
            try {
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const userInfo = await userInfoResponse.json();
                
                await googleLogin({
                    access_token: tokenResponse.access_token,
                    user: userInfo,
                    googleId: userInfo.sub,
                    email: userInfo.email,
                    name: userInfo.name
                });
                
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
        toast.info("Apple Sign-In coming soon!");
        setIsLoading(false);
    };

    // Hiện modal chọn ví
    const handleConnectAptosWallet = () => {
        setShowWalletModal(true);
    };

    // Connect với ví cụ thể
    const handleConnectWallet = async (walletName) => {
        try {
            setIsConnecting(true);
            setShowWalletModal(false);
            
            await connect(walletName);
            toast.success(`Connected to ${walletName}!`);
            
            // Lưu thông tin ví
            const walletData = {
                address: account?.address,
                publicKey: account?.publicKey?.toString(),
                walletType: walletName,
                balance: null
            };
            
            setConnectedWallet(walletData);
            
            // Gọi callback
            if (onWalletConnected) {
                onWalletConnected(walletData);
            }
            
            // Fetch balance
            if (account?.address) {
                await fetchWalletBalance(account.address);
            }
            
        } catch (error) {
            console.error('Wallet connection error:', error);
            toast.error('Failed to connect: ' + error.message);
        } finally {
            setIsConnecting(false);
        }
    };

    // Fetch wallet balance
    const fetchWalletBalance = async (address) => {
        if (!address) return;
        
        try {
            validateAptosConfig();
            const client = new (await import('aptos')).AptosClient(APTOS_NODE_URL);
            
            const resource = await client.getAccountResource({
                address: address,
                resourceType: '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>',
            });
            
            const balanceInApt = Number(resource.data.coin.value) / 100000000;
            setWalletBalance(balanceInApt);
            
            // Update wallet data with balance
            if (connectedWallet) {
                setConnectedWallet({
                    ...connectedWallet,
                    balance: balanceInApt
                });
            }
            
        } catch (error) {
            console.error('Error fetching balance:', error);
            setWalletBalance('Error');
        }
    };

    const handleDisconnect = async () => {
        try {
            await disconnect();
            setConnectedWallet(null);
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
            {/* Nút Connect Wallet */}
            {!connectedWallet && (
                <button 
                    onClick={handleConnectAptosWallet} 
                    className="w-full py-3 rounded-xl font-medium transition bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isConnecting}
                >
                    {isConnecting ? (
                        <div className="flex items-center justify-center space-x-2">
                            <Loader2 size={18} className="animate-spin" />
                            <span>Connecting...</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center space-x-2">
                            <WalletIcon size={18} />
                            <span>Connect Aptos Wallet</span>
                        </div>
                    )}
                </button>
            )}

            {/* Hiển thị ví đã connect */}
            {connectedWallet && (
                <div className="flex items-center justify-between w-full bg-[#111112] rounded-xl p-3 border border-[#2a2a35]">
                    <div className="flex items-center">
                        <WalletIcon className="w-6 h-6 text-purple-400 mr-3" />
                        <div className="text-left">
                            <div className="flex items-center space-x-2">
                                <span className="text-white font-mono text-sm">
                                    {formatAddress(connectedWallet.address)}
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

            {/* Modal chọn ví */}
            {showWalletModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#1c1c24] rounded-2xl p-6 border border-[#2a2a35] shadow-lg w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Connect a wallet</h3>
                            <button 
                                onClick={() => setShowWalletModal(false)}
                                className="text-gray-400 hover:text-white text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Recommended wallet */}
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-300 mb-3">Recommended wallet</h4>
                            <button 
                                onClick={() => handleConnectWallet('Petra')}
                                className="w-full flex items-center space-x-3 p-4 bg-[#2a2a35] rounded-xl hover:bg-[#3a3a45] transition"
                            >
                                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">P</span>
                                </div>
                                <span className="text-white font-medium">Petra Wallet</span>
                            </button>
                            <p className="text-xs text-gray-400 mt-2">Please use the Petra wallet for the best experience.</p>
                        </div>

                        {/* Other wallets */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-3">Other wallets</h4>
                            <div className="grid grid-cols-3 gap-3">
                                {wallets.filter(wallet => wallet.name !== 'Petra').map((wallet) => (
                                    <button
                                        key={wallet.name}
                                        onClick={() => handleConnectWallet(wallet.name)}
                                        className="flex flex-col items-center space-y-2 p-3 bg-[#2a2a35] rounded-xl hover:bg-[#3a3a45] transition"
                                    >
                                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold text-xs">{wallet.name.charAt(0)}</span>
                                        </div>
                                        <span className="text-white text-xs">{wallet.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Login Google/Apple (nếu cần) */}
            {showLoginPromptModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#1c1c24] rounded-2xl p-8 border border-[#2a2a35] shadow-lg w-full max-w-sm text-center">
                        <button className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl" onClick={() => setShowLoginPromptModal(false)}>×</button>
                        <div className="mx-auto bg-cyan-500/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                            <WalletIcon className="w-8 h-8 text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            Login to SafeSwap
                        </h3>
                        <p className="text-gray-400 mb-8">
                            Login to save your preferences and transaction history
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
        </>
    );
};

export default WalletConnect;