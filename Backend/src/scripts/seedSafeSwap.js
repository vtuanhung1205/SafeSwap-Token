const mongoose = require('mongoose');
const { LiquidityPool } = require('../models/LiquidityPool.model');
const { Token } = require('../models/Token.model');
const { TokenPrice } = require('../models/TokenPrice.model');
const { logger } = require('../utils/logger');

// SafeSwap token data
const safeswapToken = {
  symbol: 'SAFESWAP',
  name: 'SafeSwap Token',
  address: '0x1234567890123456789012345678901234567890123456789012345678901234::safeswap_coin::SafeSwapCoin',
  decimals: 8,
  totalSupply: 1000000000,
  isNative: false,
  chainId: 'aptos-testnet',
  coingeckoId: 'safeswap',
  price: 0.1,
  priceUSD: 0.1,
  change24h: 5.2,
  marketCap: 100000000,
  volume24h: 5000000,
  circulatingSupply: 800000000,
  maxSupply: 1000000000,
  description: 'SafeSwap is the native token of the SafeSwap DEX on Aptos',
  website: 'https://safeswap.aptos.com',
  twitter: '@SafeSwapAptos',
  telegram: '@SafeSwapAptos',
  github: 'https://github.com/safeswap',
  verified: true,
  riskScore: 10,
  riskFactors: []
};

// Common tokens
const commonTokens = [
  {
    symbol: 'APT',
    name: 'Aptos',
    address: '0x1::aptos_coin::AptosCoin',
    decimals: 8,
    isNative: true,
    chainId: 'aptos-testnet',
    coingeckoId: 'aptos',
    price: 8.5,
    priceUSD: 8.5,
    change24h: 2.1,
    marketCap: 8500000000,
    volume24h: 150000000,
    circulatingSupply: 1000000000,
    maxSupply: 1000000000,
    description: 'Aptos is a Layer 1 blockchain designed for safety, extensibility, and upgradeability',
    website: 'https://aptos.dev',
    twitter: '@Aptos_Network',
    telegram: '@AptosNetwork',
    github: 'https://github.com/aptos-labs',
    verified: true,
    riskScore: 5,
    riskFactors: []
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
    decimals: 6,
    isNative: false,
    chainId: 'aptos-testnet',
    coingeckoId: 'usd-coin',
    price: 1.0,
    priceUSD: 1.0,
    change24h: 0.0,
    marketCap: 25000000000,
    volume24h: 5000000000,
    circulatingSupply: 25000000000,
    maxSupply: 25000000000,
    description: 'USD Coin is a stablecoin pegged to the US dollar',
    website: 'https://www.circle.com/en/usdc',
    twitter: '@circle',
    telegram: '@CircleUSDC',
    github: 'https://github.com/circle',
    verified: true,
    riskScore: 5,
    riskFactors: []
  },
  {
    symbol: 'USDT',
    name: 'Tether USD',
    address: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT',
    decimals: 6,
    isNative: false,
    chainId: 'aptos-testnet',
    coingeckoId: 'tether',
    price: 1.0,
    priceUSD: 1.0,
    change24h: 0.0,
    marketCap: 95000000000,
    volume24h: 80000000000,
    circulatingSupply: 95000000000,
    maxSupply: 95000000000,
    description: 'Tether is a stablecoin pegged to the US dollar',
    website: 'https://tether.to',
    twitter: '@Tether_to',
    telegram: '@TetherNews',
    github: 'https://github.com/tetherto',
    verified: true,
    riskScore: 5,
    riskFactors: []
  }
];

