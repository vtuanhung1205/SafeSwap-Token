const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testMultipleWallets() {
  try {
    console.log('🧪 Testing Multiple Wallets Feature...\n');

    // Test 1: Create user and first wallet
    console.log('1️⃣ Creating user and first wallet...');
    
    const googleData = {
      googleId: 'test_multiple_wallets_123',
      email: 'multiple@example.com',
      name: 'Multiple Wallets User',
      avatar: 'https://example.com/avatar.jpg'
    };

    const authResponse = await axios.post(`${BASE_URL}/auth/google`, googleData);
    
    if (authResponse.data.success) {
      console.log('✅ User created successfully');
      console.log('📧 User email:', authResponse.data.data.user.email);
      
      if (authResponse.data.data.wallet) {
        console.log('💰 Auto-created wallet:', authResponse.data.data.wallet.address);
        console.log('🏷️ Is default:', authResponse.data.data.wallet.isDefault);
      }
    }

    const sessionId = authResponse.data.data.sessionId;
    const headers = { 'Cookie': `sessionId=${sessionId}` };

    // Test 2: Connect additional wallets
    console.log('\n2️⃣ Connecting additional wallets...');
    
    const additionalWallets = [
      {
        address: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        publicKey: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        name: 'Trading Wallet',
        walletType: 'trading',
        category: 'trading'
      },
      {
        address: '0x2345678901bcdef12345678901bcdef12345678901bcdef12345678901bcdef',
        publicKey: '0xbcdef12345678901bcdef12345678901bcdef12345678901bcdef12345678901',
        name: 'Savings Wallet',
        walletType: 'savings',
        category: 'savings'
      },
      {
        address: '0x3456789012cdef123456789012cdef123456789012cdef123456789012cdef',
        publicKey: '0xcdef123456789012cdef123456789012cdef123456789012cdef123456789012',
        name: 'Gaming Wallet',
        walletType: 'custom',
        category: 'gaming'
      }
    ];

    for (let i = 0; i < additionalWallets.length; i++) {
      const wallet = additionalWallets[i];
      console.log(`\n   Connecting wallet ${i + 1}: ${wallet.name}`);
      
      try {
        const connectResponse = await axios.post(`${BASE_URL}/wallet/connect`, wallet, { headers });
        
        if (connectResponse.data.success) {
          console.log(`   ✅ ${wallet.name} connected successfully`);
          console.log(`   📍 Address: ${connectResponse.data.data.wallet.address}`);
          console.log(`   🏷️ Type: ${connectResponse.data.data.wallet.walletType}`);
          console.log(`   📂 Category: ${connectResponse.data.data.wallet.metadata.category}`);
        }
      } catch (error) {
        console.log(`   ❌ Failed to connect ${wallet.name}:`, error.response?.data?.message || error.message);
      }
    }

    // Test 3: Get all wallets
    console.log('\n3️⃣ Getting all user wallets...');
    
    const allWalletsResponse = await axios.get(`${BASE_URL}/wallet/all`, { headers });
    
    if (allWalletsResponse.data.success) {
      console.log('✅ All wallets retrieved successfully');
      console.log('📊 Total wallets:', allWalletsResponse.data.data.totalCount);
      console.log('🔗 Connected wallets:', allWalletsResponse.data.data.connectedCount);
      
      allWalletsResponse.data.data.wallets.forEach((wallet, index) => {
        console.log(`   ${index + 1}. ${wallet.name} (${wallet.walletType})`);
        console.log(`      Address: ${wallet.shortAddress}`);
        console.log(`      Category: ${wallet.metadata.category}`);
        console.log(`      Default: ${wallet.isDefault ? 'Yes' : 'No'}`);
        console.log(`      Priority: ${wallet.priority}`);
      });
    }

    // Test 4: Get wallet statistics
    console.log('\n4️⃣ Getting wallet statistics...');
    
    const statsResponse = await axios.get(`${BASE_URL}/wallet/stats`, { headers });
    
    if (statsResponse.data.success) {
      console.log('✅ Wallet statistics retrieved');
      console.log('📊 Total wallets:', statsResponse.data.data.totalWallets);
      console.log('🔗 Connected wallets:', statsResponse.data.data.connectedWallets);
      console.log('💰 Total balance:', statsResponse.data.data.totalBalance);
      
      if (statsResponse.data.data.walletsByType) {
        console.log('📂 Wallets by type:');
        statsResponse.data.data.walletsByType.forEach(type => {
          console.log(`   - ${type._id}: ${type.count}`);
        });
      }
      
      if (statsResponse.data.data.walletsByCategory) {
        console.log('📁 Wallets by category:');
        statsResponse.data.data.walletsByCategory.forEach(category => {
          console.log(`   - ${category._id}: ${category.count}`);
        });
      }
    }

    // Test 5: Get wallets by type
    console.log('\n5️⃣ Getting wallets by type...');
    
    const tradingWalletsResponse = await axios.get(`${BASE_URL}/wallet/type/trading`, { headers });
    
    if (tradingWalletsResponse.data.success) {
      console.log('✅ Trading wallets retrieved');
      console.log('📊 Trading wallets count:', tradingWalletsResponse.data.data.wallets.length);
    }

    // Test 6: Get wallets by category
    console.log('\n6️⃣ Getting wallets by category...');
    
    const savingsWalletsResponse = await axios.get(`${BASE_URL}/wallet/category/savings`, { headers });
    
    if (savingsWalletsResponse.data.success) {
      console.log('✅ Savings wallets retrieved');
      console.log('📊 Savings wallets count:', savingsWalletsResponse.data.data.wallets.length);
    }

    // Test 7: Set different wallet as default
    console.log('\n7️⃣ Setting different wallet as default...');
    
    if (allWalletsResponse.data.data.wallets.length > 1) {
      const secondWallet = allWalletsResponse.data.data.wallets[1];
      
      const setDefaultResponse = await axios.post(`${BASE_URL}/wallet/${secondWallet.id}/default`, {}, { headers });
      
      if (setDefaultResponse.data.success) {
        console.log('✅ Default wallet updated successfully');
        console.log('🏷️ New default wallet:', setDefaultResponse.data.data.wallet.name);
      }
    }

    // Test 8: Update wallet priority
    console.log('\n8️⃣ Updating wallet priority...');
    
    if (allWalletsResponse.data.data.wallets.length > 0) {
      const firstWallet = allWalletsResponse.data.data.wallets[0];
      
      const priorityResponse = await axios.put(`${BASE_URL}/wallet/${firstWallet.id}/priority`, 
        { priority: 75 }, { headers });
      
      if (priorityResponse.data.success) {
        console.log('✅ Wallet priority updated successfully');
        console.log('📊 New priority:', priorityResponse.data.data.wallet.priority);
      }
    }

    console.log('\n🎉 Multiple wallets test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testMultipleWallets(); 