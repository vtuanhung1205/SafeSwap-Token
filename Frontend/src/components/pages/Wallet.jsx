import React, { useState, useEffect } from "react";
import { Copy, ArrowDownCircle, ArrowUpCircle, Shield, Wallet as WalletIcon, LogOut, CheckCircle, RefreshCw, ArrowRightLeft } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import WalletConnectModal from "../Wallet/WalletConnectModal";
import { walletAPI } from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";

const Wallet = () => {
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [suggestedAddress, setSuggestedAddress] = useState(null);

  const { account, connected, disconnect } = useWallet();

  useEffect(() => {
    fetchWalletData();
  }, []);

  useEffect(() => {
    if (connected && account) {
      handleAdapterConnected(account);
    }
  }, [connected, account]);

  const handleAdapterConnected = async (walletAccount) => {
    try {
      setLoading(true);
      const addressString = typeof walletAccount.address === 'string' 
        ? walletAccount.address 
        : walletAccount.address?.toString();
      
      const publicKeyString = typeof walletAccount.publicKey === 'string'
        ? walletAccount.publicKey
        : walletAccount.publicKey?.toString() || '';

      await walletAPI.connect(addressString, publicKeyString);
      await fetchWalletData();
    } catch (err) {
      console.error("Backend connection sync failed:", err);
      setError("Failed to sync wallet with backend.");
      disconnect(); 
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      await walletAPI.disconnect();
      disconnect();
      setWalletInfo(null);
      setTransactions([]);
      setError("No wallet connected");
    } catch (err) {
      console.error("Disconnect error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const infoRes = await walletAPI.getInfo();
      setWalletInfo(infoRes.data.data.wallet);
      setSuggestedAddress(infoRes.data.data.wallet.address);
      
      try {
        const txRes = await walletAPI.getTransactions(10);
        const rawTxs = txRes.data.data.transactions || [];
        
        const formattedTxs = rawTxs.map((tx, index) => {
          return {
            id: tx.hash || index,
            type: "Transaction", 
            amount: (tx.gas_used || 0) / 100000, // Dummy mock
            currency: "APT",
            date: new Date(tx.timestamp ? (tx.timestamp / 1000) : Date.now()).toLocaleString(),
            status: tx.success ? "Completed" : "Failed",
          };
        });
        setTransactions(formattedTxs);
      } catch (txErr) {
        console.warn("Could not fetch transactions", txErr);
      }
    } catch (err) {
      console.error("Error fetching wallet data:", err);
      setError("No wallet connected or failed to load.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (walletInfo?.address) {
      navigator.clipboard.writeText(walletInfo.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-cyan-400 space-y-4">
        <RefreshCw className="w-10 h-10 animate-spin" />
        <span className="font-heading tracking-widest text-sm uppercase">Syncing Node...</span>
      </div>
    );
  }

  if (error || !walletInfo) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[80vh] flex flex-col items-center justify-center text-white p-4"
      >
        <div className="glass-panel p-12 rounded-3xl text-center max-w-md glowing-border">
          <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700">
            <Shield size={48} className="text-gray-500" />
          </div>
          <h2 className="text-3xl font-heading font-bold mb-3">No Wallet Connected</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">Connect your Aptos wallet to view your balance, manage assets, and track your transaction history securely.</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white px-8 py-4 rounded-2xl font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-3 group"
          >
            <WalletIcon size={22} className="group-hover:scale-110 transition-transform" /> Connect Aptos Wallet
          </button>
        </div>
        <WalletConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} suggestedAddress={suggestedAddress} />
      </motion.div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 text-white">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-heading font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Wallet Overview
        </h1>
        <p className="text-gray-400 mt-2 font-medium">Manage your decentralized assets securely.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: 3D Digital Card & Actions */}
        <div className="col-span-1 lg:col-span-5 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, rotateY: 2, rotateX: 2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative p-8 rounded-3xl overflow-hidden glass-panel border border-cyan-500/30 shadow-[0_20px_50px_-12px_rgba(6,182,212,0.3)] group cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Holographic Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 via-purple-900/20 to-pink-900/40 z-0"></div>
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 z-0 group-hover:rotate-12 transition-transform duration-1000"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between min-h-[220px]">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                    <Shield size={24} className="text-cyan-400" />
                  </div>
                  <span className="font-heading font-bold tracking-widest uppercase text-sm text-gray-300">SafeSwap Network</span>
                </div>
                <div className="flex items-center gap-2 text-green-400 text-xs bg-black/30 px-3 py-1.5 rounded-full border border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Secure
                </div>
              </div>

              <div className="mt-8">
                <div className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-medium">Available Balance</div>
                <div className="text-4xl md:text-5xl font-heading font-black text-white flex items-baseline gap-2 drop-shadow-lg">
                  {parseFloat(walletInfo.balance || 0).toLocaleString()} <span className="text-2xl text-cyan-400">APT</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase tracking-widest mb-1">Address</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-gray-300 text-sm">{walletInfo.address.substring(0, 6)}...{walletInfo.address.slice(-4)}</span>
                    <button onClick={handleCopy} className="text-gray-500 hover:text-cyan-400 transition-colors">
                      {copied ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
                <img src="https://cryptologos.cc/logos/aptos-apt-logo.png" alt="Aptos" className="w-10 opacity-50 grayscale group-hover:grayscale-0 transition-all" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            <button className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-cyan-400/50 hover:bg-cyan-900/20 transition-all group">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                <ArrowDownCircle size={20} className="text-cyan-400" />
              </div>
              <span className="font-semibold text-sm">Deposit</span>
            </button>
            <button className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-pink-400/50 hover:bg-pink-900/20 transition-all group">
              <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                <ArrowUpCircle size={20} className="text-pink-400" />
              </div>
              <span className="font-semibold text-sm">Withdraw</span>
            </button>
          </motion.div>

          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={handleDisconnect}
            className="w-full p-4 rounded-2xl border border-red-500/20 bg-red-900/10 text-red-400 hover:bg-red-900/20 hover:border-red-500/40 transition-all flex items-center justify-center gap-2 font-semibold"
          >
            <LogOut size={18} /> Disconnect Wallet
          </motion.button>
        </div>

        {/* Right Column: Transaction Ledger */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="col-span-1 lg:col-span-7 glass-panel p-1 rounded-3xl h-full min-h-[500px]"
        >
          <div className="bg-[#111112]/50 backdrop-blur-md w-full h-full rounded-[23px] p-6 flex flex-col">
            <h2 className="text-2xl font-heading font-bold mb-6 text-white flex items-center gap-3">
              Transaction Ledger
            </h2>

            {transactions.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#18181c]/50 rounded-2xl border border-dashed border-[#23232a]">
                <div className="w-16 h-16 bg-[#23232a] rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowRightLeft className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Transactions Found</h3>
                <p className="text-gray-400 text-sm max-w-sm">This wallet hasn't executed any transactions through SafeSwap yet.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="grid grid-cols-12 gap-4 pb-4 border-b border-[#23232a] text-xs font-bold uppercase tracking-wider text-gray-500 px-4">
                  <div className="col-span-4 md:col-span-3">Type</div>
                  <div className="col-span-4 md:col-span-3">Amount</div>
                  <div className="hidden md:block col-span-3">Date</div>
                  <div className="col-span-4 md:col-span-3 text-right">Status</div>
                </div>
                
                <div className="overflow-y-auto custom-scrollbar flex-1 pt-2">
                  <AnimatePresence>
                    {transactions.map((tx, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={tx.id}
                        className="grid grid-cols-12 gap-4 items-center py-4 px-4 border-b border-white/5 hover:bg-white/5 transition-colors group"
                      >
                        <div className="col-span-4 md:col-span-3 flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'Deposit' ? 'bg-green-500/10 text-green-400' : 'bg-gray-800 text-gray-300 group-hover:bg-cyan-500/10 group-hover:text-cyan-400'} transition-colors`}>
                            {tx.type === 'Deposit' ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
                          </div>
                          <span className="font-semibold text-sm">{tx.type}</span>
                        </div>
                        <div className="col-span-4 md:col-span-3 font-mono text-sm">
                          {tx.amount} <span className="text-gray-500">{tx.currency}</span>
                        </div>
                        <div className="hidden md:block col-span-3 text-xs text-gray-400">
                          {tx.date}
                        </div>
                        <div className="col-span-4 md:col-span-3 text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${tx.status === 'Completed' ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-red-500/30 text-red-400 bg-red-500/10'}`}>
                            {tx.status}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <WalletConnectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} suggestedAddress={suggestedAddress} />
    </div>
  );
};

export default Wallet;
