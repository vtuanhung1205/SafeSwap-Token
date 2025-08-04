const mongoose = require('mongoose');
const axios = require('axios');

// Minimal Database Schema
const minimalTransactionSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{64}$/.test(v);
      },
      message: 'Invalid transaction hash format'
    }
  },
  walletAddress: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^0x[a-fA-F0-9]{64}$/.test(v);
      },
      message: 'Invalid wallet address format'
    }
  },
  fromToken: {
    type: String,
    required: true,
    uppercase: true
  },
  toToken: {
    type: String,
    required: true,
    uppercase: true
  },
  fromAmount: {
    type: Number,
    required: true,
    min: 0
  },
  toAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  gasUsed: {
    type: Number,
    default: 0
  },
  fee: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const MinimalTransaction = mongoose.model('MinimalTransaction', minimalTransactionSchema);

// Rate Limiting Schema
const rateLimitSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true
  },
  dailyTransactions: {
    type: Number,
    default: 0
  },
  dailyVolume: {
    type: Number,
    default: 0
  },
  lastReset: {
    type: Date,
    default: Date.now
  },
  blacklisted: {
    type: Boolean,
    default: false
  }
});

const RateLimit = mongoose.model('RateLimit', rateLimitSchema);

// Analytics Schema
const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  totalVolume: {
    type: Number,
    default: 0
  },
  totalTransactions: {
    type: Number,
    default: 0
  },
  uniqueWallets: {
    type: Number,
    default: 0
  },
  averageGasUsed: {
    type: Number,
    default: 0
  }
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

// Demo Functions
async function demoMinimalDB() {
  try {
    console.log('🏗️ Demo: Minimal Database Architecture\n');

    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/safeswap_minimal');
    console.log('✅ Connected to MongoDB');

    // Demo 1: Record Transaction (No User Required)
    console.log('\n1️⃣ Demo: Record Transaction');
    const transaction = new MinimalTransaction({
      hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      walletAddress: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      fromToken: 'APT',
      toToken: 'USDC',
      fromAmount: 100,
      toAmount: 95.5,
      status: 'completed',
      gasUsed: 1500,
      fee: 0.001
    });

    await transaction.save();
    console.log('✅ Transaction recorded without user account');

    // Demo 2: Rate Limiting
    console.log('\n2️⃣ Demo: Rate Limiting');
    const rateLimit = new RateLimit({
      walletAddress: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      dailyTransactions: 5,
      dailyVolume: 1000,
      lastReset: new Date()
    });

    await rateLimit.save();
    console.log('✅ Rate limiting configured');

    // Demo 3: Analytics
    console.log('\n3️⃣ Demo: Analytics');
    const analytics = new Analytics({
      date: new Date(),
      totalVolume: 1000000,
      totalTransactions: 500,
      uniqueWallets: 100,
      averageGasUsed: 1500
    });

    await analytics.save();
    console.log('✅ Analytics recorded');

    // Demo 4: Real-time Data (Simulated)
    console.log('\n4️⃣ Demo: Real-time Data from Blockchain');
    
    // Simulate getting wallet balance from blockchain
    const getWalletBalance = async (address) => {
      // In real implementation, this would call Aptos blockchain
      return {
        APT: 1000,
        USDC: 500,
        USDT: 200
      };
    };

    const balance = await getWalletBalance('0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890');
    console.log('✅ Wallet balance from blockchain:', balance);

    // Demo 5: Stateless API Design
    console.log('\n5️⃣ Demo: Stateless API Endpoints');
    
    const statelessEndpoints = [
      'POST /api/swap/quote - No authentication required',
      'POST /api/swap/execute - Only wallet signature required',
      'GET /api/transaction/:hash - Public transaction status',
      'GET /api/price/:token - Real-time price from external API',
      'GET /api/wallet/:address/balance - Real-time from blockchain'
    ];

    statelessEndpoints.forEach(endpoint => {
      console.log(`   ${endpoint}`);
    });

    // Demo 6: Cost Comparison
    console.log('\n6️⃣ Demo: Cost Comparison');
    
    const costComparison = {
      'Current Architecture (Heavy DB)': {
        'MongoDB Hosting': '$50-200/month',
        'Storage': '1-10GB',
        'Complexity': 'High',
        'User Management': 'Required'
      },
      'Minimal DB Architecture': {
        'MongoDB Hosting': '$10-50/month',
        'Storage': '100MB-1GB',
        'Complexity': 'Low',
        'User Management': 'Not Required'
      }
    };

    console.log('💰 Cost Analysis:');
    Object.entries(costComparison).forEach(([architecture, costs]) => {
      console.log(`\n   ${architecture}:`);
      Object.entries(costs).forEach(([item, cost]) => {
        console.log(`     ${item}: ${cost}`);
      });
    });

    // Demo 7: Security Benefits
    console.log('\n7️⃣ Demo: Security Benefits');
    
    const securityBenefits = [
      '✅ No user data to protect',
      '✅ Reduced attack surface',
      '✅ Blockchain-native security',
      '✅ No password management',
      '✅ No personal information stored',
      '✅ Real-time data validation'
    ];

    securityBenefits.forEach(benefit => {
      console.log(`   ${benefit}`);
    });

    console.log('\n🎉 Minimal Database Demo Completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Transaction tracking without user accounts');
    console.log('✅ Rate limiting for security');
    console.log('✅ Analytics for business metrics');
    console.log('✅ Real-time data from blockchain');
    console.log('✅ Stateless API design');
    console.log('✅ Lower cost and complexity');
    console.log('✅ Better security and privacy');

    // Cleanup
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
  }
}

// Run the demo
demoMinimalDB(); 