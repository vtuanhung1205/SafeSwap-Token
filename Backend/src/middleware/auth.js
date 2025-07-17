const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { User } = require('../models/User.model');
const { createError } = require('./errorHandler');
const { logger } = require('../utils/logger');

// Configure JWT strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'default_secret_key',
};

// Initialize passport with JWT strategy
passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      // Find user by ID from JWT payload
      const user = await User.findById(payload.id);
      
      if (!user) {
        return done(null, false);
      }
      
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Middleware to authenticate requests
const authenticate = () => {
  return (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
      if (err) {
        logger.error('Authentication failed:', err);
        return next(createError(500, 'Authentication error'));
      }
      
      if (!user) {
        return next(createError(401, 'Unauthorized'));
      }
      
      // Attach user to request
      req.user = user;
      
      next();
    })(req, res, next);
  };
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

// Middleware to verify token manually (alternative to passport)
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return next(createError(401, 'No token provided'));
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(createError(401, 'Invalid token'));
    }
    
    req.user = user;
    next();
  } catch (error) {
    logger.error('Token verification failed:', error);
    return next(createError(401, 'Invalid token'));
  }
};

// Middleware to extract user from token (optional auth)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret_key');
      const user = await User.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without user if token is invalid
    next();
  }
};

module.exports = {
  authenticate,
  requireAdmin,
  verifyToken,
  optionalAuth
};
