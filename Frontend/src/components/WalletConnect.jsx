import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../utils/api';
import { Loader2, LogOut, PlusCircle, Wallet as WalletIcon } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import DemoBadge from './DemoBadge';
import { APTOS_NODE_URL, validateAptosConfig } from '../config/aptos';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import AptosConnectModal from './Auth/AptosConnectModal';

const WalletConnect = ({ onWalletConnected }) => {
    const { isAuthenticated, googleLogin, connectWallet, disconnectWallet } = useAuth();
    const { connect, wallets, connected, account, disconnect } = useWallet();
    
    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [showAptosConnectModal, setShowAptosConnectModal] = useState(false);
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
        setShowAptosConnectModal(true);
    };

    // Handle Aptos Connect success
    const handleAptosConnectSuccess = (walletData) => {
        console.log('Aptos Connect wallet connected:', walletData);
        
        // Lưu thông tin ví
        const walletInfo = {
            address: walletData.address,
            publicKey: walletData.publicKey,
            walletType: walletData.provider,
            balance: null
        };
        
        setConnectedWallet(walletInfo);
        
        // Gọi callback
        if (onWalletConnected) {
            onWalletConnected(walletInfo);
        }
        
        // Fetch balance
        if (walletData.address) {
            fetchWalletBalance(walletData.address);
        }
        
        toast.success(`Connected with ${walletData.provider}: ${walletData.address}`);
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
                        
                        {/* Aptos Connect OAuth */}
                        <AptosConnectModal 
                            isOpen={showAptosConnectModal}
                            onClose={() => setShowAptosConnectModal(false)}
                            onSuccess={handleAptosConnectSuccess}
                        />
                        
                        <div className="mt-6 text-xs text-gray-500">
                            By continuing, you agree to our Terms of Service and Privacy Policy
                        </div>
                    </div>
                </div>
            )}

            {/* Aptos Connect Modal */}
            <AptosConnectModal 
                isOpen={showAptosConnectModal}
                onClose={() => setShowAptosConnectModal(false)}
                onSuccess={handleAptosConnectSuccess}
            />
        </>
    );
};

export default WalletConnect;