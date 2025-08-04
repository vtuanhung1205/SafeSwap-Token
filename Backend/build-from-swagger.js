const axios = require('axios');

const BASE_URL = 'http://localhost:5000';

async function buildFromSwagger() {
  try {
    console.log('🏗️ Building and Testing from Swagger Documentation...\n');

    let sessionId = null;
    let walletIds = [];

    // Step 1: Health Check
    console.log('1️⃣ Checking Server Health...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Server is healthy:', healthResponse.data.status);
    } catch (error) {
      console.log('❌ Server is not running');
      console.log('💡 Start server with: npm start');
      return;
    }

    // Step 2: Authentication
    console.log('\n2️⃣ Authenticating User...');
    try {
      const authResponse = await axios.post(`${BASE_URL}/api/auth/google`, {
        googleId: 'build_swagger_123',
        email: 'build@swagger.com',
        name: 'Build Swagger User',
        avatar: 'https://example.com/avatar.jpg'
      });

      if (authResponse.data.success) {
        sessionId = authResponse.data.data.sessionId;
        console.log('✅ Authentication successful');
        console.log('📧 User:', authResponse.data.data.user.email);
        
        if (authResponse.data.data.wallet) {
          walletIds.push(authResponse.data.data.wallet.id);
          console.log('💰 Auto-wallet created:', authResponse.data.data.wallet.address);
        }
      }
    } catch (error) {
      console.log('❌ Authentication failed:', error.response?.data?.message || error.message);
      return;
    }

    const headers = { 'Cookie': `sessionId=${sessionId}` };

    // Step 3: Create Multiple Wallets
    console.log('\n3️⃣ Creating Multiple Wallets...');
    
    const walletConfigs = [
      {
        name: 'Primary Wallet',
        address: '0x1111111111111111111111111111111111111111111111111111111111111111',
        publicKey: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        type: 'primary',
        category: 'personal'
      },
      {
        name: 'Trading Wallet',
        address: '0x2222222222222222222222222222222222222222222222222222222222222222',
        publicKey: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        type: 'trading',
        category: 'trading'
      },
      {
        name: 'Savings Wallet',
        address: '0x3333333333333333333333333333333333333333333333333333333333333333',
        publicKey: '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        type: 'savings',
        category: 'savings'
      }
    ];

    for (const config of walletConfigs) {
      try {
        const connectResponse = await axios.post(`${BASE_URL}/api/wallet/connect`, {
          address: config.address,
          publicKey: config.publicKey,
          walletName: config.name,
          walletType: config.type,
          category: config.category
        }, { headers });

        if (connectResponse.data.success) {
          walletIds.push(connectResponse.data.data.wallet.id);
          console.log(`✅ ${config.name} created:`, connectResponse.data.data.wallet.address);
        }
      } catch (error) {
        console.log(`❌ Failed to create ${config.name}:`, error.response?.data?.message || error.message);
      }
    }

    // Step 4: Test All Wallet Endpoints
    console.log('\n4️⃣ Testing All Wallet Endpoints...');

    // Test Get All Wallets
    try {
      const allWalletsResponse = await axios.get(`${BASE_URL}/api/wallet/all`, { headers });
      console.log('✅ Get All Wallets:', allWalletsResponse.data.data.totalCount, 'wallets');
    } catch (error) {
      console.log('❌ Get All Wallets failed:', error.response?.data?.message || error.message);
    }

    // Test Get Wallet Stats
    try {
      const statsResponse = await axios.get(`${BASE_URL}/api/wallet/stats`, { headers });
      console.log('✅ Get Wallet Stats:', statsResponse.data.data.totalWallets, 'total wallets');
    } catch (error) {
      console.log('❌ Get Wallet Stats failed:', error.response?.data?.message || error.message);
    }

    // Test Get Wallets by Type
    try {
      const tradingResponse = await axios.get(`${BASE_URL}/api/wallet/type/trading`, { headers });
      console.log('✅ Get Trading Wallets:', tradingResponse.data.data.wallets.length, 'wallets');
    } catch (error) {
      console.log('❌ Get Trading Wallets failed:', error.response?.data?.message || error.message);
    }

    // Test Get Wallets by Category
    try {
      const personalResponse = await axios.get(`${BASE_URL}/api/wallet/category/personal`, { headers });
      console.log('✅ Get Personal Wallets:', personalResponse.data.data.wallets.length, 'wallets');
    } catch (error) {
      console.log('❌ Get Personal Wallets failed:', error.response?.data?.message || error.message);
    }

    // Step 5: Test Individual Wallet Operations
    if (walletIds.length > 0) {
      console.log('\n5️⃣ Testing Individual Wallet Operations...');
      
      const testWalletId = walletIds[0];

      // Test Get Wallet Info
      try {
        const infoResponse = await axios.get(`${BASE_URL}/api/wallet/${testWalletId}/info`, { headers });
        console.log('✅ Get Wallet Info:', infoResponse.data.data.wallet.name);
      } catch (error) {
        console.log('❌ Get Wallet Info failed:', error.response?.data?.message || error.message);
      }

      // Test Set Default Wallet
      try {
        const defaultResponse = await axios.post(`${BASE_URL}/api/wallet/${testWalletId}/set-default`, {}, { headers });
        console.log('✅ Set Default Wallet successful');
      } catch (error) {
        console.log('❌ Set Default Wallet failed:', error.response?.data?.message || error.message);
      }

      // Test Update Wallet Name
      try {
        const nameResponse = await axios.put(`${BASE_URL}/api/wallet/${testWalletId}/name`, {
          name: 'Updated Wallet Name'
        }, { headers });
        console.log('✅ Update Wallet Name successful');
      } catch (error) {
        console.log('❌ Update Wallet Name failed:', error.response?.data?.message || error.message);
      }

      // Test Update Wallet Priority
      try {
        const priorityResponse = await axios.put(`${BASE_URL}/api/wallet/${testWalletId}/priority`, {
          priority: 75
        }, { headers });
        console.log('✅ Update Wallet Priority successful');
      } catch (error) {
        console.log('❌ Update Wallet Priority failed:', error.response?.data?.message || error.message);
      }
    }

    // Step 6: Test Other APIs
    console.log('\n6️⃣ Testing Other APIs...');

    // Test Price APIs
    try {
      const priceResponse = await axios.get(`${BASE_URL}/api/price/all`);
      console.log('✅ Get All Prices successful');
    } catch (error) {
      console.log('❌ Get All Prices failed:', error.response?.data?.message || error.message);
    }

    // Test Token APIs
    try {
      const tokenResponse = await axios.get(`${BASE_URL}/api/tokens/all`);
      console.log('✅ Get All Tokens successful');
    } catch (error) {
      console.log('❌ Get All Tokens failed:', error.response?.data?.message || error.message);
    }

    // Test Swap APIs
    try {
      const swapResponse = await axios.post(`${BASE_URL}/api/swap/quote`, {
        fromToken: 'APT',
        toToken: 'USDC',
        amount: 100
      }, { headers });
      console.log('✅ Get Swap Quote successful');
    } catch (error) {
      console.log('❌ Get Swap Quote failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Build from Swagger Completed!');
    console.log('\n📊 Summary:');
    console.log('✅ Server is running and healthy');
    console.log('✅ Authentication working');
    console.log('✅ Multiple wallets created:', walletIds.length);
    console.log('✅ All wallet endpoints tested');
    console.log('✅ Other APIs tested');
    console.log('\n🌐 Swagger UI: http://localhost:5000/api-docs');
    console.log('🔑 Session ID:', sessionId);
    console.log('💼 Wallet IDs:', walletIds.join(', '));

  } catch (error) {
    console.error('❌ Build failed:', error.message);
  }
}

// Run the build
buildFromSwagger(); 