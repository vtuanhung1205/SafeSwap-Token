import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { mockAPI } from '../../utils/mockData';
import './Dashboard.css';

// Toggle this for demo mode
const DEMO_MODE = true;

const Dashboard = () => {
  const { user } = useAuth();
  const [swapHistory, setSwapHistory] = useState([]);
  const [stats, setStats] = useState({
    totalSwaps: 0,
    totalVolume: 0,
    successRate: 0,
    avgAmount: 0
  });
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
      
      if (DEMO_MODE) {
        // Use mock data for demo
        const [historyRes, statsRes] = await Promise.all([
          mockAPI.getSwapHistory(),
          mockAPI.getSwapStats()
        ]);

        setSwapHistory(historyRes.data.swaps || []);
        setStats(statsRes.data || {
          totalSwaps: 0,
          totalVolume: 0,
          successRate: 0,
          avgAmount: 0
        });
      } else {
        // Use real API
        const [historyRes, statsRes] = await Promise.all([
          api.get('/api/swap/history'),
          api.get('/api/swap/stats')
        ]);

        setSwapHistory(historyRes.data.swaps || []);
        setStats(statsRes.data || {
          totalSwaps: 0,
          totalVolume: 0,
          successRate: 0,
          avgAmount: 0
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'pending':
        return '#ff9800';
      case 'failed':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'pending':
        return '⏳';
      case 'failed':
        return '✗';
      default:
        return '?';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <img src={user?.avatar || '/default-avatar.png'} alt="User" className="user-avatar" />
          <div>
            <h3>{user?.name || 'Anonymous'}</h3>
            <p>{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <div className="stat-content">
            <h3>{stats.totalSwaps}</h3>
            <p>Total Swaps</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalVolume)}</h3>
            <p>Total Volume</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{stats.successRate.toFixed(1)}%</h3>
            <p>Success Rate</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.avgAmount)}</h3>
            <p>Avg Amount</p>
          </div>
        </div>
      </div>

      <div className="swap-history">
        <div className="section-header">
          <h2>Swap History</h2>
          <button className="refresh-btn" onClick={fetchDashboardData}>
            Refresh
          </button>
        </div>

        {swapHistory.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No swap history yet</h3>
            <p>Your swap transactions will appear here</p>
          </div>
        ) : (
          <div className="history-table">
            <div className="table-header">
              <div className="col">Date</div>
              <div className="col">From</div>
              <div className="col">To</div>
              <div className="col">Amount</div>
              <div className="col">Status</div>
              <div className="col">Risk</div>
            </div>

            {swapHistory.map((swap, index) => (
              <div key={swap._id || index} className="table-row">
                <div className="col date">
                  {formatDate(swap.createdAt)}
                </div>
                <div className="col token">
                  <span className="token-symbol">{swap.fromToken}</span>
                  <span className="token-amount">{swap.fromAmount}</span>
                </div>
                <div className="col token">
                  <span className="token-symbol">{swap.toToken}</span>
                  <span className="token-amount">{swap.toAmount}</span>
                </div>
                <div className="col amount">
                  {formatCurrency(swap.usdValue || 0)}
                </div>
                <div className="col status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(swap.status) }}
                  >
                    {getStatusIcon(swap.status)} {swap.status}
                  </span>
                </div>
                <div className="col risk">
                  <div className="risk-meter">
                    <div className="risk-bar">
                      <div 
                        className="risk-fill"
                        style={{ 
                          width: `${swap.scamRisk || 0}%`,
                          backgroundColor: swap.scamRisk > 70 ? '#f44336' : 
                                         swap.scamRisk > 40 ? '#ff9800' : '#4caf50'
                        }}
                      />
                    </div>
                    <span className="risk-text">{swap.scamRisk || 0}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 