const { AptosClient, AptosAccount, TxnBuilderTypes, BCS } = require('aptos');
const { Token } = require('../models/Token.model');
const { SwapTransaction } = require('../models/SwapTransaction.model');
const { Wallet } = require('../models/Wallet.model');
const { logger } = require('../utils/logger');
const createError = require('http-errors');

class AptosBlockchainService {
  constructor() {
    this.network = process.env.APTOS_NETWORK || 'testnet';
    this.nodeUrl = process.env.APTOS_NODE_URL || 'https://fullnode.testnet.aptoslabs.com/v1';
    this.client = new AptosClient(this.nodeUrl);
    
    // Common token addresses on Aptos
    this.commonTokens = {
      APT: {
        symbol: 'APT',
        name: 'Aptos',
        address: '0x1::aptos_coin::AptosCoin',
        decimals: 8,
        isNative: true
      },
      USDC: {
        symbol: 'USDC',
        name: 'USD Coin',
        address: '0x1::coin::USDC',
        decimals: 6,
        isNative: false
      },
      USDT: {
        symbol: 'USDT',
        name: 'Tether USD',
        address: '0x1::coin::USDT',
        decimals: 6,
        isNative: false
      }
    };
  }

  /**
   * Get account information from Aptos blockchain
   */
  async getAccountInfo(address) {
    try {
      const accountInfo = await this.client.getAccount(address);
      logger.info(`Account info retrieved for ${address}`);
      return accountInfo;
    } catch (error) {
      logger.error(`Failed to get account info for ${address}:`, error);
      throw createError(400, 'Invalid Aptos address');
    }
  }

  /**
   * Get account balance in APT
   */
  async getAccountBalance(address) {
    try {
      const balance = await this.client.getAccountBalance(address);
      return parseFloat(balance.coin.value) / Math.pow(10, 8); // Convert from octas to APT
    } catch (error) {
      logger.error(`Failed to get balance for ${address}:`, error);
      return 0;
    }
  }

  /**
   * Get token balance for a specific token
   */
  async getTokenBalance(address, tokenAddress) {
    try {
      const resource = await this.client.getAccountResource(
        address,
        `${tokenAddress}::coin::CoinStore<${tokenAddress}::coin::T>`
      );
      
      if (resource && resource.data) {
        return parseFloat(resource.data.coin.value);
      }
      return 0;
    } catch (error) {
      logger.error(`Failed to get token balance for ${address}:`, error);
      return 0;
    }
  }

  /**
   * Get all token balances for an account
   */
  async getAllTokenBalances(address) {
    try {
      const resources = await this.client.getAccountResources(address);
      const tokenBalances = {};

      for (const resource of resources) {
        if (resource.type.includes('::coin::CoinStore<')) {
          const tokenType = resource.type.match(/CoinStore<(.+)>/)[1];
          const tokenAddress = tokenType.split('::')[0];
          const balance = parseFloat(resource.data.coin.value);

          if (balance > 0) {
            tokenBalances[tokenAddress] = {
              amount: balance,
              type: tokenType
            };
          }
        }
      }

      return tokenBalances;
    } catch (error) {
      logger.error(`Failed to get all token balances for ${address}:`, error);
      return {};
    }
  }

  /**
   * Create a swap transaction payload
   */
  async createSwapPayload(fromToken, toToken, amount, slippage = 0.5) {
    try {
      // This would integrate with a DEX like Liquidswap or PancakeSwap
      // For now, we'll create a mock payload
      const payload = {
        function: '0x1::coin::transfer',
        type_arguments: [fromToken],
        arguments: [toToken, amount.toString()]
      };

      return payload;
    } catch (error) {
      logger.error('Failed to create swap payload:', error);
      throw createError(500, 'Failed to create swap transaction');
    }
  }

