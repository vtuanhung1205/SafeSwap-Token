const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testAllAPIs() {
  try {
    console.log('🧪 Testing All APIs...\n');

    let sessionId = null;

    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Health check passed:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      return;
    }

    // Test 2: Authentication
    console.log('\n2️⃣ Testing Authentication...');
    try {
      const authResponse = await axios.post(`${BASE_URL}/api/auth/google`, {
        googleId: 'test_all_apis_123',
        email: 'test@apis.com',
        name: 'API Test User',
        avatar: 'https://example.com/avatar.jpg'
      });

      if (authResponse.data.success) {
        sessionId = authResponse.data.data.sessionId;
        console.log('✅ Authentication successful');
        console.log('📧 User:', authResponse.data.data.user.email);
        console.log('💰 Auto-wallet created:', !!authResponse.data.data.wallet);
      }
    } catch (error) {
      console.log('❌ Authentication failed:', error.response?.data?.message || error.message);
    }

    if (!sessionId) {
      console.log('❌ Cannot continue without authentication');
      return;
    }

    const headers = { 'Cookie': `sessionId=${sessionId}` };

    // Test 3: Wallet APIs
    console.log('\n3️⃣ Testing Wallet APIs...');
    
    const walletTests = [
      {
        name: 'Get All Wallets',
        method: 'GET',
        url: '/api/wallet/all',
        data: null
      },
      {
        name: 'Get Current Wallet',
        method: 'GET',
        url: '/api/wallet/current',
        data: null
      },
      {
        name: 'Get Wallet Stats',
        method: 'GET',
        url: '/api/wallet/stats',
        data: null
      },
      {
        name: 'Connect New Wallet',
        method: 'POST',
        url: '/api/wallet/connect',
        data: {
          address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          publicKey: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          name: 'Test Wallet',
          walletType: 'trading',
          category: 'personal'
        }
      }
    ];

    for (const test of walletTests) {
      try {
        const response = await axios({
          method: test.method,
          url: `${BASE_URL}${test.url}`,
          headers: test.method === 'GET' ? headers : { ...headers, 'Content-Type': 'application/json' },
          data: test.data
        });

        console.log(`✅ ${test.name} - ${response.status}`);
        
        if (test.name === 'Connect New Wallet' && response.data.success) {
          console.log(`   📍 Wallet ID: ${response.data.data.wallet.id}`);
          console.log(`   🏷️ Type: ${response.data.data.wallet.walletType}`);
        }
      } catch (error) {
        console.log(`❌ ${test.name} - ${error.response?.status || error.message}`);
      }
    }

    // Test 4: Price APIs
    console.log('\n4️⃣ Testing Price APIs...');
    
    const priceTests = [
      {
        name: 'Get All Prices',
        method: 'GET',
        url: '/api/price/all'
      },
      {
        name: 'Get Exchange Rates',
        method: 'GET',
        url: '/api/price/exchange-rate'
      }
    ];

    for (const test of priceTests) {
      try {
        const response = await axios.get(`${BASE_URL}${test.url}`);
        console.log(`✅ ${test.name} - ${response.status}`);
      } catch (error) {
        console.log(`❌ ${test.name} - ${error.response?.status || error.message}`);
      }
    }

    // Test 5: Token APIs
    console.log('\n5️⃣ Testing Token APIs...');
    
    const tokenTests = [
      {
        name: 'Get All Tokens',
        method: 'GET',
        url: '/api/tokens/all'
      }
    ];

    for (const test of tokenTests) {
      try {
        const response = await axios.get(`${BASE_URL}${test.url}`);
        console.log(`✅ ${test.name} - ${response.status}`);
      } catch (error) {
        console.log(`❌ ${test.name} - ${error.response?.status || error.message}`);
      }
    }

    // Test 6: Swap APIs
    console.log('\n6️⃣ Testing Swap APIs...');
    
    const swapTests = [
      {
        name: 'Get Swap Quote',
        method: 'POST',
        url: '/api/swap/quote',
        data: {
          fromToken: 'APT',
          toToken: 'USDC',
          amount: 100
        }
      },
      {
        name: 'Get Swap History',
        method: 'GET',
        url: '/api/swap/history'
      },
      {
        name: 'Get Swap Stats',
        method: 'GET',
        url: '/api/swap/stats'
      }
    ];

    for (const test of swapTests) {
      try {
        const response = await axios({
          method: test.method,
          url: `${BASE_URL}${test.url}`,
          headers: test.method === 'GET' ? headers : { ...headers, 'Content-Type': 'application/json' },
          data: test.data
        });

        console.log(`✅ ${test.name} - ${response.status}`);
      } catch (error) {
        console.log(`❌ ${test.name} - ${error.response?.status || error.message}`);
      }
    }

    // Test 7: Multiple Wallets Features
    console.log('\n7️⃣ Testing Multiple Wallets Features...');
    
    const multipleWalletTests = [
      {
        name: 'Get Wallets by Type (trading)',
        method: 'GET',
        url: '/api/wallet/type/trading'
      },
      {
        name: 'Get Wallets by Category (personal)',
        method: 'GET',
        url: '/api/wallet/category/personal'
      }
    ];

    for (const test of multipleWalletTests) {
      try {
        const response = await axios.get(`${BASE_URL}${test.url}`, { headers });
        console.log(`✅ ${test.name} - ${response.status}`);
        if (response.data.success) {
          console.log(`   📊 Count: ${response.data.data.wallets.length}`);
        }
      } catch (error) {
        console.log(`❌ ${test.name} - ${error.response?.status || error.message}`);
      }
    }

    console.log('\n🎉 All API tests completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Open Swagger UI: http://localhost:5000/api-docs');
    console.log('2. Use sessionId for authentication:', sessionId);
    console.log('3. Test specific endpoints manually');
    console.log('4. Check server logs for detailed information');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testAllAPIs(); 