import React, { useState } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useAuth } from '../../contexts/AuthContext';
import { Wallet, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AptosConnectButton = ({ onSuccess, className = "" }) => {
  const { connected, account, connect, disconnect } = useWallet();
  const { aptosConnectLogin } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleAptosConnect = async () => {
    if (connected) {
      // If already connected, disconnect first
      try {
        await disconnect();
        toast.success('Wallet disconnected');
      } catch (error) {
        console.error('Disconnect error:', error);
        toast.error('Failed to disconnect wallet');
      }
      return;
    }

    try {
      setIsConnecting(true);
      
      // Connect wallet using Aptos adapter
      await connect();
      
      // Wait a bit for the account to be available
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if account is available
      if (account && account.address && account.publicKey) {
        // Prepare data for backend authentication using addressString and publicKeyString
        const aptosData = {
          addressString: account.address,
          publicKeyString: account.publicKey,
          walletType: 'aptos-connect',
          network: 'mainnet'
        };

        console.log('Attempting Aptos Connect login with:', aptosData);
        console.log('addressString:', aptosData.addressString);
        console.log('publicKeyString:', aptosData.publicKeyString);

        // Login with Aptos wallet
        const result = await aptosConnectLogin(aptosData);
        
        if (result.success && onSuccess) {
          onSuccess(result.user);
          toast.success('Aptos Connect authentication successful!');
        }
      } else {
        throw new Error('Wallet account not available');
      }
    } catch (error) {
      console.error('Aptos Connect failed:', error);
      toast.error('Aptos Connect authentication failed. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <button
      onClick={handleAptosConnect}
      disabled={isConnecting}
      className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isConnecting ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Connecting...</span>
        </>
      ) : connected ? (
        <>
          <Wallet className="w-5 h-5" />
          <span>Disconnect Wallet</span>
        </>
      ) : (
        <>
          <Wallet className="w-5 h-5" />
          <span>Connect with Aptos</span>
        </>
      )}
    </button>
  );
};

export default AptosConnectButton; 