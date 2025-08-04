const axios = require('axios');

async function checkSwaggerUI() {
  try {
    console.log('🔍 Checking Swagger UI availability...\n');

    const baseURL = 'http://localhost:5000';
    
    // Check if server is running
    console.log('1️⃣ Checking server health...');
    try {
      const healthResponse = await axios.get(`${baseURL}/health`);
      console.log('✅ Server is running');
      console.log('📊 Health status:', healthResponse.data);
    } catch (error) {
      console.log('❌ Server is not running');
      console.log('💡 Please start the server with: npm start');
      return;
    }

    // Check Swagger UI
    console.log('\n2️⃣ Checking Swagger UI...');
    try {
      const swaggerResponse = await axios.get(`${baseURL}/api-docs`);
      console.log('✅ Swagger UI is accessible');
      console.log('🌐 Swagger URL: http://localhost:5000/api-docs');
    } catch (error) {
      console.log('❌ Swagger UI is not accessible');
      console.log('💡 Error:', error.message);
    }

    // Check API endpoints
    console.log('\n3️⃣ Checking API endpoints...');
    
    const endpoints = [
      '/api/auth/google',
      '/api/wallet/all',
      '/api/wallet/stats',
      '/api/wallet/current',
      '/api/swap/quote',
      '/api/price/all',
      '/api/tokens/all'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.get(`${baseURL}${endpoint}`);
        console.log(`✅ ${endpoint} - ${response.status}`);
      } catch (error) {
        if (error.response?.status === 401) {
          console.log(`🔒 ${endpoint} - Requires authentication (401)`);
        } else {
          console.log(`❌ ${endpoint} - ${error.response?.status || error.message}`);
        }
      }
    }

    console.log('\n🎉 Swagger UI Check Complete!');
    console.log('\n📋 How to test with Swagger:');
    console.log('1. Open browser and go to: http://localhost:5000/api-docs');
    console.log('2. You will see all available API endpoints');
    console.log('3. Click on any endpoint to expand it');
    console.log('4. Click "Try it out" to test the API');
    console.log('5. Fill in the required parameters');
    console.log('6. Click "Execute" to send the request');
    console.log('\n🔐 For authenticated endpoints:');
    console.log('1. First authenticate using /api/auth/google');
    console.log('2. Copy the sessionId from the response');
    console.log('3. In Swagger UI, click "Authorize" button');
    console.log('4. Enter the sessionId in the sessionAuth field');
    console.log('5. Now you can test authenticated endpoints');

  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

// Run the check
checkSwaggerUI(); 