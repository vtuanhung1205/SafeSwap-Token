const cron = require('node-cron');
const { logger } = require('../utils/logger');
const { PriceFeedService } = require('../services/priceFeed.service');
const { TokenPrice } = require('../models/TokenPrice.model');

const priceFeedService = new PriceFeedService();

// Danh sách các token phổ biến cần cập nhật
const popularTokens = ['BTC', 'ETH', 'APT', 'SOL', 'USDC', 'USDT'];

/**
 * Cập nhật giá cho một token cụ thể vào database.
 * @param {string} symbol - Ký hiệu của token (ví dụ: 'BTC').
 */
const updateTokenPrice = async (symbol) => {
  try {
    const priceData = await priceFeedService.getTokenPrice(symbol);
    if (priceData) {
      // Map symbols to token addresses
      const tokenAddressMap = {
        'BTC': '0x1::aptos_coin::AptosCoin',
        'ETH': '0x1::ethereum_coin::EthereumCoin',
        'APT': '0x1::aptos_coin::AptosCoin',
        'SOL': '0x1::solana_coin::SolanaCoin',
        'USDC': '0x1::usd_coin::USDCoin',
        'USDT': '0x1::tether::Tether'
      };

      const tokenAddress = tokenAddressMap[symbol] || `0x1::${symbol.toLowerCase()}::${symbol}`;

      await TokenPrice.findOneAndUpdate(
        { symbol: priceData.symbol },
        {
          tokenAddress: tokenAddress,
          price: priceData.price,
          priceUSD: priceData.price, // Use same price for USD
          change24h: priceData.change24h,
          marketCap: priceData.marketCap,
          volume24h: priceData.volume24h,
          source: priceData.source,
          lastUpdated: new Date(priceData.timestamp),
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      logger.info(`Updated price for ${symbol}: $${priceData.price}`);
    }
  } catch (error) {
    logger.error(`Failed to update price for ${symbol}: ${error.message}`);
  }
};

/**
 * Tác vụ cron job để cập nhật giá của các token phổ biến.
 * Chạy mỗi 5 phút.
 */
const schedulePriceUpdates = () => {
  logger.info('Scheduling price update job. It will run every 5 minutes.');
  
  // Chạy ngay một lần khi khởi động
  logger.info('Running initial price update...');
  popularTokens.forEach(updateTokenPrice);

  // Lên lịch chạy định kỳ
  cron.schedule('*/5 * * * *', () => {
    logger.info('Running scheduled price update for popular tokens...');
    popularTokens.forEach(updateTokenPrice);
  });
};

module.exports = { schedulePriceUpdates }; 