// SafeSwap liquidity pools
const safeswapPools = [
  {
    poolId: 'safeswap_apt_usdc_001',
    poolAddress: '0x1234567890123456789012345678901234567890123456789012345678901234::safeswap_pools::Pool<0x1::aptos_coin::AptosCoin, 0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC>',
    token0: '0x1::aptos_coin::AptosCoin',
    token1: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
    symbol0: 'APT',
    symbol1: 'USDC',
    reserve0: 1000000, // 1M APT
    reserve1: 8500000, // 8.5M USDC
    totalSupply: 1000000,
    fee: 0.003,
    feeRate: 0.3,
    volume24h: 500000,
    volume7d: 3500000,
    fees24h: 1500,
    fees7d: 10500,
    price0: 8.5,
    price1: 1.0,
    price0USD: 8.5,
    price1USD: 1.0,
    tvl: 17000000,
    tvlUSD: 17000000,
    riskScore: 15,
    riskFactors: [],
    isActive: true,
    dex: 'safeswap',
    chainId: 'aptos-testnet',
    createdAt: new Date(),
    lastUpdated: new Date()
  },
  {
    poolId: 'safeswap_apt_safeswap_001',
    poolAddress: '0x1234567890123456789012345678901234567890123456789012345678901234::safeswap_pools::Pool<0x1::aptos_coin::AptosCoin, 0x1234567890123456789012345678901234567890123456789012345678901234::safeswap_coin::SafeSwapCoin>',
    token0: '0x1::aptos_coin::AptosCoin',
    token1: '0x1234567890123456789012345678901234567890123456789012345678901234::safeswap_coin::SafeSwapCoin',
    symbol0: 'APT',
    symbol1: 'SAFESWAP',
    reserve0: 500000, // 500K APT
    reserve1: 5000000, // 5M SAFESWAP
    totalSupply: 500000,
    fee: 0.003,
    feeRate: 0.3,
    volume24h: 250000,
    volume7d: 1750000,
    fees24h: 750,
    fees7d: 5250,
    price0: 8.5,
    price1: 0.1,
    price0USD: 8.5,
    price1USD: 0.1,
    tvl: 8500000,
    tvlUSD: 8500000,
    riskScore: 20,
    riskFactors: ['new_pool'],
    isActive: true,
    dex: 'safeswap',
    chainId: 'aptos-testnet',
    createdAt: new Date(),
    lastUpdated: new Date()
  },
  {
    poolId: 'safeswap_usdc_safeswap_001',
    poolAddress: '0x1234567890123456789012345678901234567890123456789012345678901234::safeswap_pools::Pool<0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC, 0x1234567890123456789012345678901234567890123456789012345678901234::safeswap_coin::SafeSwapCoin>',
    token0: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC',
    token1: '0x1234567890123456789012345678901234567890123456789012345678901234::safeswap_coin::SafeSwapCoin',
    symbol0: 'USDC',
    symbol1: 'SAFESWAP',
    reserve0: 1000000, // 1M USDC
    reserve1: 10000000, // 10M SAFESWAP
    totalSupply: 1000000,
    fee: 0.003,
    feeRate: 0.3,
    volume24h: 100000,
    volume7d: 700000,
    fees24h: 300,
    fees7d: 2100,
    price0: 1.0,
    price1: 0.1,
    price0USD: 1.0,
    price1USD: 0.1,
    tvl: 2000000,
    tvlUSD: 2000000,
    riskScore: 25,
    riskFactors: ['new_pool', 'new_token'],
    isActive: true,
    dex: 'safeswap',
    chainId: 'aptos-testnet',
    createdAt: new Date(),
    lastUpdated: new Date()
  }
];

async function seedSafeSwap() {
  try {
    logger.info('Starting SafeSwap seeding...');

    // Seed tokens
    logger.info('Seeding tokens...');
    for (const tokenData of [safeswapToken, ...commonTokens]) {
      const existingToken = await Token.findOne({ address: tokenData.address });
      if (!existingToken) {
        const token = new Token(tokenData);
        await token.save();
        logger.info(`Created token: ${token.symbol}`);
      } else {
        logger.info(`Token already exists: ${tokenData.symbol}`);
      }
    }

    // Seed token prices
    logger.info('Seeding token prices...');
    for (const tokenData of [safeswapToken, ...commonTokens]) {
      const existingPrice = await TokenPrice.findOne({ tokenAddress: tokenData.address });
      if (!existingPrice) {
        const tokenPrice = new TokenPrice({
          tokenAddress: tokenData.address,
          symbol: tokenData.symbol,
          price: tokenData.price,
          priceUSD: tokenData.priceUSD,
          change24h: tokenData.change24h,
          marketCap: tokenData.marketCap,
          volume24h: tokenData.volume24h,
          lastUpdated: new Date()
        });
        await tokenPrice.save();
        logger.info(`Created price for: ${tokenData.symbol}`);
      } else {
        logger.info(`Price already exists for: ${tokenData.symbol}`);
      }
    }

    // Seed liquidity pools
    logger.info('Seeding liquidity pools...');
    for (const poolData of safeswapPools) {
      const existingPool = await LiquidityPool.findOne({ poolId: poolData.poolId });
      if (!existingPool) {
        const pool = new LiquidityPool(poolData);
        await pool.save();
        logger.info(`Created pool: ${pool.symbol0}/${pool.symbol1}`);
      } else {
        logger.info(`Pool already exists: ${poolData.symbol0}/${poolData.symbol1}`);
      }
    }

    logger.info('SafeSwap seeding completed successfully!');
  } catch (error) {
    logger.error('Error seeding SafeSwap:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  const { connectDatabase } = require('../config/database');
  
  connectDatabase()
    .then(() => {
      logger.info('Database connected, starting seeding...');
      return seedSafeSwap();
    })
    .then(() => {
      logger.info('Seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedSafeSwap }; 