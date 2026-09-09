import React from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { X, CheckCircle2, Wallet as WalletIcon } from 'lucide-react';
import { walletAPI } from '../../utils/api';

import { useAuth } from '../../contexts/AuthContext';

const WalletConnectModal = ({ isOpen, onClose, suggestedAddress, onConnected }) => {
  const { wallets, connect, connected, account, signMessage, network } = useWallet();
  const { walletLogin, isAuthenticated } = useAuth();
  const [connecting, setConnecting] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [shouldSign, setShouldSign] = React.useState(false);

  const handleConnect = async (walletName) => {
    try {
      setConnecting(true);
      setError(null);
      await connect(walletName);
      
      // We set a flag to trigger the signature once the wallet adapter
      // finishes connecting and updates the React state (account).
      setShouldSign(true);
    } catch (err) {
      console.error("Connection error:", err);
      setError(err.message || "Failed to connect wallet.");
      setConnecting(false);
    }
  };

  // Listen for the account to become available after connecting
  React.useEffect(() => {
    const performWeb3Auth = async () => {
      if (connected && account && shouldSign) {
        setShouldSign(false); // only run once
        
        try {
          const address = typeof account.address === 'string' ? account.address : account.address?.toString();
          const publicKey = typeof account.publicKey === 'string' ? account.publicKey : (account.publicKey?.toString() || '');

          // If already authenticated via Google/email, just link the wallet without needing a signature
          if (isAuthenticated) {
            await walletAPI.connect(address, publicKey);
            if (onConnected) onConnected();
            onClose();
            return;
          }

          // Otherwise, require signature for authentication
          const message = "Sign in to SafeSwap securely.";
          const nonce = Date.now().toString();
          
          const payload = {
            message: message,
            nonce: nonce,
          };
          
          const response = await signMessage(payload);
          const signatureStr = typeof response.signature === 'string' ? response.signature : 
             (response.signature?.hexString || response.signature?.data || Buffer.from(response.signature).toString('hex'));

          if (address && signatureStr) {
            await walletLogin(address, publicKey || "", signatureStr, response.fullMessage || message);
          }
          
          if (onConnected) {
            onConnected();
          }
          onClose();
        } catch (signErr) {
          console.error("Signature error:", signErr);
          setError(signErr.message?.includes("User rejected") 
            ? "Signature request rejected by user."
            : "Failed to verify wallet signature. Please try again.");
          setConnecting(false);
        }
      }
    };
    
    performWeb3Auth();
  }, [connected, account, shouldSign]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#18181c] border border-[#23232a] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#23232a]">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <WalletIcon className="text-cyan-400" />
            Connect Wallet
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {suggestedAddress && (
            <div className="mb-6 p-4 bg-cyan-900/20 border border-cyan-800/50 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-cyan-600 text-white text-xs px-2 py-1 rounded-bl-lg font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> Suggested
              </div>
              <p className="text-gray-300 text-sm mb-2">We found a wallet previously linked to your account:</p>
              <div className="font-mono text-cyan-400 bg-[#18181c] p-2 rounded border border-[#23232a] text-center">
                {suggestedAddress.substring(0, 8)}...{suggestedAddress.slice(-6)}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {wallets.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => handleConnect(wallet.name)}
                disabled={connecting}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800 hover:border-cyan-500/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <img src={wallet.icon} alt={wallet.name} className="w-8 h-8 rounded-lg bg-white p-1" />
                  <span className="text-white font-semibold group-hover:text-cyan-300 transition-colors">
                    {wallet.name}
                  </span>
                </div>
                <span className="text-gray-500 text-sm group-hover:text-cyan-400 transition-colors">
                  {wallet.readyState === 'Installed' ? 'Connect' : 'Install'}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              By connecting a wallet, you agree to SafeSwap's Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletConnectModal;
