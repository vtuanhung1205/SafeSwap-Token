const { createError } = require('./errorHandler');
const { AuthService } = require('../services/auth.service');
const { logger } = require('../utils/logger');

const authService = new AuthService();

const authenticate = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
    
    logger.info(`Auth check - URL: ${req.path}, SessionId: ${sessionId}, Cookies:`, req.cookies);
    
    if (!sessionId) {
      logger.warn(`No session found for ${req.path}`);
      throw createError(401, 'No session found');
    }

    const session = await authService.getSession(sessionId);
    if (!session) {
      logger.warn(`Invalid session for ${req.path}: ${sessionId}`);
      throw createError(401, 'Invalid or expired session');
    }

    // Add user info to request
    req.user = session;
    req.sessionId = sessionId;
    
    logger.info(`Authenticated user: ${session.email} for ${req.path}`);
    next();
  } catch (error) {
    logger.warn(`Error occurred: ${error.message}`, {
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

module.exports = { authenticate };
