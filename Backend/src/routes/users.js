const express = require('express');
const router = express.Router();

const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const logger = require('../utils/logger');
const userDataService = require('../services/userDataService');

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await userDataService.getUserStats(req.user.userId);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics'
    });
  }
});

// Get favorite tokens
router.get('/favorite-tokens', auth, async (req, res) => {
  try {
    const favoriteTokens = await userDataService.getFavoriteTokens(req.user.userId);
    
    res.json({
      success: true,
      data: favoriteTokens
    });
  } catch (error) {
    logger.error('Error getting favorite tokens:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get favorite tokens'
    });
  }
});

// Add favorite token
router.post('/favorite-tokens', auth, async (req, res) => {
  try {
    const { address, symbol, name, notes, alertPrice } = req.body;
    
    if (!address || !symbol || !name) {
      return res.status(400).json({
        success: false,
        error: 'Token address, symbol, and name are required'
      });
    }
    
    const favoriteTokens = await userDataService.addFavoriteToken(req.user.userId, {
      address,
      symbol,
      name,
      notes,
      alertPrice
    });
    
    res.json({
      success: true,
      data: favoriteTokens
    });
  } catch (error) {
    logger.error('Error adding favorite token:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add favorite token'
    });
  }
});

// Remove favorite token
router.delete('/favorite-tokens/:address', auth, async (req, res) => {
  try {
    const { address } = req.params;
    const favoriteTokens = await userDataService.removeFavoriteToken(req.user.userId, address);
    
    res.json({
      success: true,
      data: favoriteTokens
    });
  } catch (error) {
    logger.error('Error removing favorite token:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to remove favorite token'
    });
  }
});

// Set price alert
router.post('/price-alerts/:address', auth, async (req, res) => {
  try {
    const { address } = req.params;
    const { alertPrice } = req.body;
    
    if (!alertPrice || isNaN(alertPrice)) {
      return res.status(400).json({
        success: false,
        error: 'Valid alert price is required'
      });
    }
    
    const favoriteToken = await userDataService.setPriceAlert(req.user.userId, address, parseFloat(alertPrice));
    
    res.json({
      success: true,
      data: favoriteToken
    });
  } catch (error) {
    logger.error('Error setting price alert:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to set price alert'
    });
  }
});

// Remove price alert
router.delete('/price-alerts/:address', auth, async (req, res) => {
  try {
    const { address } = req.params;
    const favoriteToken = await userDataService.removePriceAlert(req.user.userId, address);
    
    res.json({
      success: true,
      data: favoriteToken
    });
  } catch (error) {
    logger.error('Error removing price alert:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to remove price alert'
    });
  }
});

// Get user activity
router.get('/activity', auth, async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const activity = await userDataService.getUserActivity(req.user.userId, parseInt(limit));
    
    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    logger.error('Error getting user activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user activity'
    });
  }
});

// Get swap history
router.get('/swap-history', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const swapHistory = await userDataService.getSwapHistory(req.user.userId, parseInt(limit));
    
    res.json({
      success: true,
      data: swapHistory
    });
  } catch (error) {
    logger.error('Error getting swap history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get swap history'
    });
  }
});

// Get user preferences
router.get('/preferences', auth, async (req, res) => {
  try {
    const preferences = await userDataService.getUserPreferences(req.user.userId);
    
    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    logger.error('Error getting user preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user preferences'
    });
  }
});

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { preferences } = req.body;
    const updatedPreferences = await userDataService.updateUserPreferences(req.user.userId, preferences);
    
    res.json({
      success: true,
      data: updatedPreferences
    });
  } catch (error) {
    logger.error('Error updating user preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user preferences'
    });
  }
});

// Get user dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // Get recent transactions (you would implement this based on your needs)
    const recentTransactions = []; // Placeholder
    
    // Get wallet balance (you would implement this based on your needs)
    const walletBalance = {
      apt: '0',
      usd: '0'
    };
    
    const dashboardData = {
      user,
      recentTransactions,
      walletBalance,
      quickStats: {
        totalTransactions: user.stats.totalTransactions,
        totalVolume: user.stats.totalVolume,
        accountAge: user.accountAge
      }
    };
    
    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    logger.error('Error getting dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dashboard data'
    });
  }
});

