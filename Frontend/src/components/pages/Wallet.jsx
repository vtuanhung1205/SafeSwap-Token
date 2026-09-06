import React, { useState, useEffect } from "react";
import { Copy, ArrowDownCircle, ArrowUpCircle, Shield, Wallet as WalletIcon, LogOut } from "lucide-react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import WalletConnectModal from "../Wallet/WalletConnectModal";

import { walletAPI } from "../../utils/api";

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

  // Sync wallet adapter state with backend
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
      // Fetch fresh data after connecting
      await fetchWalletData();
    } catch (err) {
      console.error("Backend connection sync failed:", err);
      setError("Failed to sync wallet with backend.");
      disconnect(); // Revert frontend connection if backend fails
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      await walletAPI.disconnect();
      disconnect(); // Disconnect wallet adapter
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
      setSuggestedAddress(infoRes.data.data.wallet.address); // Save as suggested if they disconnect later
      
      try {
        const txRes = await walletAPI.getTransactions(10);
        const rawTxs = txRes.data.data.transactions || [];
        
        // Map Aptos transactions to UI format
        const formattedTxs = rawTxs.map((tx, index) => {
          return {
            id: tx.hash || index,
            type: "Transaction", // Generalized since it's an Aptos tx
            amount: "Gas: " + (tx.gas_used || 0),
            currency: "Units",
            date: new Date(tx.timestamp ? (tx.timestamp / 1000) : Date.now()).toLocaleDateString(),
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
      setTimeout(() => setCopied(false), 1200);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Loading Wallet...
      </div>
    );
  }

  if (error || !walletInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center from-[#18181c] to-[#23232a] text-white">
        <Shield size={64} className="text-gray-600 mb-6" />
        <h2 className="text-2xl font-bold mb-2">No Wallet Connected</h2>
        <p className="text-gray-400 mb-8">{error}</p>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
        >
          <WalletIcon size={20} /> Connect Aptos Wallet
        </button>

        <WalletConnectModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          suggestedAddress={suggestedAddress}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen from-[#18181c] to-[#23232a] text-white px-4 py-12 md:px-12 lg:px-48">
      {/* Hero Card */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="relative bg-gradient-to-br from-cyan-900/60 to-pink-900/40 backdrop-blur-xl rounded-3xl shadow-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-cyan-800/30">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-cyan-600 flex items-center justify-center shadow-lg border-4 border-cyan-400/30">
              <Shield size={36} className="text-white" />
            </div>
            <div>
              <div className="text-gray-300 text-sm mb-1 flex items-center gap-2">
                <span>Wallet Address:</span>
                <span className="font-mono text-cyan-200" title={walletInfo.address}>
                  {walletInfo.address.substring(0, 6)}...{walletInfo.address.slice(-4)}
                </span>
                <button
                  onClick={handleCopy}
                  className="ml-1 p-1 rounded hover:bg-cyan-800/30 transition"
                  title="Copy address"
                >
                  <Copy size={16} className="text-cyan-400" />
                </button>
                {copied && (
                  <span className="ml-2 text-green-400 text-xs">Copied!</span>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  {parseFloat(walletInfo.balance || 0).toLocaleString()}{" "}
                  <span className="text-cyan-400">APT</span>
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-3 py-1 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-xs rounded-lg transition"
                >
                  Change Wallet
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1 bg-red-900/30 hover:bg-red-900/50 border border-red-800/50 text-red-400 text-xs rounded-lg transition flex items-center gap-1"
                >
                  <LogOut size={12} /> Disconnect
                </button>
              </div>
              <div className="text-gray-400 text-xs mt-1">
                Available Balance
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
            <button className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-xl font-semibold shadow transition">
              Deposit
            </button>
            <button className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-2 rounded-xl font-semibold shadow transition">
              Withdraw
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="max-w-3xl mx-auto bg-[#18181c] rounded-2xl shadow-lg p-8 mb-10">
        <h2 className="text-2xl font-bold mb-6 text-cyan-400 text-center">
          Transaction History
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-gray-300">
            <thead>
              <tr className="border-b border-[#23232a]">
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Amount</th>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-8 text-center text-gray-500">
                    No transactions found for this wallet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#23232a]/60 transition rounded-lg"
                  >
                    <td className="py-2 px-3 flex items-center gap-2">
                      {tx.type === "Deposit" ? (
                        <ArrowDownCircle className="text-green-400" size={18} />
                      ) : (
                        <ArrowUpCircle className="text-gray-400" size={18} />
                      )}
                      <span
                        className={
                          tx.type === "Deposit"
                            ? "text-green-400 font-semibold"
                            : "text-gray-300 font-semibold"
                        }
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sm">
                      {tx.amount} {tx.currency}
                    </td>
                    <td className="py-2 px-3 text-sm">{tx.date}</td>
                    <td className="py-2 px-3">
                      <span className={`${tx.status === 'Completed' ? 'bg-cyan-900/40 text-cyan-300' : 'bg-red-900/40 text-red-300'} px-3 py-1 rounded-full text-xs font-semibold`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Notice */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="flex items-center gap-3 bg-yellow-900/40 text-yellow-300 p-4 rounded-lg text-sm shadow">
          <Shield size={18} className="text-yellow-300" />
          <span>
            <strong>Security Notice:</strong> Never share your wallet private
            key or recovery phrase with anyone.
          </span>
        </div>
      </div>

      <WalletConnectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        suggestedAddress={suggestedAddress}
      />
    </div>
  );
};

export default Wallet;
