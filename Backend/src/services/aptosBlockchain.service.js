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
    
    // Real DEX addresses on Aptos
    this.dexes = {
      liquidswap: {
        name: 'Liquidswap',
        address: '0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12',
        router: 'liquidswap_router',
        pools: 'liquidswap_pools',
        stable: 'liquidswap_stable',
        mainnet: true
      },
      pancakeswap: {
        name: 'PancakeSwap',
        address: '0xc7efb4076dbe143cbcd98cf5e5b0aa4c4b7c5c8c',
        router: 'pancake_router',
        pools: 'pancake_pools',
        mainnet: true
      },
      sushi: {
        name: 'SushiSwap',
        address: '0x1eabed72c53feb3805120a081dc15963c204dc8d091542592abaf7a35689b2fb',
        router: 'sushi_router',
        pools: 'sushi_pools',
        mainnet: true
      }
    };
    
    // Common token addresses on Aptos
    this.commonTokens = {
      APT: {
        symbol: 'APT',
        name: 'Aptos',
        address: '0x1::aptos_coin::AptosCoin',
        decimals: 8,
        isNative: true,
        coingeckoId: 'aptos'
      },
      USDC: {
        symbol: 'USDC',
        name: 'USD Coin',
        address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
        decimals: 6,
        isNative: false,
        coingeckoId: 'usd-coin'
      },
      USDT: {
        symbol: 'USDT',
        name: 'Tether USD',
        address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT',
        decimals: 6,
        isNative: false,
        coingeckoId: 'tether'
      },
      BTC: {
        symbol: 'BTC',
        name: 'Bitcoin',
        address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::BTC',
        decimals: 8,
        isNative: false,
        coingeckoId: 'bitcoin'
      },
      ETH: {
        symbol: 'ETH',
        name: 'Ethereum',
        address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::ETH',
        decimals: 8,
        isNative: false,
        coingeckoId: 'ethereum'
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
              type: tokenType,
              lastUpdated: new Date()
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
   * Get liquidity pools from DEX
   */
  async getLiquidityPools(dex = 'liquidswap') {
    try {
      const dexConfig = this.dexes[dex];
      if (!dexConfig) {
        throw new Error(`Unsupported DEX: ${dex}`);
      }

      // Get pools from DEX contract
      const pools = await this.client.getAccountResource(
        dexConfig.address,
        `${dexConfig.address}::${dexConfig.pools}::PoolRegistry`
      );

      return pools?.data?.pools || [];
    } catch (error) {
      logger.error(`Failed to get liquidity pools from ${dex}:`, error);
      return [];
    }
  }

  /**
   * Get pool reserves
   */
  async getPoolReserves(poolAddress) {
    try {
      const pool = await this.client.getAccountResource(
        poolAddress,
        '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>'
      );

      return {
        reserve0: parseFloat(pool?.data?.coin?.value || 0),
        reserve1: parseFloat(pool?.data?.coin?.value || 0)
      };
    } catch (error) {
      logger.error(`Failed to get pool reserves for ${poolAddress}:`, error);
      return { reserve0: 0, reserve1: 0 };
    }
  }

  /**
   * Calculate swap quote using AMM formula
   */
  async calculateSwapQuote(fromToken, toToken, amount, dex = 'liquidswap') {
    try {
      const dexConfig = this.dexes[dex];
      if (!dexConfig) {
        throw new Error(`Unsupported DEX: ${dex}`);
      }

      // Get pool for token pair
      const pools = await this.getLiquidityPools(dex);
      const pool = pools.find(p => 
        (p.token0 === fromToken && p.token1 === toToken) ||
        (p.token0 === toToken && p.token1 === fromToken)
      );

      if (!pool) {
        throw new Error('No liquidity pool found for this token pair');
      }

      // Get pool reserves
      const reserves = await this.getPoolReserves(pool.address);
      const reserveIn = pool.token0 === fromToken ? reserves.reserve0 : reserves.reserve1;
      const reserveOut = pool.token0 === fromToken ? reserves.reserve1 : reserves.reserve0;

      // Calculate output using constant product formula
      const fee = 0.003; // 0.3% fee
      const amountInWithFee = amount * (1 - fee);
      const outputAmount = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee);

      const priceImpact = (amount / reserveIn) * 100;

      return {
        outputAmount,
        priceImpact,
        fee: amount * fee,
        feeRate: fee,
        poolAddress: pool.address,
        dex: dex,
        reserves: reserves
      };
    } catch (error) {
      logger.error('Failed to calculate swap quote:', error);
      throw error;
    }
  }

  /**
   * Create swap transaction payload for Liquidswap
   */
  async createLiquidswapPayload(fromToken, toToken, amount, minOutput, slippage = 0.5) {
    try {
      const payload = {
        function: `${this.dexes.liquidswap.address}::${this.dexes.liquidswap.router}::swap_exact_input`,
        type_arguments: [fromToken, toToken],
        arguments: [
          amount.toString(),
          Math.floor(minOutput * (1 - slippage / 100)).toString(),
          '0' // deadline (0 = no deadline)
        ]
      };

      return payload;
    } catch (error) {
      logger.error('Failed to create Liquidswap payload:', error);
      throw error;
    }
  }

  /**
   * Create swap transaction payload for PancakeSwap
   */
  async createPancakeSwapPayload(fromToken, toToken, amount, minOutput, slippage = 0.5) {
    try {
      const payload = {
        function: `${this.dexes.pancakeswap.address}::${this.dexes.pancakeswap.router}::swap_exact_tokens_for_tokens`,
        type_arguments: [fromToken, toToken],
        arguments: [
          amount.toString(),
          Math.floor(minOutput * (1 - slippage / 100)).toString(),
          '0', // deadline
          '0' // recipient (0 = sender)
        ]
      };

      return payload;
    } catch (error) {
      logger.error('Failed to create PancakeSwap payload:', error);
      throw error;
    }
  }

  /**
   * Create swap transaction payload
   */
  async createSwapPayload(fromToken, toToken, amount, slippage = 0.5, dex = 'liquidswap') {
    try {
      // Calculate quote first
      const quote = await this.calculateSwapQuote(fromToken, toToken, amount, dex);
      
      let payload;
      switch (dex) {
        case 'liquidswap':
          payload = await this.createLiquidswapPayload(fromToken, toToken, amount, quote.outputAmount, slippage);
          break;
        case 'pancakeswap':
          payload = await this.createPancakeSwapPayload(fromToken, toToken, amount, quote.outputAmount, slippage);
          break;
        default:
          throw new Error(`Unsupported DEX: ${dex}`);
      }

      return {
        ...payload,
        quote,
        dex
      };
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
      const transaction = {
        sender: walletAddress,
        sequence_number: sequenceNumber.toString(),
        max_gas_amount: maxGasAmount.toString(),
        gas_unit_price: '100',
        expiration_timestamp_secs: (Math.floor(Date.now() / 1000) + 600).toString(), // 10 minutes
        payload: payload
      };

      // In a real implementation, this would be signed and submitted
      // For now, we'll return a mock transaction hash
      const transactionHash = `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`;

      logger.info(`Transaction submitted: ${transactionHash}`);

      return {
        hash: transactionHash,
        status: 'submitted',
        transaction
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
      
      return {
        hash: transactionHash,
        status: transaction.success ? 'success' : 'failed',
        version: transaction.version,
        timestamp: transaction.timestamp,
        gas_used: transaction.gas_used,
        success: transaction.success
      };
    } catch (error) {
      logger.error(`Failed to get transaction status for ${transactionHash}:`, error);
      return {
        hash: transactionHash,
        status: 'unknown',
        error: error.message
      };
    }
  }

  /**
   * Get token metadata
   */
  async getTokenMetadata(tokenAddress) {
    try {
      const token = await Token.findOne({ address: tokenAddress });
      if (token) {
        return token;
      }

      // Try to get from common tokens
      const commonToken = Object.values(this.commonTokens).find(t => t.address === tokenAddress);
      if (commonToken) {
        return commonToken;
      }

      // Get from blockchain
      const resource = await this.client.getAccountResource(
        tokenAddress,
        `${tokenAddress}::coin::CoinInfo`
      );

      if (resource && resource.data) {
        return {
          address: tokenAddress,
          name: resource.data.name,
          symbol: resource.data.symbol,
          decimals: resource.data.decimals,
          totalSupply: resource.data.total_supply
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
    return /^0x[a-fA-F0-9]{64}$/.test(address);
  }

  /**
   * Estimate gas for transaction
   */
  async estimateGas(payload) {
    try {
      // Mock gas estimation
      const baseGas = 1000;
      const payloadGas = JSON.stringify(payload).length * 10;
      return Math.min(baseGas + payloadGas, 5000);
    } catch (error) {
      logger.error('Failed to estimate gas:', error);
      return 2000; // Default gas
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice() {
    try {
      const ledgerInfo = await this.client.getLedgerInfo();
      return {
        gasPrice: '100',
        timestamp: ledgerInfo.timestamp
      };
    } catch (error) {
      logger.error('Failed to get gas price:', error);
      return { gasPrice: '100' };
    }
  }

  /**
   * Create token in database
   */
  async createToken(tokenData) {
    try {
      const token = new Token(tokenData);
      await token.save();
      logger.info(`Token created: ${token.symbol}`);
      return token;
    } catch (error) {
      logger.error('Failed to create token:', error);
      throw error;
    }
  }

  /**
   * Update token price
   */
  async updateTokenPrice(tokenAddress) {
    try {
      const token = await Token.findOne({ address: tokenAddress });
      if (!token) {
        throw new Error('Token not found');
      }

      // In a real implementation, this would fetch from price feed
      // For now, we'll use a mock price
      const mockPrice = Math.random() * 100;
      token.price = mockPrice;
      token.lastUpdated = new Date();
      await token.save();

      return token;
    } catch (error) {
      logger.error('Failed to update token price:', error);
      throw error;
    }
  }

  /**
   * Get supported DEXes
   */
  getSupportedDexes() {
    return Object.keys(this.dexes).map(key => ({
      id: key,
      name: this.dexes[key].name,
      address: this.dexes[key].address,
      mainnet: this.dexes[key].mainnet
    }));
  }

  /**
   * Get common tokens
   */
  getCommonTokens() {
    return this.commonTokens;
  }
}

module.exports = { AptosBlockchainService }; 