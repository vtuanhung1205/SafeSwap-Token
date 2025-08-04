const express = require('express');
const router = express.Router();

const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const logger = require('../utils/logger');

// Get user statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await User.getUserStats(req.user.id);
    
    res.json({
      success: true,
      data: stats[0] || {}
    });
  } catch (error) {
    logger.error('Error getting user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user statistics'
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

// Update user preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { preferences } = req.body;
    const user = await User.findById(req.user.id);
    
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
      await user.save();
    }
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });
  } catch (error) {
    logger.error('Error updating user preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update preferences'
    });
  }
});

// Get user risk profile
router.get('/risk-profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('riskProfile');
    
    res.json({
      success: true,
      data: user.riskProfile
    });
  } catch (error) {
    logger.error('Error getting risk profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get risk profile'
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