const axios = require('axios');

/**
 * Test script for optimized backend
 * Tests all major endpoints to ensure they work correctly
 */
class OptimizedBackendTester {
  constructor() {
    this.baseURL = process.env.TEST_BASE_URL || 'http://localhost:3001';
    this.sessionId = null;
    this.walletAddress = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  }

  /**
   * Make HTTP request with proper headers
   */
  async makeRequest(method, endpoint, data = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
        }
      };

      if (this.sessionId) {
        config.headers['X-Session-ID'] = this.sessionId;
      }

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return { success: true, data: response.data, status: response.status };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data || error.message, 
        status: error.response?.status || 500 
      };
    }
  }

  /**
   * Test health check
   */
  async testHealthCheck() {
    console.log('\n🔍 Testing Health Check...');
    const result = await this.makeRequest('GET', '/health');
    
    if (result.success) {
      console.log('✅ Health check passed');
      console.log(`   Status: ${result.data.status}`);
      console.log(`   Version: ${result.data.version}`);
    } else {
      console.log('❌ Health check failed');
      console.log(`   Error: ${result.error}`);
    }
  }

  /**
   * Test user endpoints
   */
  async testUserEndpoints() {
    console.log('\n👤 Testing User Endpoints...');

    // Test connect wallet
    console.log('   Testing wallet connection...');
    const connectResult = await this.makeRequest('POST', '/api/user/connect', {
      walletAddress: this.walletAddress,
      walletType: 'aptos'
    });

    if (connectResult.success) {
      console.log('✅ Wallet connected successfully');
      this.sessionId = connectResult.data.data.sessionId;
      console.log(`   Session ID: ${this.sessionId}`);
    } else {
      console.log('❌ Wallet connection failed');
      console.log(`   Error: ${connectResult.error}`);
    }

    // Test get current user
    console.log('   Testing get current user...');
    const userResult = await this.makeRequest('GET', '/api/user/me');
    
    if (userResult.success) {
      console.log('✅ Get current user successful');
      console.log(`   Wallet: ${userResult.data.data.walletAddress}`);
    } else {
      console.log('❌ Get current user failed');
      console.log(`   Error: ${userResult.error}`);
    }

    // Test session stats
    console.log('   Testing session stats...');
    const statsResult = await this.makeRequest('GET', '/api/user/stats');
    
    if (statsResult.success) {
      console.log('✅ Session stats retrieved');
      console.log(`   Active sessions: ${statsResult.data.data.activeSessions}`);
    } else {
      console.log('❌ Session stats failed');
      console.log(`   Error: ${statsResult.error}`);
    }
  }

  /**
   * Test token endpoints
   */
  async testTokenEndpoints() {
    console.log('\n🪙 Testing Token Endpoints...');

    // Test get all tokens
    console.log('   Testing get all tokens...');
    const allTokensResult = await this.makeRequest('GET', '/api/tokens/all');
    
    if (allTokensResult.success) {
      console.log('✅ All tokens retrieved');
      console.log(`   Token count: ${allTokensResult.data.data.count}`);
    } else {
      console.log('❌ Get all tokens failed');
      console.log(`   Error: ${allTokensResult.error}`);
    }

    // Test get tokens by platform
    console.log('   Testing get tokens by platform...');
    const platformResult = await this.makeRequest('GET', '/api/tokens/platform/aptos');
    
    if (platformResult.success) {
      console.log('✅ Platform tokens retrieved');
      console.log(`   Aptos tokens: ${platformResult.data.data.count}`);
    } else {
      console.log('❌ Get platform tokens failed');
      console.log(`   Error: ${platformResult.error}`);
    }

    // Test get token price
    console.log('   Testing get token price...');
    const priceResult = await this.makeRequest('GET', '/api/tokens/aptos/price');
    
    if (priceResult.success) {
      console.log('✅ Token price retrieved');
      console.log(`   APT price: $${priceResult.data.data.price}`);
    } else {
      console.log('❌ Get token price failed');
      console.log(`   Error: ${priceResult.error}`);
    }

    // Test search tokens
    console.log('   Testing search tokens...');
    const searchResult = await this.makeRequest('GET', '/api/tokens/search?query=bitcoin');
    
    if (searchResult.success) {
      console.log('✅ Token search successful');
      console.log(`   Results: ${searchResult.data.data.count}`);
    } else {
      console.log('❌ Token search failed');
      console.log(`   Error: ${searchResult.error}`);
    }
  }

  /**
   * Test swap endpoints
   */
  async testSwapEndpoints() {
    console.log('\n🔄 Testing Swap Endpoints...');

    // Test get quote
    console.log('   Testing get swap quote...');
    const quoteResult = await this.makeRequest('POST', '/api/swap/quote', {
      fromToken: 'aptos',
      toToken: 'usd-coin',
      amount: 10,
      slippage: 0.5,
      walletAddress: this.walletAddress
    });

    if (quoteResult.success) {
      console.log('✅ Swap quote generated');
      console.log(`   Quote ID: ${quoteResult.data.data.quoteId}`);
      console.log(`   Exchange rate: ${quoteResult.data.data.exchangeRate}`);
    } else {
      console.log('❌ Get swap quote failed');
      console.log(`   Error: ${quoteResult.error}`);
    }

    // Test execute swap
    console.log('   Testing execute swap...');
    const executeResult = await this.makeRequest('POST', '/api/swap/execute', {
      fromToken: 'aptos',
      toToken: 'usd-coin',
      fromAmount: 1,
      toAmount: 0.95,
      slippage: 0.5,
      walletAddress: this.walletAddress,
      signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    });

    if (executeResult.success) {
      console.log('✅ Swap executed');
      console.log(`   Transaction hash: ${executeResult.data.data.transactionHash}`);
      console.log(`   Status: ${executeResult.data.data.status}`);
    } else {
      console.log('❌ Execute swap failed');
      console.log(`   Error: ${executeResult.error}`);
    }
  }

  /**
   * Test transaction endpoints
   */
  async testTransactionEndpoints() {
    console.log('\n📊 Testing Transaction Endpoints...');

    // Test get transaction history
    console.log('   Testing get transaction history...');
    const historyResult = await this.makeRequest('GET', `/api/transactions/history?walletAddress=${this.walletAddress}`);
    
    if (historyResult.success) {
      console.log('✅ Transaction history retrieved');
      console.log(`   Transactions: ${historyResult.data.data.count}`);
    } else {
      console.log('❌ Get transaction history failed');
      console.log(`   Error: ${historyResult.error}`);
    }

    // Test get transaction stats
    console.log('   Testing get transaction stats...');
    const statsResult = await this.makeRequest('GET', `/api/transactions/stats?walletAddress=${this.walletAddress}`);
    
    if (statsResult.success) {
      console.log('✅ Transaction stats retrieved');
      console.log(`   Total transactions: ${statsResult.data.data.totalTransactions}`);
      console.log(`   Success rate: ${statsResult.data.data.successRate}%`);
    } else {
      console.log('❌ Get transaction stats failed');
      console.log(`   Error: ${statsResult.error}`);
    }

    // Test get volume 24h
    console.log('   Testing get 24h volume...');
    const volumeResult = await this.makeRequest('GET', '/api/transactions/volume-24h');
    
    if (volumeResult.success) {
      console.log('✅ 24h volume retrieved');
      console.log(`   Total volume: ${volumeResult.data.data.totalVolume}`);
      console.log(`   Transaction count: ${volumeResult.data.data.transactionCount}`);
    } else {
      console.log('❌ Get 24h volume failed');
      console.log(`   Error: ${volumeResult.error}`);
    }
  }

  /**
   * Test health checks for all services
   */
  async testServiceHealth() {
    console.log('\n🏥 Testing Service Health Checks...');

    const services = [
      { name: 'User Service', endpoint: '/api/user/health' },
      { name: 'Token Service', endpoint: '/api/tokens/health' },
      { name: 'Transaction Service', endpoint: '/api/transactions/health' },
      { name: 'Swap Service', endpoint: '/api/swap/health' }
    ];

    for (const service of services) {
      console.log(`   Testing ${service.name}...`);
      const result = await this.makeRequest('GET', service.endpoint);
      
      if (result.success) {
        console.log(`✅ ${service.name} healthy`);
      } else {
        console.log(`❌ ${service.name} unhealthy`);
        console.log(`   Error: ${result.error}`);
      }
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🚀 Starting Optimized Backend Tests...');
    console.log(`📍 Base URL: ${this.baseURL}`);
    console.log(`👛 Test Wallet: ${this.walletAddress}`);

    await this.testHealthCheck();
    await this.testUserEndpoints();
    await this.testTokenEndpoints();
    await this.testSwapEndpoints();
    await this.testTransactionEndpoints();
    await this.testServiceHealth();

    console.log('\n🎉 All tests completed!');
    
    if (this.sessionId) {
      console.log(`\n📝 Test Session ID: ${this.sessionId}`);
      console.log('💡 You can use this session ID for further testing');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new OptimizedBackendTester();
  tester.runAllTests().catch(console.error);
}

module.exports = OptimizedBackendTester; 