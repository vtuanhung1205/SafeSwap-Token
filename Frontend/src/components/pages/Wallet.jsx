import React, { useState, useEffect } from "react";
import { Copy, ArrowDownCircle, ArrowUpCircle, Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { AptosClient } from "aptos";
// Removed wallet adapter - using Aptos SDK instead
import toast from "react-hot-toast";

const APTOS_NODE_URL = "https://fullnode.mainnet.aptoslabs.com/v1";

const Wallet = () => {
  const { user } = useAuth();
  // Removed wallet adapter hooks - using Aptos SDK instead
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWalletData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);
      const client = new AptosClient(APTOS_NODE_URL);
      // Fetch balance
      let balanceValue = 0;
      try {
        const resource = await client.getAccountResource({
          address: account.address,
          resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
        });
        balanceValue = Number(resource.data.coin.value) / 1e8;
      } catch (e) {
        balanceValue = 0;
      }
      setBalance(balanceValue);
      // Fetch transactions
      let txns = [];
      try {
        txns = await client.getAccountTransactions({ address: account.address });
      } catch (e) {
        txns = [];
      }
      setTransactions(txns);
    } catch (err) {
      setError("Failed to load wallet data");
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

  if (!isAuthenticated) {
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

  return (
    <div className="min-h-screen from-[#18181c] to-[#23232a] text-white px-4 py-12 md:px-12 lg:px-48">
      {/* Hero Card */}
      <div className="max-w-3xl mx-auto mb-10">
        <div className="bg-[#1c1c24] rounded-2xl p-8 border border-[#2a2a35] shadow-lg flex flex-col md:flex-row items-center md:items-start md:space-x-8">
          <div className="flex-shrink-0 w-20 h-20 rounded-full bg-cyan-600/20 flex items-center justify-center mb-6 md:mb-0">
            <Shield size={36} className="text-cyan-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg font-bold text-white">Aptos Wallet</span>
              <button onClick={handleCopy} className="ml-2 text-cyan-400 hover:text-cyan-300" title="Copy Address">
                <Copy size={16} />
              </button>
              {copied && <span className="text-xs text-green-400 ml-1">Copied!</span>}
            </div>
            <div className="text-gray-400 text-sm mb-2">{formattedAddress}</div>
            <div className="text-2xl font-bold text-white mb-2">{balance !== null ? `${balance} APT` : 'Loading...'}</div>
          </div>
        </div>
      </div>
      {/* Transaction History */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-bold text-white mb-4">Transaction History</h2>
        {transactions.length === 0 ? (
          <div className="text-gray-400">No transactions found.</div>
        ) : (
          <ul className="divide-y divide-gray-800">
            {transactions.map((txn) => (
              <li key={txn.hash} className="py-4 flex flex-col md:flex-row md:items-center md:space-x-4">
                <span className="font-mono text-xs text-cyan-400">{txn.hash.slice(0, 10)}...{txn.hash.slice(-6)}</span>
                <span className="text-gray-400 text-xs md:ml-2">{txn.type}</span>
                <span className="text-gray-400 text-xs md:ml-2">{new Date(Number(txn.timestamp) / 1000).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Wallet;
