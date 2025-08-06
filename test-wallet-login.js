const axios = require('axios');

const API_BASE_URL = 'https://safeswap-backend-service.onrender.com/api';

// Test wallet login API
async function testWalletLogin() {
    try {
        console.log('Testing wallet login API...');
        
        // Test data
        const walletData = {
            walletAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
            signature: 'placeholder_signature_1234567890',
            message: 'Login to SafeSwap with wallet 0x1234567890123456789012345678901234567890123456789012345678901234 at 2024-01-01T00:00:00.000Z',
            walletType: 'petra'
        };
        
        const response = await axios.post(`${API_BASE_URL}/auth/wallet-login`, walletData);
        
        console.log('✅ Wallet login successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.error('❌ Wallet login failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        throw error;
    }
}

// Test wallet verification API
async function testWalletVerification() {
    try {
        console.log('\nTesting wallet verification API...');
        
        const walletData = {
            walletAddress: '0x1234567890123456789012345678901234567890123456789012345678901234',
            signature: 'placeholder_signature_1234567890',
            message: 'Verify wallet 0x1234567890123456789012345678901234567890123456789012345678901234 at 2024-01-01T00:00:00.000Z'
        };
        
        const response = await axios.post(`${API_BASE_URL}/auth/verify-wallet`, walletData);
        
        console.log('✅ Wallet verification successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.error('❌ Wallet verification failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        throw error;
    }
}

// Test get wallet info API
async function testGetWalletInfo() {
    try {
        console.log('\nTesting get wallet info API...');
        
        const address = '0x1234567890123456789012345678901234567890123456789012345678901234';
        const response = await axios.get(`${API_BASE_URL}/auth/wallet-info/${address}`);
        
        console.log('✅ Get wallet info successful!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        return response.data;
    } catch (error) {
        console.error('❌ Get wallet info failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        throw error;
    }
}

// Run all tests
async function runTests() {
    try {
        console.log('🚀 Starting wallet API tests...\n');
        
        await testWalletLogin();
        await testWalletVerification();
        await testGetWalletInfo();
        
        console.log('\n🎉 All tests completed successfully!');
    } catch (error) {
        console.error('\n💥 Some tests failed:', error.message);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests();
}

module.exports = {
    testWalletLogin,
    testWalletVerification,
    testGetWalletInfo,
    runTests
}; 