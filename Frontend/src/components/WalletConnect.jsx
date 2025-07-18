import React, { useState, useEffect } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { Button, Modal } from 'antd';
import { WalletSelector } from '@aptos-labs/wallet-adapter-ant-design';
import { walletAPI } from '../utils/api';
import toast from 'react-hot-toast';
import '@aptos-labs/wallet-adapter-ant-design/dist/index.css';

const WalletConnect = ({ onWalletConnected }) => {
  const { connected, account, disconnect, wallet } = useWallet();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const syncWallet = async () => {
      // Ensure we have a valid account object with address and public key
      if (connected && account?.address && account?.publicKey) {
        try {
          console.log("Syncing wallet with backend:", account); // Log the full account object
          await walletAPI.connect(account.address, account.publicKey);
          toast.success(`Wallet ${wallet?.name} connected!`);
          if (onWalletConnected) {
            onWalletConnected(account);
          }
        } catch (error) {
          toast.error("Failed to sync wallet with backend.");
          console.error("Wallet sync error:", error);
        }
        setIsModalOpen(false); // Close modal on successful connection
      }
    };
    syncWallet();
  }, [connected, account, wallet, onWalletConnected]);

  const handleConnectClick = () => {
    if (!connected) {
      setIsModalOpen(true);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    toast('Wallet disconnected'); // Replaced toast.info with toast()
  };

  const formatAddress = (address) => {
    // Robust check to ensure address is a string
    if (typeof address !== 'string' || address.length === 0) {
      return 'Invalid Address';
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      {!connected ? (
        <Button 
          type="primary" 
          onClick={handleConnectClick}
          className="connect-wallet-btn"
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
          >
            Disconnect
          </Button>
        </div>
      )}

      <Modal
        title="Select a Wallet"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={350}
        centered
      >
        <div className="py-4">
          <WalletSelector />
        </div>
      </Modal>
    </>
  );
};

export default WalletConnect; 