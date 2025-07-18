import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Button, Modal } from 'antd';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';
import { walletAPI } from '../utils/api';
import toast from 'react-hot-toast';
import '@aptos-labs/wallet-adapter-ant-design/dist/index.css';
import { useAuth } from '../contexts/AuthContext';

const WalletConnect = ({ onWalletConnected }) => {
  const { connected, account, disconnect, wallet } = useWallet();
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    const syncWallet = async () => {
      // Ensure we have a valid account object with address and public key
      if (connected && account && !isConnecting) {
        try {
          setIsConnecting(true);
          
          // Safely extract address and publicKey as strings
          let addressString, publicKeyString;
          
          try {
            // Handle different wallet adapter formats
            addressString = typeof account.address === 'object' && account.address.hexString 
              ? account.address.hexString 
              : String(account.address);
              
            publicKeyString = typeof account.publicKey === 'object' && account.publicKey.hexString
              ? account.publicKey.hexString
              : String(account.publicKey);
          } catch (error) {
            console.error("Error formatting wallet address:", error);
            throw new Error("Invalid wallet address format");
          }
          
          // Validate that we have proper strings
          if (!addressString || !publicKeyString || 
              typeof addressString !== 'string' || 
              typeof publicKeyString !== 'string') {
            throw new Error("Invalid wallet address or public key");
          }
          
          console.log("Syncing wallet with backend:", { address: addressString, publicKey: publicKeyString });
          
          const response = await walletAPI.connect(addressString, publicKeyString);
          
          if (response.data?.success) {
            // Only show notification when explicitly requested via onWalletConnected
            if (onWalletConnected) {
              onWalletConnected({...account, address: addressString, publicKey: publicKeyString});
            }
          } else {
            console.error("Failed to sync wallet with backend.");
          }
        } catch (error) {
          console.error("Wallet sync error:", error);
          
          // Only show error notification for critical errors
          if (error.response?.status !== 500) {
            const errorMessage = error.response?.data?.message || error.message || "Connection error";
            toast.error(errorMessage, { duration: 3000 });
          } else {
            // For server errors, still connect locally without notification
            if (onWalletConnected) {
              onWalletConnected(account);
            }
          }
        } finally {
          setIsConnecting(false);
          setIsModalOpen(false);
        }
      }
    };
    syncWallet();
  }, [connected, account, wallet, onWalletConnected, isConnecting, isAuthenticated]);

  const handleConnectClick = () => {
    if (!connected) {
      setIsModalOpen(true);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    // No toast notification on disconnect
  };

  const formatAddress = (address) => {
    try {
      // Handle different possible address formats
      let addressString = address;
      
      if (typeof address === 'object') {
        addressString = address.hexString || address.toString();
      } else if (address) {
        addressString = String(address);
      }
      
      // Ensure we have a valid string
      if (!addressString || typeof addressString !== 'string') {
        return 'Invalid Address';
      }
      
      return `${addressString.slice(0, 6)}...${addressString.slice(-4)}`;
    } catch (error) {
      console.error("Error formatting address:", error);
      return 'Invalid Address';
    }
  };

  return (
    <>
      {!connected ? (
        <Button 
          type="primary" 
          onClick={handleConnectClick}
          className="connect-wallet-btn"
          loading={isConnecting}
        >
          Connect Wallet
        </Button>
      ) : (
        <div className="wallet-info flex items-center space-x-2">
          <span className="wallet-address text-white text-sm font-mono bg-[#2a2a30] px-3 py-1 rounded-md">
            {formatAddress(account?.address)}
          </span>
          <Button 
            size="small" 
            onClick={handleDisconnect}
            className="disconnect-btn"
            disabled={isConnecting}
          >
            Disconnect
          </Button>
        </div>
      )}

      <Modal
        title="Select a Wallet"
        open={isModalOpen}
        onCancel={() => !isConnecting && setIsModalOpen(false)}
        footer={null}
        width={350}
        centered
        closable={!isConnecting}
        maskClosable={!isConnecting}
      >
        <div className="py-4">
          <WalletSelector />
        </div>
      </Modal>
    </>
  );
};

export default WalletConnect; 