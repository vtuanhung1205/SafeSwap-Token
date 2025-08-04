const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

async function testAutoWallet() {
  try {
    console.log('🧪 Testing Auto-Wallet Feature...\n');

    // Test 1: Google Authentication with auto-wallet creation
    console.log('1️⃣ Testing Google Authentication...');
    
    const googleData = {
      googleId: 'test_google_id_123',
      email: 'test@example.com',
      name: 'Test User',
      avatar: 'https://example.com/avatar.jpg'
    };

    const authResponse = await axios.post(`${BASE_URL}/auth/google`, googleData);
    
    if (authResponse.data.success) {
      console.log('✅ Google authentication successful');
      console.log('📧 User email:', authResponse.data.data.user.email);
      console.log('🆔 User ID:', authResponse.data.data.user._id);
      
      if (authResponse.data.data.wallet) {
        console.log('💰 Auto-created wallet:');
        console.log('   Address:', authResponse.data.data.wallet.address);
        console.log('   Name:', authResponse.data.data.wallet.name);
        console.log('   Source:', authResponse.data.data.wallet.metadata?.source);
        console.log('   Auto-created:', authResponse.data.data.autoWalletCreated);
      } else {
        console.log('❌ No wallet created');
      }
    } else {
      console.log('❌ Google authentication failed');
    }

    // Test 2: Get current user's wallet
    console.log('\n2️⃣ Testing Get Current Wallet...');
    
    const sessionId = authResponse.data.data.sessionId;
    const walletResponse = await axios.get(`${BASE_URL}/wallet/current`, {
      headers: {
        'Cookie': `sessionId=${sessionId}`
      }
    });

    if (walletResponse.data.success) {
      console.log('✅ Current wallet retrieved successfully');
      if (walletResponse.data.data.wallet) {
        console.log('💰 Wallet info:');
        console.log('   Address:', walletResponse.data.data.wallet.address);
        console.log('   Balance:', walletResponse.data.data.wallet.aptBalance);
        console.log('   Connected:', walletResponse.data.data.wallet.isConnected);
      } else {
        console.log('❌ No wallet found for user');
      }
    } else {
      console.log('❌ Failed to get current wallet');
    }

    // Test 3: Test with existing user (should not create new wallet)
    console.log('\n3️⃣ Testing with existing user...');
    
    const existingUserResponse = await axios.post(`${BASE_URL}/auth/google`, googleData);
    
    if (existingUserResponse.data.success) {
      console.log('✅ Existing user login successful');
      console.log('🔄 Auto-created wallet:', existingUserResponse.data.data.autoWalletCreated);
      
      if (existingUserResponse.data.data.wallet) {
        console.log('💰 Existing wallet found:', existingUserResponse.data.data.wallet.address);
      }
    }

    console.log('\n🎉 Auto-wallet test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAutoWallet(); 