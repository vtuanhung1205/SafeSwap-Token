import { Aptos, AptosConfig, Network, Types } from '@aptos-labs/ts-sdk';
import { Wallet, IWallet } from '@/models/Wallet.model';
import { logger } from '@/utils/logger';
import { createError } from '@/middleware/errorHandler';

export class AptosService {
  private aptos: Aptos;
  private readonly nodeUrl: string;
  private readonly faucetUrl: string;

  constructor() {
    this.nodeUrl = process.env.APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com/v1';
    this.faucetUrl = process.env.APTOS_FAUCET_URL || 'https://faucet.testnet.aptoslabs.com';
    
    const config = new AptosConfig({ 
      network: Network.TESTNET,
      fullnode: this.nodeUrl,
      faucet: this.faucetUrl,
    });
    
    this.aptos = new Aptos(config);
  }

  public async connectWallet(userId: string, walletData: {
    address: string;
    publicKey: string;
  }): Promise<IWallet> {
    try {
      // Check if wallet already exists
      const existingWallet = await Wallet.findOne({ address: walletData.address });
      
      if (existingWallet && existingWallet.userId.toString() !== userId) {
        throw createError('Wallet is already connected to another user', 400);
      }

      // Get account balance
      const balance = await this.getAccountBalance(walletData.address);

      // Update or create wallet
      const wallet = await Wallet.findOneAndUpdate(
        { userId },
        {
          userId,
          address: walletData.address,
          publicKey: walletData.publicKey,
          chainId: 'aptos-testnet',
          balance,
          isConnected: true,
        },
        { upsert: true, new: true }
      );

      logger.info(`Wallet connected for user ${userId}: ${walletData.address}`);
      return wallet;
    } catch (error) {
      logger.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  public async disconnectWallet(userId: string): Promise<void> {
    try {
      await Wallet.findOneAndUpdate(
        { userId },
        { isConnected: false },
        { new: true }
      );

      logger.info(`Wallet disconnected for user ${userId}`);
    } catch (error) {
      logger.error('Failed to disconnect wallet:', error);
      throw error;
    }
  }

  public async getAccountBalance(address: string): Promise<number> {
    try {
      const resources = await this.aptos.getAccountResources({
        accountAddress: address,
      });

      // Find APT coin resource
      const aptResource = resources.find(
        (resource) => resource.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );

      if (aptResource) {
        const balance = (aptResource.data as any).coin.value;
        return parseFloat(balance) / 100000000; // Convert from octas to APT
      }

      return 0;
    } catch (error) {
      logger.error(`Failed to get balance for address ${address}:`, error);
      return 0;
    }
  }

  public async getAccount(accountAddress: string): Promise<any> {
    try {
      // Use the correct method to get account info
      const account = await this.aptos.account.getAccountInfo({ accountAddress });
      return account;
    } catch (error) {
      logger.error(`Failed to get account ${accountAddress}:`, error);
      throw createError(500, 'Failed to fetch account from Aptos network');
    }
  }

  public async getAccountTransactions(accountAddress: string, limit: number = 25): Promise<any[]> {
    try {
      const transactions = await this.aptos.getAccountTransactions({
        accountAddress,
        options: {
          limit: limit.toString(),
        },
      });
      
      return transactions.map((tx: any) => ({
        hash: tx.hash,
        version: tx.version,
        success: tx.success,
        gas_used: tx.gas_used,
        timestamp: tx.timestamp,
        payload: tx.payload,
      }));
    } catch (error) {
      logger.error(`Failed to get transactions for ${accountAddress}:`, error);
      throw createError(500, 'Failed to fetch transactions');
    }
  }

  public async getUserWallet(userId: string): Promise<IWallet | null> {
    try {
      const wallet = await Wallet.findOne({ userId });
      return wallet;
    } catch (error) {
      logger.error(`Failed to get user wallet for ${userId}:`, error);
      return null;
    }
  }

  public async updateWalletBalance(userId: string): Promise<number> {
    try {
      const wallet = await Wallet.findOne({ userId });
      
      if (!wallet) {
        throw createError('Wallet not found', 404);
      }

      const balance = await this.getAccountBalance(wallet.address);
      
      await Wallet.findByIdAndUpdate(wallet._id, { balance });
      
      return balance;
    } catch (error) {
      logger.error(`Failed to update wallet balance for user ${userId}:`, error);
      throw error;
    }
  }

  public async fundAccount(address: string, amount: number = 100_000_000): Promise<any> {
    try {
      // Fund account with testnet tokens
      const result = await this.aptos.faucet.fundAccount({
        accountAddress: address,
        amount: amount.toString(),
      });
      
      logger.info(`Account ${address} funded with ${amount} octas`);
      return result;
    } catch (error) {
      logger.error(`Failed to fund account ${address}:`, error);
      throw createError(500, 'Failed to fund account');
    }
  }

  public async validateAddress(address: string): Promise<boolean> {
    try {
      await this.aptos.getAccountInfo({
        accountAddress: address,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  public async simulateTransaction(sender: IWallet, payload: any): Promise<any> {
    try {
      const transaction = await this.aptos.transaction.build.simple({
        sender: sender.address,
        data: payload,
      });

      // Use string for public key instead of PublicKey instance
      const simulationResult = await this.aptos.transaction.simulate({
        signerPublicKey: sender.publicKey,
        transaction,
      });

      return simulationResult;
    } catch (error) {
      logger.error('Failed to simulate transaction:', error);
      throw createError(500, 'Transaction simulation failed');
    }
  }

  public async getGasPrice(): Promise<any> {
    try {
      // Get gas price estimation
      const gasEstimate = await this.aptos.getGasPriceEstimation();
      return gasEstimate;
    } catch (error) {
      logger.error('Failed to get gas price:', error);
      throw createError(500, 'Failed to fetch gas price');
    }
  }
} 