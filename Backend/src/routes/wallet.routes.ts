import { Router } from 'express';
import { WalletController } from '@/controllers/wallet.controller';
import { authenticateToken } from '@/middleware/auth';

const router = Router();
const walletController = new WalletController();

// Wallet connection routes
router.post('/connect', authenticateToken, walletController.connectWallet);
router.post('/disconnect', authenticateToken, walletController.disconnectWallet);

// Wallet information routes
router.get('/info', authenticateToken, walletController.getWalletInfo);
router.get('/balance', authenticateToken, walletController.getBalance);
router.post('/update-balance', authenticateToken, walletController.updateBalance);

// Transaction routes
router.get('/transactions', authenticateToken, walletController.getTransactionHistory);
router.post('/validate-address', walletController.validateAddress);

// Testnet funding (testnet only)
router.post('/fund', authenticateToken, walletController.fundAccount);

export default router; 