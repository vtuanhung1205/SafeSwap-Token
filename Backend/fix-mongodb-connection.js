const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing MongoDB Connection String...');
console.log('=====================================');

// Your current connection string
const currentURI = 'mongodb+srv://safeswap_user:safeswap123@safeswap.6pk7wds.mongodb.net/?retryWrites=true&w=majority';

// Fixed connection string with database name
const fixedURI = 'mongodb+srv://safeswap_user:safeswap123@safeswap.6pk7wds.mongodb.net/safeswap?retryWrites=true&w=majority';

// Read current .env file
const envPath = path.join(__dirname, '.env');
let envContent = '';

if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Found existing .env file');
} else {
  console.log('⚠️  No .env file found, creating new one...');
}

// Replace or add MONGODB_URI
if (envContent.includes('MONGODB_URI=')) {
  // Replace existing MONGODB_URI
  envContent = envContent.replace(
    /MONGODB_URI=.*/g,
    `MONGODB_URI=${fixedURI}`
  );
  console.log('✅ Updated existing MONGODB_URI');
} else {
  // Add MONGODB_URI if not exists
  envContent += `\nMONGODB_URI=${fixedURI}`;
  console.log('✅ Added MONGODB_URI');
}

// Replace or add MONGODB_URI_PROD
if (envContent.includes('MONGODB_URI_PROD=')) {
  envContent = envContent.replace(
    /MONGODB_URI_PROD=.*/g,
    `MONGODB_URI_PROD=${fixedURI}`
  );
  console.log('✅ Updated existing MONGODB_URI_PROD');
} else {
  envContent += `\nMONGODB_URI_PROD=${fixedURI}`;
  console.log('✅ Added MONGODB_URI_PROD');
}

// Ensure other required variables exist
const requiredVars = {
  'PORT': '3001',
  'NODE_ENV': 'development',
  'JWT_SECRET': 'safeswap-super-secret-jwt-key-2024',
  'JWT_EXPIRES_IN': '7d',
  'APTOS_NODE_URL': 'https://fullnode.mainnet.aptoslabs.com/v1',
  'APTOS_FAUCET_URL': 'https://faucet.mainnet.aptoslabs.com',
  'APTOS_NETWORK': 'mainnet',
  'RATE_LIMIT_WINDOW_MS': '900000',
  'RATE_LIMIT_MAX_REQUESTS': '100',
  'LOG_LEVEL': 'info',
  'WS_PORT': '3002',
  'COINGECKO_API_URL': 'https://api.coingecko.com/api/v3'
};

Object.entries(requiredVars).forEach(([key, value]) => {
  if (!envContent.includes(`${key}=`)) {
    envContent += `\n${key}=${value}`;
    console.log(`✅ Added ${key}`);
  }
});

// Write the updated .env file
fs.writeFileSync(envPath, envContent);

console.log('');
console.log('✅ MongoDB connection string fixed!');
console.log('');
console.log('📋 Changes made:');
console.log(`- Added database name: /safeswap`);
console.log(`- Updated MONGODB_URI: ${fixedURI}`);
console.log(`- Updated MONGODB_URI_PROD: ${fixedURI}`);
console.log('');
console.log('🧪 Testing connection...');
console.log('Run: npm start'); 