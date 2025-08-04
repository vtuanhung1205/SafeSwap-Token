const axios = require('axios');

/**
 * CoinGecko Service - Lấy token list và price data từ CoinGecko API
 * Tối ưu cho production, sử dụng cache để giảm API calls
 */
class CoinGeckoService {
  constructor() {
    this.baseURL = 'https://api.coingecko.com/api/v3';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Lấy danh sách tất cả tokens từ CoinGecko
   * @returns {Promise<Array>} Danh sách tokens với thông tin cơ bản
   */
  async getAllTokens() {
    try {
      const cacheKey = 'all_tokens';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${this.baseURL}/coins/list`);
      const tokens = response.data.map(token => ({
        id: token.id,
        symbol: token.symbol.toUpperCase(),
        name: token.name,
        platforms: token.platforms || {}
      }));

      this.setCachedData(cacheKey, tokens);
      return tokens;
    } catch (error) {
      console.error('Error fetching all tokens:', error.message);
      throw new Error('Failed to fetch token list');
    }
  }

  /**
   * Lấy danh sách tokens theo platform (ví dụ: aptos)
   * @param {string} platform - Platform name (aptos, ethereum, etc.)
   * @returns {Promise<Array>} Danh sách tokens của platform
   */
  async getTokensByPlatform(platform = 'aptos') {
    try {
      const cacheKey = `tokens_${platform}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${this.baseURL}/coins/list?include_platform=true`);
      const platformTokens = response.data
        .filter(token => token.platforms && token.platforms[platform])
        .map(token => ({
          id: token.id,
          symbol: token.symbol.toUpperCase(),
          name: token.name,
          contractAddress: token.platforms[platform]
        }));

      this.setCachedData(cacheKey, platformTokens);
      return platformTokens;
    } catch (error) {
      console.error(`Error fetching ${platform} tokens:`, error.message);
      throw new Error(`Failed to fetch ${platform} token list`);
    }
  }

  /**
   * Lấy thông tin chi tiết của một token
   * @param {string} tokenId - CoinGecko token ID
   * @returns {Promise<Object>} Thông tin chi tiết token
   */
  async getTokenInfo(tokenId) {
    try {
      const cacheKey = `token_info_${tokenId}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${this.baseURL}/coins/${tokenId}`);
      const tokenInfo = {
        id: response.data.id,
        symbol: response.data.symbol.toUpperCase(),
        name: response.data.name,
        description: response.data.description?.en || '',
        image: response.data.image?.large || '',
        marketCap: response.data.market_data?.market_cap?.usd || 0,
        volume24h: response.data.market_data?.total_volume?.usd || 0,
        price: response.data.market_data?.current_price?.usd || 0,
        priceChange24h: response.data.market_data?.price_change_percentage_24h || 0,
        platforms: response.data.platforms || {},
        links: response.data.links || {}
      };

      this.setCachedData(cacheKey, tokenInfo);
      return tokenInfo;
    } catch (error) {
      console.error(`Error fetching token info for ${tokenId}:`, error.message);
      throw new Error(`Failed to fetch token info for ${tokenId}`);
    }
  }

  /**
   * Lấy giá hiện tại của một token
   * @param {string} tokenId - CoinGecko token ID
   * @param {string} currency - Currency (usd, eur, etc.)
   * @returns {Promise<Object>} Giá token
   */
  async getTokenPrice(tokenId, currency = 'usd') {
    try {
      const cacheKey = `price_${tokenId}_${currency}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${this.baseURL}/simple/price`, {
        params: {
          ids: tokenId,
          vs_currencies: currency,
          include_24hr_change: true,
          include_market_cap: true,
          include_24hr_vol: true
        }
      });

      const priceData = {
        id: tokenId,
        price: response.data[tokenId]?.[currency] || 0,
        priceChange24h: response.data[tokenId]?.[`${currency}_24h_change`] || 0,
        marketCap: response.data[tokenId]?.[`${currency}_market_cap`] || 0,
        volume24h: response.data[tokenId]?.[`${currency}_24h_vol`] || 0,
        lastUpdated: new Date().toISOString()
      };

      this.setCachedData(cacheKey, priceData);
      return priceData;
    } catch (error) {
      console.error(`Error fetching price for ${tokenId}:`, error.message);
      throw new Error(`Failed to fetch price for ${tokenId}`);
    }
  }

  /**
   * Lấy giá của nhiều tokens cùng lúc
   * @param {Array<string>} tokenIds - Array of token IDs
   * @param {string} currency - Currency (usd, eur, etc.)
   * @returns {Promise<Object>} Giá của tất cả tokens
   */
  async getMultipleTokenPrices(tokenIds, currency = 'usd') {
    try {
      const cacheKey = `prices_${tokenIds.sort().join('_')}_${currency}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${this.baseURL}/simple/price`, {
        params: {
          ids: tokenIds.join(','),
          vs_currencies: currency,
          include_24hr_change: true,
          include_market_cap: true,
          include_24hr_vol: true
        }
      });

      const prices = {};
      tokenIds.forEach(tokenId => {
        prices[tokenId] = {
          id: tokenId,
          price: response.data[tokenId]?.[currency] || 0,
          priceChange24h: response.data[tokenId]?.[`${currency}_24h_change`] || 0,
          marketCap: response.data[tokenId]?.[`${currency}_market_cap`] || 0,
          volume24h: response.data[tokenId]?.[`${currency}_24h_vol`] || 0,
          lastUpdated: new Date().toISOString()
        };
      });

      this.setCachedData(cacheKey, prices);
      return prices;
    } catch (error) {
      console.error('Error fetching multiple token prices:', error.message);
      throw new Error('Failed to fetch multiple token prices');
    }
  }

  /**
   * Tìm kiếm token theo tên hoặc symbol
   * @param {string} query - Từ khóa tìm kiếm
   * @returns {Promise<Array>} Kết quả tìm kiếm
   */
  async searchTokens(query) {
    try {
      const cacheKey = `search_${query.toLowerCase()}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${this.baseURL}/search`, {
        params: { query }
      });

      const results = response.data.coins.map(coin => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        marketCapRank: coin.market_cap_rank,
        image: coin.large
      }));

      this.setCachedData(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Error searching tokens:', error.message);
      throw new Error('Failed to search tokens');
    }
  }

  /**
   * Lấy trending tokens
   * @returns {Promise<Array>} Danh sách trending tokens
   */
  async getTrendingTokens() {
    try {
      const cacheKey = 'trending_tokens';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;

      const response = await axios.get(`${this.baseURL}/search/trending`);
      const trending = response.data.coins.map(coin => ({
        id: coin.item.id,
        symbol: coin.item.symbol.toUpperCase(),
        name: coin.item.name,
        marketCapRank: coin.item.market_cap_rank,
        image: coin.item.large,
        priceChange24h: coin.item.price_change_percentage_24h?.usd || 0
      }));

      this.setCachedData(cacheKey, trending);
      return trending;
    } catch (error) {
      console.error('Error fetching trending tokens:', error.message);
      throw new Error('Failed to fetch trending tokens');
    }
  }

  /**
   * Cache management methods
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * Health check cho CoinGecko API
   * @returns {Promise<boolean>} API có hoạt động không
   */
  async healthCheck() {
    try {
      const response = await axios.get(`${this.baseURL}/ping`);
      return response.status === 200;
    } catch (error) {
      console.error('CoinGecko API health check failed:', error.message);
      return false;
    }
  }
}

module.exports = new CoinGeckoService(); 