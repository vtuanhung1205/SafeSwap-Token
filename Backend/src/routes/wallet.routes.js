const express = require('express');
const { WalletController } = require('../controllers/wallet.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { verifyToken } = require('../middleware/auth');
const { standardRateLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const walletController = new WalletController();

// @route   POST /api/wallet/connect
// @desc    Connect wallet to user account
// @access  Private
router.post('/connect', verifyToken, standardRateLimiter, asyncHandler(walletController.connectWallet.bind(walletController)));

// @route   POST /api/wallet/disconnect
// @desc    Disconnect wallet from user account
// @access  Private
router.post('/disconnect', verifyToken, asyncHandler(walletController.disconnectWallet.bind(walletController)));

// @route   GET /api/wallet/info
// @desc    Get wallet information
// @access  Private
router.get('/info', verifyToken, asyncHandler(walletController.getWalletInfo.bind(walletController)));

// @route   GET /api/wallet/balance
// @desc    Get wallet balance
// @access  Private
router.get('/balance', verifyToken, asyncHandler(walletController.getBalance.bind(walletController)));

// @route   POST /api/wallet/update-balance
// @desc    Update wallet balance
// @access  Private
router.post('/update-balance', verifyToken, asyncHandler(walletController.updateBalance.bind(walletController)));

// @route   GET /api/wallet/transactions
// @desc    Get wallet transaction history
// @access  Private
router.get('/transactions', verifyToken, asyncHandler(walletController.getTransactionHistory.bind(walletController)));

// @route   GET /api/wallet/resources
// @desc    Get wallet account resources
// @access  Private
router.get('/resources', verifyToken, asyncHandler(walletController.getAccountResources.bind(walletController)));

// @route   POST /api/wallet/validate-address
// @desc    Validate wallet address
// @access  Public
router.post('/validate-address', asyncHandler(walletController.validateAddress.bind(walletController)));

// @route   POST /api/wallet/fund
// @desc    Fund wallet from faucet (testnet only)
// @access  Private
router.post('/fund', verifyToken, standardRateLimiter, asyncHandler(walletController.fundAccount.bind(walletController)));

// @route   GET /api/wallet/account
// @desc    Get account information
// @access  Private
router.get('/account', verifyToken, asyncHandler(walletController.getAccountInfo.bind(walletController)));

module.exports = router;
