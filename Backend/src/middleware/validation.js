const { body, param, query, validationResult } = require('express-validator');
const { createError } = require('./errorHandler');

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(createError(400, `Validation failed: ${errorMessages.join(', ')}`));
  }
  next();
};

// Wallet validation rules
const validateWalletConnection = [
  body('address')
    .isString()
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Invalid Aptos address format'),
  body('publicKey')
    .isString()
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage('Invalid public key format'),
  body('walletName')
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage('Wallet name must be between 1 and 50 characters'),
  handleValidationErrors
];

const validateWalletId = [
  param('walletId')
    .isMongoId()
    .withMessage('Invalid wallet ID format'),
  handleValidationErrors
];

// Swap validation rules
const validateSwapQuote = [
  body('fromToken')
    .isString()
    .notEmpty()
    .withMessage('fromToken is required'),
  body('toToken')
    .isString()
    .notEmpty()
    .withMessage('toToken is required'),
  body('amount')
    .isFloat({ min: 0.000001 })
    .withMessage('Amount must be a positive number'),
  body('slippage')
    .optional()
    .isFloat({ min: 0.1, max: 50 })
    .withMessage('Slippage must be between 0.1% and 50%'),
  handleValidationErrors
];

const validateSwapExecution = [
  body('fromToken')
    .isString()
    .notEmpty()
    .withMessage('fromToken is required'),
  body('toToken')
    .isString()
    .notEmpty()
    .withMessage('toToken is required'),
  body('fromAmount')
    .isFloat({ min: 0.000001 })
    .withMessage('fromAmount must be a positive number'),
  body('toAmount')
    .isFloat({ min: 0.000001 })
    .withMessage('toAmount must be a positive number'),
  body('quoteId')
    .isString()
    .notEmpty()
    .withMessage('quoteId is required'),
  body('slippage')
    .optional()
    .isFloat({ min: 0.1, max: 50 })
    .withMessage('Slippage must be between 0.1% and 50%'),
  handleValidationErrors
];

// Liquidity validation rules
const validateAddLiquidity = [
  body('token0')
    .isString()
    .notEmpty()
    .withMessage('token0 is required'),
  body('token1')
    .isString()
    .notEmpty()
    .withMessage('token1 is required'),
  body('amount0')
    .isFloat({ min: 0.000001 })
    .withMessage('amount0 must be a positive number'),
  body('amount1')
    .isFloat({ min: 0.000001 })
    .withMessage('amount1 must be a positive number'),
  body('minLiquidity')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('minLiquidity must be a non-negative number'),
  handleValidationErrors
];

const validateRemoveLiquidity = [
  body('token0')
    .isString()
    .notEmpty()
    .withMessage('token0 is required'),
  body('token1')
    .isString()
    .notEmpty()
    .withMessage('token1 is required'),
  body('liquidity')
    .isFloat({ min: 0.000001 })
    .withMessage('liquidity must be a positive number'),
  body('minAmount0')
    .isFloat({ min: 0 })
    .withMessage('minAmount0 must be a non-negative number'),
  body('minAmount1')
    .isFloat({ min: 0 })
    .withMessage('minAmount1 must be a non-negative number'),
  handleValidationErrors
];

// Auth validation rules
const validateRegistration = [
  body('username')
    .isString()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-30 characters, alphanumeric and underscore only'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be 8-128 characters with at least one uppercase, lowercase, number and special character'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isString()
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validatePasswordChange = [
  body('currentPassword')
    .isString()
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must be 8-128 characters with at least one uppercase, lowercase, number and special character'),
  body('confirmNewPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
  handleValidationErrors
];

// Query validation rules
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

const validateTokenAddress = [
  param('tokenAddress')
    .isString()
    .matches(/^0x[a-fA-F0-9]{64}::[a-zA-Z0-9_]+::[a-zA-Z0-9_]+$/)
    .withMessage('Invalid token address format'),
  handleValidationErrors
];

const validatePoolAddress = [
  param('poolAddress')
    .isString()
    .matches(/^0x[a-fA-F0-9]{64}::[a-zA-Z0-9_]+::[a-zA-Z0-9_<>]+$/)
    .withMessage('Invalid pool address format'),
  handleValidationErrors
];

// Transaction validation
const validateTransactionId = [
  param('transactionId')
    .isMongoId()
    .withMessage('Invalid transaction ID format'),
  handleValidationErrors
];

// Wallet settings validation
const validateWalletSettings = [
  body('security.requireConfirmation')
    .optional()
    .isBoolean()
    .withMessage('requireConfirmation must be a boolean'),
  body('security.confirmationThreshold')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('confirmationThreshold must be a non-negative number'),
  body('security.dailyLimit')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('dailyLimit must be a non-negative number'),
  body('permissions.canSwap')
    .optional()
    .isBoolean()
    .withMessage('canSwap must be a boolean'),
  body('permissions.canTransfer')
    .optional()
    .isBoolean()
    .withMessage('canTransfer must be a boolean'),
  body('permissions.canStake')
    .optional()
    .isBoolean()
    .withMessage('canStake must be a boolean'),
  body('permissions.canVote')
    .optional()
    .isBoolean()
    .withMessage('canVote must be a boolean'),
  body('metadata.tags')
    .optional()
    .isArray()
    .withMessage('tags must be an array'),
  body('metadata.color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('color must be a valid hex color'),
  body('metadata.notes')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('notes must be less than 500 characters'),
  handleValidationErrors
];

module.exports = {
  validateWalletConnection,
  validateWalletId,
  validateSwapQuote,
  validateSwapExecution,
  validateAddLiquidity,
  validateRemoveLiquidity,
  validateRegistration,
  validateLogin,
  validatePasswordChange,
  validatePagination,
  validateTokenAddress,
  validatePoolAddress,
  validateTransactionId,
  validateWalletSettings,
  handleValidationErrors
}; 