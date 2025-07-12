import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';
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

  public async getAccountInfo(address: string): Promise<any> {
    try {
      const account = await this.aptos.getAccountInfo({
        accountAddress: address,
      });

      return {
        address: account.address,
        sequenceNumber: account.sequence_number,
        authenticationKey: account.authentication_key,
      };
    } catch (error) {
      logger.error(`Failed to get account info for ${address}:`, error);
      throw createError('Failed to get account information', 500);
    }
  }

  public async getTransactionHistory(address: string, limit: number = 25): Promise<any[]> {
    try {
      const transactions = await this.aptos.getAccountTransactions({
        accountAddress: address,
        options: {
          limit,
          orderBy: [{ sequence_number: 'desc' }],
        },
      });

      return transactions.map(tx => ({
        hash: tx.hash,
        type: tx.type,
        sequenceNumber: tx.sequence_number,
        timestamp: tx.timestamp,
        success: tx.success,
        gasUsed: tx.gas_used,
        gasUnitPrice: tx.gas_unit_price,
        payload: tx.payload,
      }));
    } catch (error) {
      logger.error(`Failed to get transaction history for ${address}:`, error);
      return [];
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

  public async fundAccount(address: string, amount: number = 10000000): Promise<any> {
    try {
      // This is for testnet only - fund account with APT tokens
      const response = await this.aptos.fundAccount({
        accountAddress: address,
        amount,
      });

      logger.info(`Account ${address} funded with ${amount} octas`);
      return response;
    } catch (error) {
      logger.error(`Failed to fund account ${address}:`, error);
      throw createError('Failed to fund account', 500);
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

  public async estimateGasFee(transaction: any): Promise<number> {
    try {
      const gasEstimate = await this.aptos.simulateTransaction({
        transaction,
      });

      return gasEstimate[0].gas_used * gasEstimate[0].gas_unit_price;
    } catch (error) {
      logger.error('Failed to estimate gas fee:', error);
      throw createError('Failed to estimate gas fee', 500);
    }
  }
} 