const { createError } = require('./errorHandler');
const userService = require('../services/user.service');
const { logger } = require('../utils/logger');

/**
 * Authenticate middleware - Validate session và identify user
 * Sử dụng wallet-based authentication thay vì user accounts
 */
const authenticate = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
    
    logger.info(`Auth check - URL: ${req.path}, SessionId: ${sessionId}`);
    
    if (!sessionId) {
      logger.warn(`No session found for ${req.path}`);
      throw createError(401, 'No session found');
    }

    // Validate session và lấy user info
    const user = await userService.validateSession(sessionId);
    if (!user) {
      logger.warn(`Invalid session for ${req.path}: ${sessionId}`);
      throw createError(401, 'Invalid or expired session');
    }

    // Add user info to request
    req.user = user;
    req.sessionId = sessionId;
    
    logger.info(`Authenticated wallet: ${user.walletAddress} for ${req.path}`);
    next();
  } catch (error) {
    logger.warn(`Auth error: ${error.message}`, {
      originalMessage: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });
    next(error);
  }
};

/**
 * Optional authentication - Không bắt buộc phải có session
 * Nếu có session thì validate, nếu không thì tiếp tục
 */
const optionalAuth = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
    
    if (sessionId) {
      const user = await userService.validateSession(sessionId);
      if (user) {
        req.user = user;
        req.sessionId = sessionId;
        logger.info(`Optional auth - Authenticated wallet: ${user.walletAddress} for ${req.path}`);
      }
    }
    
    next();
  } catch (error) {
    // Không throw error, chỉ log và tiếp tục
    logger.warn(`Optional auth error: ${error.message}`);
    next();
  }
};

/**
 * Wallet-based authentication - Validate wallet address
 * Sử dụng cho các API cần wallet address nhưng không cần session
 */
const validateWallet = async (req, res, next) => {
  try {
    const walletAddress = req.body.walletAddress || req.query.walletAddress || req.params.walletAddress;
    
    if (!walletAddress) {
      throw createError(400, 'Wallet address is required');
    }

    // Validate wallet address format (Aptos format)
    if (!/^0x[a-fA-F0-9]{64}$/.test(walletAddress)) {
      throw createError(400, 'Invalid wallet address format');
    }

    // Add wallet info to request
    req.walletAddress = walletAddress;
    
    logger.info(`Wallet validated: ${walletAddress} for ${req.path}`);
    next();
  } catch (error) {
    logger.warn(`Wallet validation error: ${error.message}`);
    next(error);
  }
};

/**
 * Admin middleware - Chỉ dành cho admin actions
 * Có thể implement sau khi có admin system
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      throw createError(401, 'Authentication required');
    }

    // TODO: Implement admin check logic
    // Hiện tại chỉ log warning
    logger.warn(`Admin action attempted by ${req.user.walletAddress}: ${req.path}`);
    
    // Tạm thời cho phép tất cả authenticated users
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { 
  authenticate, 
  optionalAuth, 
  validateWallet, 
  requireAdmin 
};
