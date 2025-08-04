const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. User not found.'
      });
    }

    if (user.accountStatus !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'Account is not active.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Authentication failed.'
    });
  }
};

// Optional auth middleware for public endpoints
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.accountStatus === 'active') {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

// Admin auth middleware
const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. User not found.'
      });
    }

    if (user.accountStatus !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'Account is not active.'
      });
    }

    // Check if user is admin (you can add isAdmin field to User model)
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Admin authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Authentication failed.'
    });
  }
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message
    }
  });
};

// Specific rate limiters
const authLimiter = createRateLimiter(15 * 60 * 1000, 5, 'Too many authentication attempts. Please try again later.');
const transactionLimiter = createRateLimiter(60 * 1000, 10, 'Too many transaction requests. Please try again later.');
const apiLimiter = createRateLimiter(15 * 60 * 1000, 100, 'Too many API requests. Please try again later.');

module.exports = {
  auth,
  optionalAuth,
  adminAuth,
  authLimiter,
  transactionLimiter,
  apiLimiter
}; 