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
      await TokenPrice.findOneAndUpdate(
        { symbol: priceData.symbol },
        {
          price: priceData.price,
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