  /**
   * Submit a transaction to Aptos blockchain
   */
  async submitTransaction(walletAddress, payload, maxGasAmount = 2000) {
    try {
      // Get account sequence number
      const accountInfo = await this.getAccountInfo(walletAddress);
      const sequenceNumber = accountInfo.sequence_number;

      // Create transaction
      const rawTxn = new TxnBuilderTypes.RawTransaction(
        TxnBuilderTypes.AccountAddress.fromHex(walletAddress),
        BigInt(sequenceNumber),
        payload,
        BigInt(maxGasAmount),
        BigInt(100), // gas unit price
        BigInt(Math.floor(Date.now() / 1000) + 600), // expiration timestamp
        new TxnBuilderTypes.ChainId(1) // testnet
      );

      // For now, return a mock transaction hash
      // In production, you would sign and submit the transaction
      const transactionHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      logger.info(`Transaction submitted: ${transactionHash}`);
      return {
        hash: transactionHash,
        sequenceNumber,
        version: accountInfo.sequence_number + 1
      };
    } catch (error) {
      logger.error('Failed to submit transaction:', error);
      throw createError(500, 'Failed to submit transaction');
    }
  }

  /**
   * Get transaction status
   */
  async getTransactionStatus(transactionHash) {
    try {
      const transaction = await this.client.getTransactionByHash(transactionHash);
      
      if (transaction.success) {
        return {
          status: 'completed',
          gasUsed: transaction.gas_used,
          gasUnitPrice: transaction.gas_unit_price,
          version: transaction.version
        };
      } else {
        return {
          status: 'failed',
          error: transaction.vm_status
        };
      }
    } catch (error) {
      logger.error(`Failed to get transaction status for ${transactionHash}:`, error);
      return {
        status: 'pending'
      };
    }
  }

  /**
   * Get token metadata from blockchain
   */
  async getTokenMetadata(tokenAddress) {
    try {
      const resource = await this.client.getAccountResource(
        tokenAddress,
        '0x1::coin::CoinInfo'
      );

      if (resource && resource.data) {
        return {
          name: resource.data.name,
          symbol: resource.data.symbol,
          decimals: resource.data.decimals,
          totalSupply: resource.data.supply.vec[0].integer.vec[0].value
        };
      }
      return null;
    } catch (error) {
      logger.error(`Failed to get token metadata for ${tokenAddress}:`, error);
      return null;
    }
  }

  /**
   * Validate Aptos address format
   */
  validateAddress(address) {
    const addressRegex = /^0x[a-fA-F0-9]{64}$/;
    return addressRegex.test(address);
  }

  /**
   * Get gas estimate for transaction
   */
  async estimateGas(payload) {
    try {
      // Mock gas estimation
      // In production, you would use Aptos SDK to estimate gas
      return {
        gasUsed: 1000,
        gasUnitPrice: 100,
        maxGasAmount: 2000
      };
    } catch (error) {
      logger.error('Failed to estimate gas:', error);
      return {
        gasUsed: 2000,
        gasUnitPrice: 100,
        maxGasAmount: 4000
      };
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice() {
    try {
      // Mock gas price
      // In production, you would fetch from Aptos API
      return 100;
    } catch (error) {
      logger.error('Failed to get gas price:', error);
      return 100;
    }
  }

  /**
   * Create a new token in database
   */
  async createToken(tokenData) {
    try {
      const token = new Token({
        ...tokenData,
        chainId: `aptos-${this.network}`
      });
      
      await token.save();
      logger.info(`Token created: ${token.symbol}`);
      return token;
    } catch (error) {
      logger.error('Failed to create token:', error);
      throw error;
    }
  }

  /**
   * Update token price from external API
   */
  async updateTokenPrice(tokenAddress) {
    try {
      const token = await Token.findOne({ address: tokenAddress });
      if (!token) {
        throw new Error('Token not found');
      }

      // Mock price update
      // In production, you would fetch from price APIs
      const newPrice = Math.random() * 100;
      const newPriceUSD = newPrice * 1.5;
      const change24h = (Math.random() - 0.5) * 20;

      await token.updatePrice(newPrice, newPriceUSD, change24h);
      logger.info(`Token price updated: ${token.symbol}`);
      return token;
    } catch (error) {
      logger.error('Failed to update token price:', error);
      throw error;
    }
  }
}

module.exports = { AptosBlockchainService }; 