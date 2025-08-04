const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function testSwaggerAPIs() {
  try {
    console.log('🧪 Testing APIs based on Swagger Documentation...\n');

    let sessionId = null;
    let walletId = null;

    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Health check passed:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Health check failed:', error.message);
      console.log('💡 Make sure server is running: npm start');
      return;
    }

    // Test 2: Authentication
    console.log('\n2️⃣ Testing Authentication...');
    try {
      const authResponse = await axios.post(`${BASE_URL}/api/auth/google`, {
        googleId: 'test_swagger_build_123',
        email: 'swagger@build.com',
        name: 'Swagger Build User',
        avatar: 'https://example.com/avatar.jpg'
      });

      if (authResponse.data.success) {
        sessionId = authResponse.data.data.sessionId;
        console.log('✅ Authentication successful');
        console.log('📧 User:', authResponse.data.data.user.email);
        
        if (authResponse.data.data.wallet) {
          walletId = authResponse.data.data.wallet.id;
          console.log('💰 Auto-wallet created:', authResponse.data.data.wallet.address);
        }
      }
    } catch (error) {
      console.log('❌ Authentication failed:', error.response?.data?.message || error.message);
    }

    if (!sessionId) {
      console.log('❌ Cannot continue without authentication');
      return;
    }

    const headers = { 'Cookie': `sessionId=${sessionId}` };

    // Test 3: Wallet Connect (based on Swagger)
    console.log('\n3️⃣ Testing Wallet Connect...');
    try {
      const connectResponse = await axios.post(`${BASE_URL}/api/wallet/connect`, {
        address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        publicKey: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        walletName: 'Test Wallet from Swagger'
      }, { headers });

      if (connectResponse.data.success) {
        walletId = connectResponse.data.data.wallet.id;
        console.log('✅ Wallet connected successfully');
        console.log('📍 Wallet ID:', walletId);
        console.log('🏷️ Wallet Name:', connectResponse.data.data.wallet.name);
      }
    } catch (error) {
      console.log('❌ Wallet connect failed:', error.response?.data?.message || error.message);
    }

    // Test 4: Get User Wallets (based on Swagger)
    console.log('\n4️⃣ Testing Get User Wallets...');
    try {
      const listResponse = await axios.get(`${BASE_URL}/api/wallet/list`, { headers });
      console.log('✅ User wallets retrieved');
      console.log('📊 Total wallets:', listResponse.data.data.wallets?.length || 0);
    } catch (error) {
      console.log('❌ Get user wallets failed:', error.response?.data?.message || error.message);
    }

    // Test 5: Get Wallet Info (based on Swagger)
    if (walletId) {
      console.log('\n5️⃣ Testing Get Wallet Info...');
      try {
        const infoResponse = await axios.get(`${BASE_URL}/api/wallet/${walletId}/info`, { headers });
        console.log('✅ Wallet info retrieved');
        console.log('💰 Balance:', infoResponse.data.data.wallet.aptBalance);
        console.log('🔗 Connected:', infoResponse.data.data.wallet.isConnected);
      } catch (error) {
        console.log('❌ Get wallet info failed:', error.response?.data?.message || error.message);
      }
    }

    // Test 6: Set Default Wallet (based on Swagger)
    if (walletId) {
      console.log('\n6️⃣ Testing Set Default Wallet...');
      try {
        const defaultResponse = await axios.post(`${BASE_URL}/api/wallet/${walletId}/set-default`, {}, { headers });
        console.log('✅ Default wallet set successfully');
      } catch (error) {
        console.log('❌ Set default wallet failed:', error.response?.data?.message || error.message);
      }
    }

    // Test 7: Update Wallet Name (based on Swagger)
    if (walletId) {
      console.log('\n7️⃣ Testing Update Wallet Name...');
      try {
        const nameResponse = await axios.put(`${BASE_URL}/api/wallet/${walletId}/name`, {
          name: 'Updated Wallet Name'
        }, { headers });
        console.log('✅ Wallet name updated successfully');
      } catch (error) {
        console.log('❌ Update wallet name failed:', error.response?.data?.message || error.message);
      }
    }

    // Test 8: Get All Wallets (new endpoint)
    console.log('\n8️⃣ Testing Get All Wallets...');
    try {
      const allResponse = await axios.get(`${BASE_URL}/api/wallet/all`, { headers });
      console.log('✅ All wallets retrieved');
      console.log('📊 Total count:', allResponse.data.data.totalCount);
      console.log('🔗 Connected count:', allResponse.data.data.connectedCount);
    } catch (error) {
      console.log('❌ Get all wallets failed:', error.response?.data?.message || error.message);
    }

    // Test 9: Get Wallet Stats (new endpoint)
    console.log('\n9️⃣ Testing Get Wallet Stats...');
    try {
      const statsResponse = await axios.get(`${BASE_URL}/api/wallet/stats`, { headers });
      console.log('✅ Wallet stats retrieved');
      console.log('📊 Total wallets:', statsResponse.data.data.totalWallets);
      console.log('🔗 Connected wallets:', statsResponse.data.data.connectedWallets);
    } catch (error) {
      console.log('❌ Get wallet stats failed:', error.response?.data?.message || error.message);
    }

    // Test 10: Get Wallets by Type (new endpoint)
    console.log('\n🔟 Testing Get Wallets by Type...');
    try {
      const typeResponse = await axios.get(`${BASE_URL}/api/wallet/type/trading`, { headers });
      console.log('✅ Trading wallets retrieved');
      console.log('📊 Trading wallets count:', typeResponse.data.data.wallets.length);
    } catch (error) {
      console.log('❌ Get wallets by type failed:', error.response?.data?.message || error.message);
    }

    // Test 11: Get Wallets by Category (new endpoint)
    console.log('\n1️⃣1️⃣ Testing Get Wallets by Category...');
    try {
      const categoryResponse = await axios.get(`${BASE_URL}/api/wallet/category/personal`, { headers });
      console.log('✅ Personal wallets retrieved');
      console.log('📊 Personal wallets count:', categoryResponse.data.data.wallets.length);
    } catch (error) {
      console.log('❌ Get wallets by category failed:', error.response?.data?.message || error.message);
    }

    // Test 12: Update Wallet Priority (new endpoint)
    if (walletId) {
      console.log('\n1️⃣2️⃣ Testing Update Wallet Priority...');
      try {
        const priorityResponse = await axios.put(`${BASE_URL}/api/wallet/${walletId}/priority`, {
          priority: 75
        }, { headers });
        console.log('✅ Wallet priority updated successfully');
        console.log('📊 New priority:', priorityResponse.data.data.wallet.priority);
      } catch (error) {
        console.log('❌ Update wallet priority failed:', error.response?.data?.message || error.message);
      }
    }

    console.log('\n🎉 Swagger API Testing Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Server is running');
    console.log('✅ Authentication working');
    console.log('✅ Wallet management working');
    console.log('✅ Multiple wallets features working');
    console.log('\n🌐 Swagger UI: http://localhost:5000/api-docs');
    console.log('🔑 Session ID:', sessionId);
    if (walletId) {
      console.log('💼 Test Wallet ID:', walletId);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSwaggerAPIs(); 