const { AuthService } = require('../services/auth.service');
const { createError } = require('./errorHandler');
const { logger } = require('../utils/logger');

const authService = new AuthService();

// Middleware to authenticate requests using session
const authenticate = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
    
    logger.info(`Auth check - URL: ${req.url}, SessionId: ${sessionId}, Cookies:`, req.cookies);
    
    if (!sessionId) {
      logger.warn(`No session found for ${req.url}`);
      return next(createError(401, 'No session found'));
    }

    const session = authService.getSession(sessionId);
    if (!session) {
      logger.warn(`Invalid session ${sessionId} for ${req.url}`);
      return next(createError(401, 'Invalid or expired session'));
    }

    const user = await authService.getUserById(session.userId);
    if (!user) {
      logger.warn(`User not found for session ${sessionId}`);
      return next(createError(404, 'User not found'));
    }

    logger.info(`Auth successful for user ${user.email} on ${req.url}`);
    
    // Attach user to request
    req.user = user;
    req.session = session;
    
    next();
  } catch (error) {
    logger.error('Authentication failed:', error);
    return next(createError(500, 'Authentication error'));
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return next(createError(401, 'Unauthorized'));
  }
  
  if (!req.user.isAdmin) {
    return next(createError(403, 'Admin access required'));
  }
  
  next();
};

// Middleware to extract user from session (optional auth)
const optionalAuth = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
    
    if (sessionId) {
      const session = authService.getSession(sessionId);
      if (session) {
        const user = await authService.getUserById(session.userId);
        if (user) {
          req.user = user;
          req.session = session;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without user if session is invalid
    next();
  }
};

// Middleware to validate session without throwing error
const validateSession = async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId || req.headers['x-session-id'];
    
    if (sessionId) {
      const session = authService.getSession(sessionId);
      if (session) {
        const user = await authService.getUserById(session.userId);
        if (user) {
          req.user = user;
          req.session = session;
          req.isAuthenticated = true;
        } else {
          req.isAuthenticated = false;
        }
      } else {
        req.isAuthenticated = false;
      }
    } else {
      req.isAuthenticated = false;
    }
    
    next();
  } catch (error) {
    req.isAuthenticated = false;
    next();
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  optionalAuth,
  validateSession
};
