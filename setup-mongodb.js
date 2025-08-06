// MongoDB Atlas Setup Helper
const fs = require('fs');
const path = require('path');

console.log('🗄️  MongoDB Atlas Setup Helper');
console.log('==============================');

const envContent = `# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration - Replace with your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://safeswap_user:YOUR_PASSWORD@cluster0.mongodb.net/safeswap?retryWrites=true&w=majority
MONGODB_URI_PROD=mongodb+srv://safeswap_user:YOUR_PASSWORD@cluster0.mongodb.net/safeswap?retryWrites=true&w=majority

# Aptos Configuration
APTOS_NODE_URL=https://fullnode.mainnet.aptoslabs.com/v1
APTOS_FAUCET_URL=https://faucet.mainnet.aptoslabs.com
APTOS_NETWORK=mainnet

# JWT Configuration
JWT_SECRET=safeswap-super-secret-jwt-key-2024
JWT_EXPIRES_IN=7d

# API Keys (Optional)
APTOS_API_KEY=your-aptos-api-key
ETHERSCAN_API_KEY=your-etherscan-api-key

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# WebSocket
WS_PORT=3002

# External APIs
COINGECKO_API_URL=https://api.coingecko.com/api/v3
`;

const envPath = path.join(__dirname, '.env');

if (fs.existsSync(envPath)) {
  console.log('⚠️  .env file already exists. Backing up to .env.backup');
  fs.copyFileSync(envPath, path.join(__dirname, '.env.backup'));
}

fs.writeFileSync(envPath, envContent);

console.log('✅ Created .env file in Backend directory');
console.log('');
console.log('📋 Next Steps:');
console.log('1. Go to https://cloud.mongodb.com');
console.log('2. Create a free MongoDB Atlas account');
console.log('3. Create a new cluster (FREE tier)');
console.log('4. Create a database user with username: safeswap_user');
console.log('5. Set network access to "Allow Access from Anywhere"');
console.log('6. Get your connection string from the cluster');
console.log('7. Replace YOUR_PASSWORD in the .env file with your actual password');
console.log('');
console.log('🔗 MongoDB Atlas Setup Guide:');
console.log('https://cloud.mongodb.com/');
console.log('');
console.log('📖 For detailed instructions, see: MONGODB_SETUP.md'); 