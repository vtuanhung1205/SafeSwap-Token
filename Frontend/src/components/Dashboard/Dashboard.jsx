import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Wallet,
  BarChart3,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Animation variants for stagger effects
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
};

const currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const Dashboard = () => {
  const { user } = useAuth();
  const [swapHistory, setSwapHistory] = useState([]);
  const [stats, setStats] = useState({ totalSwaps: 0, totalVolume: 0, successRate: 0, avgAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [historyRes, statsRes] = await Promise.all([
        api.get('/swap/history'),
        api.get('/swap/stats')
      ]);

      const history = historyRes.data.data.transactions;
      setSwapHistory(history || []);

      const s = statsRes.data.data.stats || {};
      const finalStats = {
        totalSwaps: s.totalTransactions || 0,
        totalVolume: s.totalVolume || 0,
        successRate: s.totalTransactions ? (s.completedTransactions / s.totalTransactions) * 100 : 0,
        avgAmount: s.avgTransactionSize || 0
      };
      setStats(finalStats);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => currencyFormatter.format(amount);
  
  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'failed': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-cyan-400 space-y-4">
        <RefreshCw className="w-10 h-10 animate-spin" />
        <span className="font-heading tracking-widest text-sm uppercase">Initializing Workspace...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="glass-panel p-8 text-center border-red-500/30 bg-red-900/10 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-red-400 mb-2">Connection Error</h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 text-white max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Command Center
          </h1>
          <p className="text-gray-400 mt-2 font-medium">Welcome back, {user?.name || 'Commander'}</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="p-3 bg-cyan-900/30 border border-cyan-500/30 rounded-xl hover:bg-cyan-800/40 hover:border-cyan-400 transition-all group"
          title="Refresh Data"
        >
          <RefreshCw className="w-5 h-5 text-cyan-400 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        {/* Profile Widget (Bento 1) */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-4 glass-panel p-6 rounded-3xl flex flex-col justify-between glowing-border group">
          <div className="flex items-start justify-between mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600 to-pink-600 p-0.5">
              <div className="w-full h-full bg-[#111112] rounded-2xl overflow-hidden flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                ) : (
                  <User size={32} className="text-gray-400" />
                )}
              </div>
            </div>
            <Link to="/settings" className="text-xs bg-[#23232a] text-gray-400 px-3 py-1.5 rounded-full hover:bg-cyan-900/50 hover:text-cyan-400 transition-colors">
              Edit Profile
            </Link>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">{user?.name || 'Anonymous User'}</h3>
            <p className="text-sm text-gray-400 font-mono mb-4">{user?.email}</p>
            <div className="flex items-center gap-2 text-xs bg-green-500/10 text-green-400 px-3 py-1.5 rounded-lg border border-green-500/20 w-max">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Account Verified
            </div>
          </div>
        </motion.div>

        {/* Portfolio Hero Widget (Bento 2) */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-8 glass-panel p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/20 blur-[80px] rounded-full group-hover:bg-cyan-400/30 transition-colors duration-700"></div>
          
          <div className="flex items-center gap-3 text-cyan-400 mb-2">
            <Wallet className="w-5 h-5" />
            <h2 className="font-semibold uppercase tracking-wider text-sm">Total Trading Volume</h2>
          </div>
          <div className="text-5xl md:text-7xl font-heading font-black text-white mb-6">
            {formatCurrency(stats.totalVolume)}
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Link to="/swap" className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all">
              New Swap
            </Link>
            <Link to="/wallet" className="px-6 py-3 bg-[#23232a] hover:bg-[#2a2a35] text-white font-bold rounded-xl transition-all">
              View Wallet
            </Link>
          </div>
        </motion.div>

        {/* 4 Small Stat Widgets (Bento 3-6) */}
        {[
          { title: "Total Swaps", value: stats.totalSwaps, icon: Activity, color: "from-pink-500 to-purple-500" },
          { title: "Success Rate", value: `${stats.successRate.toFixed(1)}%`, icon: CheckCircle, color: "from-green-400 to-emerald-600" },
          { title: "Avg. Size", value: formatCurrency(stats.avgAmount), icon: BarChart3, color: "from-cyan-400 to-blue-500" },
          { title: "Threats Blocked", value: "0", icon: ShieldAlert, color: "from-yellow-400 to-orange-500" }
        ].map((stat, i) => (
          <motion.div key={i} variants={itemVariants} className="col-span-1 md:col-span-3 glass-panel p-6 rounded-3xl relative overflow-hidden group hover:border-white/20 transition-colors">
            <div className={`absolute -right-10 -bottom-10 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`}></div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-[#23232a] rounded-xl border border-white/5">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-400 text-sm font-medium mb-1">{stat.title}</p>
            <h3 className="text-3xl font-heading font-bold text-white">{stat.value}</h3>
          </motion.div>
        ))}

        {/* Activity Feed Widget (Bento 7) */}
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-12 glass-panel p-1 rounded-3xl">
          <div className="bg-[#111112]/50 backdrop-blur-md w-full h-full rounded-[23px] p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" /> Recent Activity
              </h2>
              <Link to="/wallet" className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">View All &rarr;</Link>
            </div>

            {swapHistory.length === 0 ? (
              <div className="text-center py-16 bg-[#18181c]/50 rounded-2xl border border-dashed border-[#23232a]">
                <div className="w-16 h-16 bg-[#23232a] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Activity className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No Swaps Yet</h3>
                <p className="text-gray-400 text-sm">Your decentralized journey begins with your first swap.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {swapHistory.map((swap, index) => (
                  <div key={swap._id || index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#18181c]/80 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-colors group">
                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                      <div className="w-12 h-12 rounded-full bg-[#23232a] flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 font-bold text-lg">
                          <span>{swap.fromAmount} {swap.fromToken}</span>
                          <ArrowRight className="w-4 h-4 text-gray-500" />
                          <span className="text-cyan-400">{swap.toAmount} {swap.toToken}</span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono">
                          {timeAgo(swap.createdAt)} &bull; {formatCurrency(swap.usdValue || 0)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">Risk:</span>
                        <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${swap.scamRisk > 40 ? 'bg-red-500' : 'bg-green-500'}`} 
                            style={{ width: `${swap.scamRisk || 0}%` }} 
                          />
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(swap.status)}`}>
                        {swap.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Dashboard;