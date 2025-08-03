const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '50000'), // Increased limit for production
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health check and auth endpoints
  skip: (req) => req.path === '/health' || req.path.startsWith('/api/auth')
});

const strictRateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 200, // Increased from 50 to 200 requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const standardRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 500, // Increased from 100 to 500 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { 
  rateLimiter, 
  strictRateLimiter,
  standardRateLimiter
};
