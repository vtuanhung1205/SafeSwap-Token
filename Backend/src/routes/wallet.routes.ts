import { Router } from 'express';
import { WalletController } from '@/controllers/wallet.controller';
import { authenticate } from '@/middleware/auth';

const router = Router();
const walletController = new WalletController();

// All wallet routes are protected
router.use(authenticate());

// Wallet management
router.post('/connect', walletController.connectWallet);
router.get('/info', walletController.getWalletInfo);
router.get('/transactions', walletController.getTransactionHistory);
router.post('/fund', walletController.fundTestnetWallet);

export default router; 