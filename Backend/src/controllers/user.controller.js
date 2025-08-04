const userService = require('../services/user.service');
const { logger } = require('../utils/logger');

/**
 * User Controller - Quản lý user sessions và wallet connections
 * Tối ưu cho wallet-based authentication
 */
class UserController {
  /**
   * Connect wallet và tạo session
   * @route POST /api/user/connect
   */
  async connectWallet(req, res) {
    try {
      const { walletAddress, walletType = 'aptos' } = req.body;
      
      if (!walletAddress) {
        return res.status(400).json({
          success: false,
          message: 'Wallet address is required'
        });
      }

      // Validate wallet address format
      if (!/^0x[a-fA-F0-9]{64}$/.test(walletAddress)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid wallet address format'
        });
      }

      // Tạo session cho wallet
      const sessionData = await userService.createSession(walletAddress, walletType, {
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
      });

      logger.info(`Wallet connected: ${walletAddress}`);

      res.status(200).json({
        success: true,
        message: 'Wallet connected successfully',
        data: {
          sessionId: sessionData.sessionId,
          walletAddress: sessionData.walletAddress,
          walletType: sessionData.walletType,
          expiresAt: sessionData.expiresAt
        }
      });
    } catch (error) {
      logger.error('Error connecting wallet:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to connect wallet',
        error: error.message
      });
    }
  }

  /**
   * Disconnect wallet và xóa session
   * @route POST /api/user/disconnect
   */
  async disconnectWallet(req, res) {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
      }

      const success = await userService.disconnectSession(sessionId);
      
      if (success) {
        logger.info(`Wallet disconnected: ${req.user?.walletAddress || 'unknown'}`);
        res.status(200).json({
          success: true,
          message: 'Wallet disconnected successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }
    } catch (error) {
      logger.error('Error disconnecting wallet:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to disconnect wallet',
        error: error.message
      });
    }
  }

  /**
   * Lấy thông tin user hiện tại
   * @route GET /api/user/me
   */
  async getCurrentUser(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authenticated'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          walletAddress: req.user.walletAddress,
          walletType: req.user.walletType,
          sessionId: req.user.sessionId,
          lastActivity: req.user.lastActivity
        }
      });
    } catch (error) {
      logger.error('Error getting current user:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get user info',
        error: error.message
      });
    }
    }

  /**
   * Validate session
   * @route POST /api/user/validate
   */
  async validateSession(req, res) {
    try {
      const { sessionId } = req.body;
      
      if (!sessionId) {
        return res.status(400).json({
          success: false,
          message: 'Session ID is required'
        });
      }

      const user = await userService.validateSession(sessionId);
      
      if (user) {
        res.status(200).json({
          success: true,
          message: 'Session is valid',
          data: {
            walletAddress: user.walletAddress,
            walletType: user.walletType,
            sessionId: user.sessionId,
            lastActivity: user.lastActivity
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired session'
        });
      }
    } catch (error) {
      logger.error('Error validating session:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to validate session',
        error: error.message
      });
    }
  }

  /**
   * Lấy thống kê sessions
   * @route GET /api/user/stats
   */
  async getSessionStats(req, res) {
    try {
      const stats = await userService.getSessionStats();
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error getting session stats:', error.message);
      res.status(500).json({
        success: false,
        message: 'Failed to get session stats',
        error: error.message
      });
    }
  }

  /**
   * Health check cho user service
   * @route GET /api/user/health
   */
  async healthCheck(req, res) {
    try {
      const health = await userService.healthCheck();
      
      res.status(200).json({
        success: true,
        data: health
      });
    } catch (error) {
      logger.error('Error in user health check:', error.message);
      res.status(500).json({
        success: false,
        message: 'Health check failed',
        error: error.message
      });
    }
  }
}

module.exports = new UserController(); 