const { logger } = require('../utils/logger');

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Format the error message for better readability
  let errorMessage = error.message;
  
  // Special handling for common errors
  if (error.name === 'ValidationError' && error.errors) {
    // Mongoose validation error
    errorMessage = Object.values(error.errors)
      .map(err => err.message)
      .join(', ');
  } else if (error.name === 'MongoServerError' && error.code === 11000) {
    // Duplicate key error
    errorMessage = 'This record already exists.';
    error.statusCode = 409;
  } else if (error.name === 'TypeError' && error.message.includes('Cannot read property')) {
    // Common TypeError
    errorMessage = 'Invalid data format received.';
    error.statusCode = 400;
  } else if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
    // JSON parsing error
    errorMessage = 'Invalid JSON format.';
    error.statusCode = 400;
  }

  // Log error with appropriate level based on status code
  const logMethod = statusCode >= 500 ? 'error' : 'warn';
  logger[logMethod]('Error occurred:', {
    service: 'safeswap-backend',
    message: errorMessage,
    originalMessage: error.message,
    stack: error.stack,
    statusCode,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500 ? 'Internal Server Error' : errorMessage,
    ...(isProduction ? {} : { stack: error.stack }),
    timestamp: new Date().toISOString()
  });
};

const createError = (statusCode = 500, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { 
  errorHandler, 
  createError, 
  asyncHandler 
};
