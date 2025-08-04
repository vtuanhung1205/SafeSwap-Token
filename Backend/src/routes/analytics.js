const express = require('express');
const router = express.Router();

const Transaction = require('../models/Transaction');
const User = require('../models/User');
const aptosService = require('../services/aptosService');
const { auth, adminAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

// Get user analytics overview
router.get('/overview', auth, async (req, res) => {
  try {
    const { timeRange = '30d' } = req.query;
    const userId = req.user.id;
    
    const now = new Date();
    let startDate;
    
    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    
    // Get transaction statistics
    const transactions = await Transaction.find({
      userId,
      timestamp: { $gte: startDate }
    });
    
    const analytics = {
      totalTransactions: transactions.length,
      totalVolume: transactions.reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0),
      byStatus: {},
      byType: {},
      byToken: {},
      riskAnalysis: {
        highRisk: 0,
        mediumRisk: 0,
        lowRisk: 0,
        scamDetected: 0
      },
      timeSeries: [],
      topTokens: [],
      topRecipients: []
    };
    
    // Process transactions
    transactions.forEach(tx => {
      // Count by status
      analytics.byStatus[tx.status] = (analytics.byStatus[tx.status] || 0) + 1;
      
      // Count by type
      analytics.byType[tx.type] = (analytics.byType[tx.type] || 0) + 1;
      
      // Count by token
      analytics.byToken[tx.tokenSymbol] = (analytics.byToken[tx.tokenSymbol] || 0) + 1;
      
      // Risk analysis
      if (tx.riskScore >= 70) analytics.riskAnalysis.highRisk++;
      else if (tx.riskScore >= 30) analytics.riskAnalysis.mediumRisk++;
      else analytics.riskAnalysis.lowRisk++;
      
      if (tx.aiAnalysis?.isScam) analytics.riskAnalysis.scamDetected++;
    });
    
    // Generate time series data
    const timeSeriesData = {};
    transactions.forEach(tx => {
      const date = tx.timestamp.toISOString().split('T')[0];
      if (!timeSeriesData[date]) {
        timeSeriesData[date] = {
          date,
          count: 0,
          volume: 0
        };
      }
      timeSeriesData[date].count++;
      timeSeriesData[date].volume += parseFloat(tx.amount || 0);
    });
    
    analytics.timeSeries = Object.values(timeSeriesData).sort((a, b) => a.date.localeCompare(b.date));
    
    // Get top tokens by volume
    const tokenVolumes = {};
    transactions.forEach(tx => {
      if (!tokenVolumes[tx.tokenSymbol]) {
        tokenVolumes[tx.tokenSymbol] = {
          symbol: tx.tokenSymbol,
          address: tx.tokenAddress,
          volume: 0,
          count: 0
        };
      }
      tokenVolumes[tx.tokenSymbol].volume += parseFloat(tx.amount || 0);
      tokenVolumes[tx.tokenSymbol].count++;
    });
    
    analytics.topTokens = Object.values(tokenVolumes)
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 10);
    
    // Get top recipients
    const recipientCounts = {};
    transactions.forEach(tx => {
      if (!recipientCounts[tx.toAddress]) {
        recipientCounts[tx.toAddress] = {
          address: tx.toAddress,
          count: 0,
          volume: 0
        };
      }
      recipientCounts[tx.toAddress].count++;
      recipientCounts[tx.toAddress].volume += parseFloat(tx.amount || 0);
    });
    
    analytics.topRecipients = Object.values(recipientCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error getting analytics overview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics overview'
    });
  }
});

