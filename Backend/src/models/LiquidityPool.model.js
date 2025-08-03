const mongoose = require('mongoose');

const liquidityPoolSchema = new mongoose.Schema(
  {
    // Pool identifier
    poolId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Token pair
    token0: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^0x[a-fA-F0-9]{64}$/.test(v);
        },
        message: 'Invalid Aptos token address format'
      }
    },
    token1: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^0x[a-fA-F0-9]{64}$/.test(v);
        },
        message: 'Invalid Aptos token address format'
      }
    },
    // Token symbols for easy reference
    token0Symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    token1Symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    // Liquidity amounts
    reserve0: {
      type: Number,
      default: 0,
      min: 0,
    },
    reserve1: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Pool metrics
    totalSupply: {
      type: Number,
      default: 0,
      min: 0,
    },
    fee: {
      type: Number,
      default: 0.003, // 0.3% default fee
      min: 0,
      max: 0.1, // Max 10%
    },
    // Pool status
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Volume metrics
    volume24h: {
      type: Number,
      default: 0,
      min: 0,
    },
    volume7d: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Price metrics
    price0: {
      type: Number,
      default: 0,
      min: 0,
    },
    price1: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Chain information
    chainId: {
      type: String,
      required: true,
      enum: ['aptos-mainnet', 'aptos-testnet', 'aptos-devnet'],
      default: 'aptos-testnet',
    },
    // DEX information
    dex: {
      type: String,
      required: true,
      enum: ['liquidswap', 'pancakeswap', 'sushi', 'custom'],
      default: 'liquidswap',
    },
    // Pool address on blockchain
    poolAddress: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^0x[a-fA-F0-9]{64}$/.test(v);
        },
        message: 'Invalid Aptos pool address format'
      }
    },
    // Move module information
    moveModule: {
      type: String,
      required: true,
      trim: true,
    },
    // Pool metadata
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    // Risk assessment
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    riskFactors: [{
      type: String,
      enum: ['low_liquidity', 'high_volatility', 'new_pool', 'unverified_tokens', 'suspicious_activity']
    }],
    // Timestamps
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
liquidityPoolSchema.index({ poolId: 1 });
liquidityPoolSchema.index({ token0: 1, token1: 1 });
liquidityPoolSchema.index({ chainId: 1 });
liquidityPoolSchema.index({ dex: 1 });
liquidityPoolSchema.index({ isActive: 1 });
liquidityPoolSchema.index({ volume24h: -1 });
liquidityPoolSchema.index({ riskScore: 1 });

// Virtual for pool ID
liquidityPoolSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Virtual for pool pair
liquidityPoolSchema.virtual('pair').get(function() {
  return `${this.token0Symbol}/${this.token1Symbol}`;
});

// Virtual for total value locked (TVL)
liquidityPoolSchema.virtual('tvl').get(function() {
  return (this.reserve0 * this.price0) + (this.reserve1 * this.price1);
});

// Virtual for risk level
liquidityPoolSchema.virtual('riskLevel').get(function() {
  if (this.riskScore >= 80) return 'high';
  if (this.riskScore >= 50) return 'medium';
  return 'low';
});

// Instance methods
liquidityPoolSchema.methods.updateReserves = async function(reserve0, reserve1) {
  this.reserve0 = reserve0;
  this.reserve1 = reserve1;
  this.lastUpdated = new Date();
  return this.save();
};

liquidityPoolSchema.methods.updateVolume = async function(volume24h, volume7d = null) {
  this.volume24h = volume24h;
  if (volume7d !== null) {
    this.volume7d = volume7d;
  }
  this.lastUpdated = new Date();
  return this.save();
};

liquidityPoolSchema.methods.updatePrices = async function(price0, price1) {
  this.price0 = price0;
  this.price1 = price1;
  this.lastUpdated = new Date();
  return this.save();
};

liquidityPoolSchema.methods.updateRiskScore = async function(riskScore, riskFactors = []) {
  this.riskScore = Math.max(0, Math.min(100, riskScore));
  this.riskFactors = riskFactors;
  return this.save();
};

// Static methods
liquidityPoolSchema.statics.getByTokens = function(token0, token1) {
  return this.findOne({
    $or: [
      { token0, token1 },
      { token0: token1, token1: token0 }
    ],
    isActive: true
  });
};

liquidityPoolSchema.statics.getBySymbols = function(symbol0, symbol1) {
  return this.findOne({
    $or: [
      { token0Symbol: symbol0.toUpperCase(), token1Symbol: symbol1.toUpperCase() },
      { token0Symbol: symbol1.toUpperCase(), token1Symbol: symbol0.toUpperCase() }
    ],
    isActive: true
  });
};

liquidityPoolSchema.statics.getTopPools = function(limit = 20) {
  return this.find({ isActive: true })
    .sort({ volume24h: -1 })
    .limit(limit);
};

liquidityPoolSchema.statics.getLowRiskPools = function(limit = 20) {
  return this.find({ 
    isActive: true, 
    riskScore: { $lt: 30 } 
  })
    .sort({ riskScore: 1 })
    .limit(limit);
};

liquidityPoolSchema.statics.getByDex = function(dex, limit = 50) {
  return this.find({ dex, isActive: true })
    .sort({ volume24h: -1 })
    .limit(limit);
};

// Transform toJSON output
liquidityPoolSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    // Format numbers
    ret.reserve0 = parseFloat(ret.reserve0.toFixed(6));
    ret.reserve1 = parseFloat(ret.reserve1.toFixed(6));
    ret.volume24h = parseFloat(ret.volume24h.toFixed(2));
    ret.volume7d = parseFloat(ret.volume7d.toFixed(2));
    ret.price0 = parseFloat(ret.price0.toFixed(6));
    ret.price1 = parseFloat(ret.price1.toFixed(6));
    ret.fee = parseFloat(ret.fee.toFixed(4));
    return ret;
  },
});

const LiquidityPool = mongoose.model('LiquidityPool', liquidityPoolSchema);

module.exports = { LiquidityPool }; 