// Update user risk profile
router.put('/risk-profile', auth, async (req, res) => {
  try {
    const { level, factors } = req.body;
    const user = await User.findById(req.user.id);
    
    if (level) user.riskProfile.level = level;
    if (factors) user.riskProfile.factors = factors;
    
    // Recalculate risk score based on factors
    let riskScore = 50; // Default score
    
    if (factors) {
      factors.forEach(factor => {
        switch (factor) {
          case 'large_transactions':
            riskScore += 20;
            break;
          case 'frequent_transfers':
            riskScore += 15;
            break;
          case 'new_account':
            riskScore += 10;
            break;
          case 'suspicious_activity':
            riskScore += 30;
            break;
        }
      });
    }
    
    user.riskProfile.score = Math.min(riskScore, 100);
    await user.save();
    
    res.json({
      success: true,
      message: 'Risk profile updated successfully',
      data: user.riskProfile
    });
  } catch (error) {
    logger.error('Error updating risk profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update risk profile'
    });
  }
});

// Get user limits
router.get('/limits', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('limits');
    
    res.json({
      success: true,
      data: user.limits
    });
  } catch (error) {
    logger.error('Error getting user limits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user limits'
    });
  }
});

// Update user limits
router.put('/limits', auth, async (req, res) => {
  try {
    const { daily, monthly, single } = req.body;
    const user = await User.findById(req.user.id);
    
    if (daily !== undefined) user.limits.daily = daily;
    if (monthly !== undefined) user.limits.monthly = monthly;
    if (single !== undefined) user.limits.single = single;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Limits updated successfully',
      data: user.limits
    });
  } catch (error) {
    logger.error('Error updating user limits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user limits'
    });
  }
});

// Get user sessions
router.get('/sessions', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('sessions');
    
    res.json({
      success: true,
      data: user.sessions
    });
  } catch (error) {
    logger.error('Error getting user sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user sessions'
    });
  }
});

// Revoke session
router.delete('/sessions/:token', auth, async (req, res) => {
  try {
    const { token } = req.params;
    
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { sessions: { token } }
    });
    
    res.json({
      success: true,
      message: 'Session revoked successfully'
    });
  } catch (error) {
    logger.error('Error revoking session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to revoke session'
    });
  }
});

// Get user API keys
router.get('/api-keys', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('apiKeys');
    
    res.json({
      success: true,
      data: user.apiKeys
    });
  } catch (error) {
    logger.error('Error getting API keys:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get API keys'
    });
  }
});

// Create API key
router.post('/api-keys', auth, async (req, res) => {
  try {
    const { name, permissions } = req.body;
    const user = await User.findById(req.user.id);
    
    const apiKey = {
      name,
      key: `sk_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`,
      permissions: permissions || ['read'],
      createdAt: new Date()
    };
    
    user.apiKeys.push(apiKey);
    await user.save();
    
    res.json({
      success: true,
      message: 'API key created successfully',
      data: apiKey
    });
  } catch (error) {
    logger.error('Error creating API key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create API key'
    });
  }
});

// Delete API key
router.delete('/api-keys/:key', auth, async (req, res) => {
  try {
    const { key } = req.params;
    
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { apiKeys: { key } }
    });
    
    res.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting API key:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete API key'
    });
  }
});

// Get user support tickets
router.get('/support-tickets', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('supportTickets');
    
    res.json({
      success: true,
      data: user.supportTickets
    });
  } catch (error) {
    logger.error('Error getting support tickets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get support tickets'
    });
  }
});

// Create support ticket
router.post('/support-tickets', auth, async (req, res) => {
  try {
    const { subject, priority = 'medium' } = req.body;
    const user = await User.findById(req.user.id);
    
    const ticket = {
      id: `TICKET_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      subject,
      priority,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    user.supportTickets.push(ticket);
    await user.save();
    
    res.json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket
    });
  } catch (error) {
    logger.error('Error creating support ticket:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create support ticket'
    });
  }
});

// Admin routes
// Get all users (admin only)
router.get('/admin/all', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { walletAddress: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error getting all users:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users'
    });
  }
});

// Update user status (admin only)
router.put('/admin/:userId/status', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User status updated successfully',
      data: user
    });
  } catch (error) {
    logger.error('Error updating user status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update user status'
    });
  }
});

// Get user details (admin only)
router.get('/admin/:userId', adminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error('Error getting user details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user details'
    });
  }
});

module.exports = router; 