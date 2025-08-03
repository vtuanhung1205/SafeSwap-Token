const mongoose = require('mongoose');
const { TokenPrice } = require('./src/models/TokenPrice.model');
require('dotenv').config();

const tokenPrices = [
  {
    tokenAddress: '0x1::aptos_coin::AptosCoin',
    symbol: 'APT',
    price: 8.50,
    priceUSD: 8.50,
    change24h: 2.5,
    volume24h: 15000000,
    marketCap: 2000000000,
    source: 'seeded',
    lastUpdated: new Date()
  },
  {
    tokenAddress: '0x1::bitcoin::Bitcoin',
    symbol: 'BTC',
    price: 45000,
    priceUSD: 45000,
    change24h: 1.2,
    volume24h: 25000000000,
    marketCap: 850000000000,
    source: 'seeded',
    lastUpdated: new Date()
  },
  {
    tokenAddress: '0x1::ethereum::Ethereum',
    symbol: 'ETH',
    price: 2800,
    priceUSD: 2800,
    change24h: -0.8,
    volume24h: 15000000000,
    marketCap: 350000000000,
    source: 'seeded',
    lastUpdated: new Date()
  },
  {
    tokenAddress: '0x1::solana::Solana',
    symbol: 'SOL',
    price: 95,
    priceUSD: 95,
    change24h: 3.1,
    volume24h: 2000000000,
    marketCap: 45000000000,
    source: 'seeded',
    lastUpdated: new Date()
  },
  {
    tokenAddress: '0x1::usd_coin::USDCoin',
    symbol: 'USDC',
    price: 1.00,
    priceUSD: 1.00,
    change24h: 0.0,
    volume24h: 5000000000,
    marketCap: 25000000000,
    source: 'seeded',
    lastUpdated: new Date()
  },
  {
    tokenAddress: '0x1::tether::Tether',
    symbol: 'USDT',
    price: 1.00,
    priceUSD: 1.00,
    change24h: 0.0,
    volume24h: 8000000000,
    marketCap: 85000000000,
    source: 'seeded',
    lastUpdated: new Date()
  }
];

async function seedTokenPrices() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/safeswap';
    console.log('MongoDB URI:', mongoUri);
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
    
    // Clear existing token prices
    await TokenPrice.deleteMany({});
    console.log('🗑️ Cleared existing token prices');
    
    // Insert new token prices
    const result = await TokenPrice.insertMany(tokenPrices);
    console.log(`✅ Inserted ${result.length} token prices`);
    
    // Verify insertion
    const count = await TokenPrice.countDocuments();
    console.log(`📊 Total token prices in database: ${count}`);
    
    // List all token prices
    const allPrices = await TokenPrice.find({});
    console.log('💰 Token prices:');
    allPrices.forEach(price => {
      console.log(`  - ${price.symbol}: $${price.price} (${price.change24h}%)`);
    });
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database disconnected');
  }
}

seedTokenPrices(); 