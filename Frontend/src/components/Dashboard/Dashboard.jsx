import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI, handleApiError } from '../../utils/api';
import toast from 'react-hot-toast';
// Removed wallet adapter - using Aptos SDK instead
import { AptosClient } from 'aptos';
import { Wallet, ArrowUpDown, RefreshCw, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import WalletConnect from '../WalletConnect';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

import TokenList from '../TokenList';

import SwapForm from '../SwapForm';
import './Dashboard.css';

// --- Helper Components for a cleaner structure ---

// Icon for the "From -> To" column
const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

// A single statistic card
const StatCard = ({ icon, title, value }) => (
  <div className="bg-[#18181c] border border-[#23232a] rounded-2xl p-6 flex items-center gap-5 transition-all duration-300 hover:border-cyan-500/50 hover:scale-105">
    <div className="bg-gray-800 p-4 rounded-full text-2xl">
      {icon}
    </div>
    <div>
      <p className="text-gray-400 text-sm">{title}</p>
      <h3 className="text-2xl md:text-3xl font-bold text-white">{value}</h3>
    </div>
  </div>
);

// Token balance card component
const TokenBalanceCard = ({ symbol, name, balance, icon, usdValue }) => (
  <div className="bg-[#18181c] border border-[#23232a] rounded-xl p-4 flex items-center justify-between hover:border-cyan-500/30 transition-all duration-200">
    <div className="flex items-center gap-3">
      <img src={icon} alt={symbol} className="w-10 h-10 rounded-full" />
      <div>
        <h4 className="font-semibold text-white">{symbol}</h4>
        <p className="text-xs text-gray-400">{name}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="font-mono text-white font-semibold">{formatTokenBalance(balance, symbol)}</p>
      {usdValue && <p className="text-xs text-gray-400">{formatCurrency(usdValue)}</p>}
    </div>
  </div>
);

// Format token balance based on token type
const formatTokenBalance = (balance, symbol) => {
  if (balance === null || balance === undefined) return "0";
  
  // Use different precision based on token type
  let precision = 4;
  if (symbol === "BTC") precision = 8;
  else if (symbol === "ETH" || symbol === "APT") precision = 6;
  else if (symbol === "USDC" || symbol === "USDT") precision = 2;
  
  return parseFloat(balance).toFixed(precision);
};

// --- Main Dashboard Component ---

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { account } = useWallet();
  const [swapHistory, setSwapHistory] = useState([]);
  const [stats, setStats] = useState({ totalSwaps: 0, totalVolume: 0, successRate: 0, avgAmount: 0 });
  const [tokenBalances, setTokenBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [dataErrors, setDataErrors] = useState({}); // Track errors for each data type
  const [activeTab, setActiveTab] = useState('overview');

  // Token metadata for UI display
  const tokenMetadata = {
    APT: {
      name: "Aptos",
      icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/21794.png",
      decimals: 8
    },
    BTC: {
      name: "Bitcoin",
      icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/800px-Bitcoin.svg.png",
      decimals: 8
    },
    ETH: {
      name: "Ethereum",
      icon: "https://static1.tokenterminal.com//ethereum/logo.png?logo_hash=fd8f54cab23f8f4980041f4e74607cac0c7ab880",
      decimals: 18
    },
    USDC: {
      name: "USD Coin",
      icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/3408.png",
      decimals: 6
    },
    USDT: {
      name: "Tether",
      icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/825.png",
      decimals: 6
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setDataErrors({}); // Reset errors
      
      // Fetch data with individual error handling
      const promises = [
        fetchSwapHistory(),
        fetchUserStats(),
        fetchWalletBalances()
      ];

      await Promise.allSettled(promises);
    } catch (err) {
      console.error('Error in dashboard data fetch:', err);
      // Don't set global error, let individual sections handle their own errors
    } finally {
      setLoading(false);
    }
  };

  const fetchSwapHistory = async () => {
    try {
      const response = await userAPI.getSwapHistory();
      if (response.data.success) {
        setSwapHistory(response.data.data?.swaps || []);
      } else {
        setDataErrors(prev => ({ ...prev, swapHistory: 'Failed to load swap history' }));
      }
    } catch (err) {
      console.error('Error fetching swap history:', err);
      setDataErrors(prev => ({ ...prev, swapHistory: 'No swap history available' }));
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await userAPI.getUserStats();
      if (response.data.success) {
        setStats(response.data.data || { 
          totalSwaps: 0, 
          totalVolume: 0, 
          successRate: 0, 
          avgAmount: 0 
        });
      } else {
        setDataErrors(prev => ({ ...prev, stats: 'Failed to load statistics' }));
      }
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setDataErrors(prev => ({ ...prev, stats: 'Statistics unavailable' }));
    }
  };

  const fetchWalletBalances = async () => {
    if (!isAuthenticated || !account?.address) return;
    
    try {
      setLoadingBalances(true);
      const client = new AptosClient("https://fullnode.mainnet.aptoslabs.com/v1");
      
      // Fetch APT balance
      let aptBalance = 0;
      try {
        const resource = await client.getAccountResource({
          address: account.address,
          resourceType: "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>",
        });
        aptBalance = Number(resource.data.coin.value) / 1e8;
      } catch (e) {
        console.log('No APT balance found or account not initialized');
        aptBalance = 0;
      }
      
      // Set token balances
      setTokenBalances({
        APT: {
          symbol: "APT",
          name: "Aptos",
          balance: aptBalance,
          icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/21794.png",
          decimals: 8
        }
      });
    } catch (err) {
      console.error('Error fetching wallet balances:', err);
      setDataErrors(prev => ({ ...prev, balances: 'Unable to load wallet balances' }));
    } finally {
      setLoadingBalances(false);
    }
  };

  // --- Formatting and Style Helpers ---

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const getStatusClasses = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-500/10 text-green-400';
      case 'pending': return 'bg-yellow-500/10 text-yellow-400';
      case 'failed': return 'bg-red-500/10 text-red-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getRiskColor = (risk) => {
    if (risk > 70) return 'bg-red-500';
    if (risk > 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // --- Render Logic ---

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-8">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
        <p className="text-gray-400 mb-6">Please sign in to view your dashboard.</p>
        <button 
          onClick={() => document.querySelector('button')?.click()}
          className="px-6 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Show loading only for initial load, not for individual section refreshes
  if (loading && !swapHistory.length && Object.keys(tokenBalances).length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="animate-spin w-8 h-8 mx-auto mb-4 text-cyan-400" />
          <p className="text-gray-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 text-white">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.profile?.displayName || 'Guest'}</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0 bg-[#18181c] border border-[#23232a] p-3 rounded-2xl">
          <img src={user?.profile.avatar || `https://i.pravatar.cc/150?u=${user?.email || 'guest'}`} alt="User" className="w-12 h-12 rounded-full" />
          <div>
            <h3 className="font-semibold">{user?.profile?.displayName || 'Anonymous User'}</h3>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-[#23232a]">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
            activeTab === 'overview'
              ? 'bg-cyan-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-[#23232a]'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('swap')}
          className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
            activeTab === 'swap'
              ? 'bg-cyan-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-[#23232a]'
          }`}
        >
          Swap
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
            activeTab === 'history'
              ? 'bg-cyan-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-[#23232a]'
          }`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('tokens')}
          className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
            activeTab === 'tokens'
              ? 'bg-cyan-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-[#23232a]'
          }`}
        >
          Tokens
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-6 py-3 font-semibold rounded-t-lg transition-colors ${
            activeTab === 'favorites'
              ? 'bg-cyan-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-[#23232a]'
          }`}
        >
          Favorites
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard 
              icon="🔄" 
              title="Total Swaps" 
              value={dataErrors.stats ? 'N/A' : stats.totalSwaps} 
            />
            <StatCard 
              icon="💰" 
              title="Total Volume" 
              value={dataErrors.stats ? 'N/A' : formatCurrency(stats.totalVolume)} 
            />
            <StatCard 
              icon="📊" 
              title="Success Rate" 
              value={dataErrors.stats ? 'N/A' : `${stats.successRate?.toFixed(1) || 0}%`} 
            />
            <StatCard 
              icon="📈" 
              title="Avg. Amount" 
              value={dataErrors.stats ? 'N/A' : formatCurrency(stats.avgAmount || 0)} 
            />
          </div>

          {/* Error notification for stats */}
          {dataErrors.stats && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="text-yellow-400" size={20} />
              <div>
                <p className="text-yellow-400 font-medium">Statistics Unavailable</p>
                <p className="text-yellow-400/70 text-sm">Some statistics could not be loaded. This doesn't affect your ability to use the dashboard.</p>
              </div>
            </div>
          )}

          {/* Wallet Overview Section */}
          <div className="bg-[#18181c] border border-[#23232a] rounded-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[#23232a]">
              <h2 className="text-2xl font-bold">Wallet Overview</h2>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600/20 text-cyan-400 font-semibold rounded-lg hover:bg-cyan-600/40 transition-colors"
                onClick={fetchWalletBalances}
                disabled={loadingBalances}
              >
                {loadingBalances ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    <span>Refresh</span>
                  </>
                )}
              </button>
            </div>

            {!isAuthenticated ? (
              <div className="text-center py-16">
                <div className="inline-block p-4 rounded-full bg-cyan-500/10 mb-4">
                  <Wallet size={40} className="text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold">No Wallet Connected</h3>
                <p className="text-gray-400 mb-4">Connect your wallet to view your balances</p>
                <WalletConnect />
              </div>
            ) : dataErrors.balances ? (
              <div className="text-center py-16">
                <div className="inline-block p-4 rounded-full bg-yellow-500/10 mb-4">
                  <AlertTriangle size={40} className="text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold">Unable to Load Balances</h3>
                <p className="text-gray-400 mb-4">There was an issue loading your wallet balances. You can still use other dashboard features.</p>
                <button 
                  onClick={fetchWalletBalances}
                  className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : Object.keys(tokenBalances).length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-block p-4 rounded-full bg-gray-500/10 mb-4">
                  <Wallet size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold">No Balances Found</h3>
                <p className="text-gray-400 mb-4">Your wallet balances will appear here once you have tokens</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {Object.entries(tokenBalances).map(([symbol, data]) => (
                    <TokenBalanceCard 
                      key={symbol}
                      symbol={symbol}
                      name={tokenMetadata[symbol]?.name || symbol}
                      balance={data.balance}
                      icon={tokenMetadata[symbol]?.icon || `https://via.placeholder.com/40x40?text=${symbol}`}
                      usdValue={data.usdValue}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity Section */}
          <div className="bg-[#18181c] border border-[#23232a] rounded-2xl">
            <div className="p-6 border-b border-[#23232a]">
              <h2 className="text-2xl font-bold">Recent Activity</h2>
            </div>
            
            {dataErrors.swapHistory ? (
              <div className="text-center py-16">
                <div className="inline-block p-4 rounded-full bg-yellow-500/10 mb-4">
                  <AlertTriangle size={40} className="text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold">Activity History Unavailable</h3>
                <p className="text-gray-400 mb-4">Unable to load recent activity. This doesn't affect your ability to perform new transactions.</p>
              </div>
            ) : swapHistory.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-block p-4 rounded-full bg-gray-500/10 mb-4">
                  <ArrowUpDown size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold">No Recent Activity</h3>
                <p className="text-gray-400 mb-4">Your transaction history will appear here</p>
              </div>
            ) : (
              <div className="p-6">
                <div className="space-y-4">
                  {swapHistory.slice(0, 5).map((swap, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-[#23232a] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getStatusClasses(swap.status)}`}>
                          {swap.status === 'completed' ? <CheckCircle size={16} /> : <Loader2 size={16} className="animate-spin" />}
                        </div>
                        <div>
                          <p className="font-semibold">{swap.fromToken} → {swap.toToken}</p>
                          <p className="text-sm text-gray-400">{formatDate(swap.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(swap.amount)}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusClasses(swap.status)}`}>
                          {swap.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'swap' && (
        <div className="bg-[#18181c] border border-[#23232a] rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Token Swap</h2>
          <SwapForm />
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-[#18181c] border border-[#23232a] rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Transaction History</h2>
          <p className="text-gray-400">Transaction history component temporarily unavailable.</p>
        </div>
      )}

      {activeTab === 'tokens' && (
        <div className="bg-[#18181c] border border-[#23232a] rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Aptos Token List</h2>
          <TokenList />
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="bg-[#18181c] border border-[#23232a] rounded-2xl p-6">
          <h2 className="text-2xl font-bold mb-6">Favorite Tokens</h2>
          <p className="text-gray-400">Favorite tokens component temporarily unavailable.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;