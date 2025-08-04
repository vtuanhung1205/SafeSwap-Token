const { Session } = require('../models');
const crypto = require('crypto');

/**
 * User Service - Quản lý user identification đơn giản qua wallet address
 * Không lưu thông tin user phức tạp, chỉ track session và wallet
 */
class UserService {
  /**
   * Tạo session cho wallet address
   * @param {string} walletAddress - Wallet address của user
   * @param {string} walletType - Loại wallet (aptos, ethereum, etc.)
   * @param {Object} options - Các options khác (userAgent, ipAddress)
   * @returns {Promise<Object>} Session data
   */
  async createSession(walletAddress, walletType = 'aptos', options = {}) {
    try {
      // Tạo sessionId ngẫu nhiên
      const sessionId = crypto.randomBytes(32).toString('hex');
      
      // Tạo session mới
      const session = await Session.createSession({
        sessionId,
        walletAddress,
        walletType,
        userAgent: options.userAgent || null,
        ipAddress: options.ipAddress || null
      });

      return {
        sessionId: session.sessionId,
        walletAddress: session.walletAddress,
        walletType: session.walletType,
        expiresAt: session.expiresAt
      };
    } catch (error) {
      console.error('Error creating session:', error.message);
      throw new Error('Failed to create session');
    }
  }

  /**
   * Validate session và trả về user info
   * @param {string} sessionId - Session ID
   * @returns {Promise<Object|null>} User info hoặc null nếu invalid
   */
  async validateSession(sessionId) {
    try {
      const session = await Session.findBySessionId(sessionId);
      if (!session) return null;

      // Cập nhật last activity
      await session.updateActivity();

      return {
        walletAddress: session.walletAddress,
        walletType: session.walletType,
        sessionId: session.sessionId,
        lastActivity: session.lastActivity
      };
    } catch (error) {
      console.error('Error validating session:', error.message);
      return null;
    }
  }

  /**
   * Lấy user info từ wallet address
   * @param {string} walletAddress - Wallet address
   * @returns {Promise<Object|null>} User info hoặc null
   */
  async getUserByWallet(walletAddress) {
    try {
      const session = await Session.findByWalletAddress(walletAddress);
      if (!session || session.length === 0) return null;

      // Lấy session mới nhất
      const latestSession = session.sort((a, b) => 
        new Date(b.lastActivity) - new Date(a.lastActivity)
      )[0];

      return {
        walletAddress: latestSession.walletAddress,
        walletType: latestSession.walletType,
        sessionId: latestSession.sessionId,
        lastActivity: latestSession.lastActivity
      };
    } catch (error) {
      console.error('Error getting user by wallet:', error.message);
      return null;
    }
  }

  /**
   * Disconnect session (logout)
   * @param {string} sessionId - Session ID
   * @returns {Promise<boolean>} Success status
   */
  async disconnectSession(sessionId) {
    try {
      const result = await Session.deleteOne({ sessionId });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error disconnecting session:', error.message);
      return false;
    }
  }

  /**
   * Disconnect tất cả sessions của một wallet
   * @param {string} walletAddress - Wallet address
   * @returns {Promise<number>} Số sessions đã xóa
   */
  async disconnectAllSessions(walletAddress) {
    try {
      const result = await Session.deleteMany({ walletAddress });
      return result.deletedCount;
    } catch (error) {
      console.error('Error disconnecting all sessions:', error.message);
      return 0;
    }
  }

  /**
   * Lấy thống kê sessions
   * @returns {Promise<Object>} Session statistics
   */
  async getSessionStats() {
    try {
      const totalSessions = await Session.countDocuments();
      const activeSessions = await Session.countDocuments({
        expiresAt: { $gt: new Date() }
      });
      const expiredSessions = totalSessions - activeSessions;

      return {
        totalSessions,
        activeSessions,
        expiredSessions,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting session stats:', error.message);
      return {
        totalSessions: 0,
        activeSessions: 0,
        expiredSessions: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Cleanup expired sessions
   * @returns {Promise<number>} Số sessions đã cleanup
   */
  async cleanupExpiredSessions() {
    try {
      const result = await Session.cleanupExpired();
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error.message);
      return 0;
    }
  }

  /**
   * Health check cho user service
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const stats = await this.getSessionStats();
      const isHealthy = stats.totalSessions >= 0; // Basic check

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        stats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new UserService(); 