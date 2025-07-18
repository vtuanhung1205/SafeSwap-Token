import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { swapAPI, handleApiError } from '../../utils/api';
import toast from 'react-hot-toast';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

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

// --- Main Dashboard Component ---

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { connected } = useWallet();
  const [swapHistory, setSwapHistory] = useState([]);
  const [stats, setStats] = useState({ totalSwaps: 0, totalVolume: 0, successRate: 0, avgAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, connected]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use Promise.all to fetch data in parallel
      const [historyResponse, statsResponse] = await Promise.all([
        swapAPI.getHistory(),
        swapAPI.getStats()
      ]);

      if (historyResponse.data.success) {
        setSwapHistory(historyResponse.data.data?.swaps || []);
      } else {
        toast.error('Failed to load swap history');
      }

      if (statsResponse.data.success) {
        setStats(statsResponse.data.data || { 
          totalSwaps: 0, 
          totalVolume: 0, 
          successRate: 0, 
          avgAmount: 0 
        });
      } else {
        toast.error('Failed to load swap statistics');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(handleApiError(err) || 'Failed to load dashboard data. Please try again later.');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-gray-400">Loading Dashboard...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-red-400 bg-red-500/10 rounded-lg p-8">
        <div className="text-3xl mb-4">❌</div>
        <h3 className="text-xl font-bold mb-2">Error Loading Dashboard</h3>
        <p className="text-center mb-4">{error}</p>
        <button 
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 text-white">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, {user?.name || 'Guest'}</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0 bg-[#18181c] border border-[#23232a] p-3 rounded-2xl">
          <img src={user?.avatar || `https://i.pravatar.cc/150?u=${user?.email || 'guest'}`} alt="User" className="w-12 h-12 rounded-full" />
          <div>
            <h3 className="font-semibold">{user?.name || 'Anonymous User'}</h3>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        <StatCard icon="🔄" title="Total Swaps" value={stats.totalSwaps} />
        <StatCard icon="💰" title="Total Volume" value={formatCurrency(stats.totalVolume)} />
        <StatCard icon="📊" title="Success Rate" value={`${stats.successRate?.toFixed(1) || 0}%`} />
        <StatCard icon="📈" title="Avg. Amount" value={formatCurrency(stats.avgAmount || 0)} />
      </div>

      {/* Swap History Section */}
      <div className="bg-[#18181c] border border-[#23232a] rounded-2xl">
        <div className="flex justify-between items-center p-6 border-b border-[#23232a]">
          <h2 className="text-2xl font-bold">Swap History</h2>
          <button 
            className="px-4 py-2 bg-cyan-600/20 text-cyan-400 font-semibold rounded-lg hover:bg-cyan-600/40 transition-colors"
            onClick={fetchDashboardData}
            disabled={loading}
          >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
        </div>

        {swapHistory.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-semibold">No Swap History</h3>
            <p className="text-gray-400">Your transactions will appear here once you start swapping.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-[#23232a]">
                <tr>
                  <th className="p-4 text-sm font-semibold text-gray-400">Date</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Transaction</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Value</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Status</th>
                  <th className="p-4 text-sm font-semibold text-gray-400">Scam Risk</th>
                </tr>
              </thead>
              <tbody>
                {swapHistory.map((swap, index) => (
                  <tr key={swap._id || swap.id || index} className="border-b border-[#23232a] last:border-none hover:bg-gray-800/50 transition-colors">
                    <td className="p-4 text-gray-300">{formatDate(swap.createdAt || swap.timestamp || new Date())}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <span className="font-semibold">{swap.fromAmount} {swap.fromToken}</span>
                        <ArrowRightIcon />
                        <span className="font-semibold">{swap.toAmount} {swap.toToken}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono">{formatCurrency(swap.usdValue || 0)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full capitalize ${getStatusClasses(swap.status)}`}>
                        {swap.status || 'pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-2 bg-gray-700 rounded-full">
                          <div className={`h-2 rounded-full ${getRiskColor(swap.scamRisk || 0)}`} style={{ width: `${swap.scamRisk || 0}%` }} />
                        </div>
                        <span className="text-sm font-semibold">{swap.scamRisk || 0}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;