// Get transaction trends
router.get('/trends', auth, async (req, res) => {
  try {
    const { period = 'daily', days = 30 } = req.query;
    const userId = req.user.id;
    
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
    
    const transactions = await Transaction.find({
      userId,
      timestamp: { $gte: startDate, $lte: endDate }
    }).sort({ timestamp: 1 });
    
    const trends = {
      volume: [],
      count: [],
      riskScore: []
    };
    
    // Group by period
    const groupedData = {};
    transactions.forEach(tx => {
      let key;
      if (period === 'daily') {
        key = tx.timestamp.toISOString().split('T')[0];
      } else if (period === 'weekly') {
        const weekStart = new Date(tx.timestamp);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else if (period === 'monthly') {
        key = `${tx.timestamp.getFullYear()}-${String(tx.timestamp.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!groupedData[key]) {
        groupedData[key] = {
          period: key,
          volume: 0,
          count: 0,
          riskScores: []
        };
      }
      
      groupedData[key].volume += parseFloat(tx.amount || 0);
      groupedData[key].count++;
      groupedData[key].riskScores.push(tx.riskScore || 0);
    });
    
    // Convert to arrays
    Object.values(groupedData).forEach(group => {
      trends.volume.push({
        period: group.period,
        value: group.volume
      });
      
      trends.count.push({
        period: group.period,
        value: group.count
      });
      
      trends.riskScore.push({
        period: group.period,
        value: group.riskScores.length > 0 ? 
          group.riskScores.reduce((sum, score) => sum + score, 0) / group.riskScores.length : 0
      });
    });
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    logger.error('Error getting transaction trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transaction trends'
    });
  }
});

// Get risk analysis
router.get('/risk-analysis', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const transactions = await Transaction.find({ userId });
    
    const riskAnalysis = {
      overallRiskScore: 0,
      riskFactors: {},
      suspiciousTransactions: [],
      recommendations: []
    };
    
    // Calculate overall risk score
    const totalRiskScore = transactions.reduce((sum, tx) => sum + (tx.riskScore || 0), 0);
    riskAnalysis.overallRiskScore = transactions.length > 0 ? totalRiskScore / transactions.length : 0;
    
    // Analyze risk factors
    const riskFactors = {};
    transactions.forEach(tx => {
      if (tx.aiAnalysis?.riskFactors) {
        tx.aiAnalysis.riskFactors.forEach(factor => {
          riskFactors[factor] = (riskFactors[factor] || 0) + 1;
        });
      }
    });
    
    riskAnalysis.riskFactors = riskFactors;
    
    // Find suspicious transactions
    riskAnalysis.suspiciousTransactions = transactions
      .filter(tx => tx.riskScore > 70 || tx.aiAnalysis?.isScam)
      .map(tx => ({
        hash: tx.hash,
        amount: tx.amount,
        toAddress: tx.toAddress,
        riskScore: tx.riskScore,
        riskFactors: tx.aiAnalysis?.riskFactors || [],
        timestamp: tx.timestamp
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);
    
    // Generate recommendations
    if (riskAnalysis.overallRiskScore > 70) {
      riskAnalysis.recommendations.push('Consider reviewing your transaction patterns');
    }
    
    if (riskAnalysis.suspiciousTransactions.length > 0) {
      riskAnalysis.recommendations.push('Review suspicious transactions flagged by our system');
    }
    
    if (Object.keys(riskFactors).length > 0) {
      riskAnalysis.recommendations.push('Address identified risk factors in your transactions');
    }
    
    res.json({
      success: true,
      data: riskAnalysis
    });
  } catch (error) {
    logger.error('Error getting risk analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get risk analysis'
    });
  }
});

// Get network statistics
router.get('/network-stats', auth, async (req, res) => {
  try {
    const networkStatus = await aptosService.getNetworkStatus();
    
    res.json({
      success: true,
      data: networkStatus
    });
  } catch (error) {
    logger.error('Error getting network stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get network statistics'
    });
  }
});

// Get platform statistics (admin only)
router.get('/platform-stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    
    const platformStats = {
      totalUsers,
      activeUsers,
      totalTransactions,
      averageTransactionsPerUser: totalUsers > 0 ? totalTransactions / totalUsers : 0,
      userGrowth: {
        // This would be calculated based on user registration dates
        last7Days: 0,
        last30Days: 0
      },
      transactionVolume: {
        // This would be calculated based on transaction amounts
        total: 0,
        average: 0
      }
    };
    
    res.json({
      success: true,
      data: platformStats
    });
  } catch (error) {
    logger.error('Error getting platform stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get platform statistics'
    });
  }
});

module.exports = router; 