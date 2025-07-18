import React, { useState, useEffect } from "react";
import { Copy, ArrowDownCircle, ArrowUpCircle, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { walletAPI, handleApiError } from "../../utils/api";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import toast from "react-hot-toast";

const Wallet = () => {
  const { user } = useAuth();
  const { connected, account } = useWallet();
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [walletInfo, setWalletInfo] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (connected && account) {
      fetchWalletData();
    } else {
      setLoading(false);
    }
  }, [connected, account]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [walletInfoResponse, transactionsResponse] = await Promise.all([
        walletAPI.getInfo(),
        walletAPI.getTransactions(),
      ]);

      if (walletInfoResponse.data.success) {
        setWalletInfo(walletInfoResponse.data.data.wallet);
      }
      
      if (transactionsResponse.data.success) {
        setTransactions(transactionsResponse.data.data.transactions || []);
      }
    } catch (err) {
      console.error("Error fetching wallet data:", err);
      setError(handleApiError(err));
      toast.error("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
      toast.success("Address copied to clipboard");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Loading Wallet...
      </div>
    );
  }

  if (!connected || !account) {
    return (
      <div className="min-h-screen from-[#18181c] to-[#23232a] text-white px-4 py-12 md:px-12 lg:px-48">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-cyan-600/20 flex items-center justify-center mb-6">
            <Shield size={36} className="text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to view your balance and transaction history.
          </p>
          <button 
            onClick={() => document.querySelector('.connect-wallet-btn')?.click()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold shadow transition"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  const walletAddress = account?.address || "";
  const formattedAddress = walletAddress ? 
    `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 
    "Unknown";
  
  const balance = walletInfo?.balance || 0;

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
                <span className="font-mono text-cyan-200">{formattedAddress}</span>
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
              <div className="text-3xl md:text-4xl font-bold text-white">
                {balance.toLocaleString()}{" "}
                <span className="text-cyan-400">APT</span>
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
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              No transaction history available
            </div>
          ) : (
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
                {transactions.map((tx) => (
                  <tr
                    key={tx.id || tx.hash}
                    className="hover:bg-[#23232a]/60 transition rounded-lg"
                  >
                    <td className="py-2 px-3 flex items-center gap-2">
                      {tx.type === "Deposit" ? (
                        <ArrowDownCircle className="text-green-400" size={18} />
                      ) : (
                        <ArrowUpCircle className="text-pink-400" size={18} />
                      )}
                      <span
                        className={
                          tx.type === "Deposit"
                            ? "text-green-400 font-semibold"
                            : "text-pink-400 font-semibold"
                        }
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {tx.type === "Deposit" ? "+" : "-"}
                      {tx.amount} {tx.currency || "APT"}
                    </td>
                    <td className="py-2 px-3">{new Date(tx.timestamp || tx.date).toLocaleDateString()}</td>
                    <td className="py-2 px-3">
                      <span className="bg-cyan-900/40 text-cyan-300 px-3 py-1 rounded-full text-xs font-semibold">
                        {tx.status || "Completed"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
    </div>
  );
};

export default Wallet;
