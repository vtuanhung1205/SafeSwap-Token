const axios = require('axios');

const testCors = async () => {
  const baseURL = 'https://safeswap-backend-service.onrender.com';
  
  try {
    console.log('Testing CORS configuration...');
    
    // Test 1: Health check
    console.log('\n1. Testing health check...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('Health check successful:', healthResponse.status);
    
    // Test 2: CORS test endpoint
    console.log('\n2. Testing CORS test endpoint...');
    const corsResponse = await axios.get(`${baseURL}/cors-test`, {
      headers: {
        'Origin': 'https://safeswap-frontend.onrender.com'
      }
    });
    console.log('CORS test successful:', corsResponse.data);
    
    // Test 3: OPTIONS preflight request
    console.log('\n3. Testing OPTIONS preflight...');
    const optionsResponse = await axios.options(`${baseURL}/api/auth/google`, {
      headers: {
        'Origin': 'https://safeswap-frontend.onrender.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    console.log('OPTIONS preflight successful:', optionsResponse.status);
    console.log('CORS headers:', {
      'Access-Control-Allow-Origin': optionsResponse.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': optionsResponse.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': optionsResponse.headers['access-control-allow-headers']
    });
    
  } catch (error) {
    console.error('CORS test failed:', error.response?.data || error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response headers:', error.response.headers);
    }
  }
};

testCors(); 