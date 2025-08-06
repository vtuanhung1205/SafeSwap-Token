import React, { useState, useEffect } from 'react';
import { AptosConnect } from '@aptos-connect/wallet-api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, LogOut, Wallet as WalletIcon } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import DemoBadge from './DemoBadge';

const SimpleWalletConnect = ({ onWalletConnected }) => {
    const { isAuthenticated, googleLogin, connectWallet, disconnectWallet } = useAuth();
    
    const [isLoading, setIsLoading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);
    const [walletBalance, setWalletBalance] = useState(null);
    const [account, setAccount] = useState(null);
    const [connected, setConnected] = useState(false);

    // Initialize AptosConnect
    const aptosConnect = new AptosConnect({
        network: 'mainnet',
        providers: ['martian', 'rise']
    });

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
                
                if (connected && account) {
                    try {
                        await connectWallet(account.address, 'aptos-connect');
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

    const handleConnectClick = async () => {
        if (connected) return;
        
        setIsConnecting(true);
        try {
            // Connect using AptosConnect
            const result = await aptosConnect.connect();
            
            if (result.success) {
                setAccount(result.account);
                setConnected(true);
                setWalletBalance('0.0000 (Demo Mode)');
                toast.success('Connected! Demo mode enabled');
                setShowLoginPromptModal(true);
            } else {
                toast.error('Failed to connect wallet');
            }
        } catch (error) {
            console.error("Wallet connection error:", error);
            toast.error("Failed to connect wallet");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            await aptosConnect.disconnect();
            await disconnectWallet();
            setConnected(false);
            setAccount(null);
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
            {!connected ? (
                <div className="flex flex-col items-center space-y-4">
                    <button
                        onClick={handleConnectClick}
                        disabled={isConnecting}
                        className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isConnecting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <WalletIcon className="w-5 h-5" />
                        )}
                        <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
                    </button>
                    <p className="text-sm text-gray-400 text-center max-w-xs">
                        Connect your Aptos wallet to start swapping tokens
                    </p>
                </div>
            ) : (
                <div className="flex flex-col items-center space-y-4">
                    <div className="bg-[#1c1c24] rounded-xl p-4 border border-[#2a2a35] w-full max-w-sm">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white font-semibold">Wallet Connected</h3>
                            <DemoBadge isDemoMode={walletBalance === '0.0000 (Demo Mode)'} />
                        </div>
                        
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Address:</span>
                                <span className="text-white font-mono">{formatAddress(account?.address)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Balance:</span>
                                <span className="text-white">{walletBalance || 'Loading...'}</span>
                            </div>
                        </div>
                        
                        <button
                            onClick={handleDisconnect}
                            className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <LogOut className="w-4 h-4 inline mr-2" />
                            Disconnect
                        </button>
                    </div>
                </div>
            )}

            {/* Login Prompt Modal giữ nguyên */}
            {showLoginPromptModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-[#1c1c24] rounded-2xl p-8 border border-[#2a2a35] shadow-lg w-full max-w-sm text-center">
                        <h3 className="text-xl font-bold text-white mb-2">
                            {connected && account ? 'Wallet Connected! Now Authenticate' : 'Connect to Aptos Mainnet'}
                        </h3>
                        <p className="text-gray-400 mb-8">
                            {connected && account
                                ? `✅ Wallet: AptosConnect (${formatAddress(account.address)}) - ${walletBalance ? `${walletBalance} APT` : 'Loading balance...'}`
                                : 'Please connect your Aptos wallet to mainnet first, then authenticate.'
                            }
                        </p>
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => startGoogleLogin()}
                                disabled={isLoading}
                                className="w-full bg-white text-gray-900 px-4 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : (
                                    'Continue with Google'
                                )}
                            </button>
                            
                            <button
                                onClick={() => setShowLoginPromptModal(false)}
                                className="w-full bg-transparent border border-gray-600 text-gray-400 px-4 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SimpleWalletConnect; 