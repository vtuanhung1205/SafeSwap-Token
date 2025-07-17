import { Wallet, IWallet } from '@/models/Wallet.model';
import { createError } from '@/middleware/errorHandler';

export class WalletService {
  public async getWalletByUserId(userId: string): Promise<IWallet | null> {
    return Wallet.findOne({ userId });
  }

  public async connectWallet(userId: string, address: string, publicKey: string): Promise<IWallet> {
    let wallet = await Wallet.findOne({ userId });

    if (wallet) {
      // Update existing wallet
      wallet.address = address;
      wallet.publicKey = publicKey;
      wallet.isConnected = true;
    } else {
      // Create new wallet
      wallet = new Wallet({
        userId,
        address,
        publicKey,
        isConnected: true,
        // Add default values for other fields if necessary
        chainId: 'aptos:testnet', // Example
        balance: 0,
      });
    }

    await wallet.save();
    return wallet;
  }

  public async disconnectWallet(userId: string): Promise<IWallet | null> {
    return Wallet.findOneAndUpdate(
      { userId },
      { isConnected: false },
      { new: true }
    );
  }

  public async updateBalance(userId: string, newBalance: number): Promise<IWallet | null> {
    return Wallet.findOneAndUpdate(
        { userId },
        { balance: newBalance },
        { new: true }
    );
  }
} 