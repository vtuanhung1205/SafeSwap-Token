const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    // Token identifier
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Aptos resource address
    address: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^0x[a-fA-F0-9]{64}$/.test(v);
        },
        message: 'Invalid Aptos token address format'
      }
    },
    // Move module information
    moveModule: {
      type: String,
      required: true,
      trim: true,
    },
    moveStruct: {
      type: String,
      required: true,
      trim: true,
    },
    // Token metadata
    decimals: {
      type: Number,
      required: true,
      min: 0,
      max: 18,
      default: 6,
    },
    totalSupply: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Token type
    tokenType: {
      type: String,
      enum: ['fungible', 'non_fungible', 'semi_fungible'],
      default: 'fungible',
    },
    // Chain information
    chainId: {
      type: String,
      required: true,
      enum: ['aptos-mainnet', 'aptos-testnet', 'aptos-devnet'],
      default: 'aptos-testnet',
    },
    // Token status
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    // Price information
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    priceUSD: {
      type: Number,
      default: 0,
      min: 0,
    },
    change24h: {
      type: Number,
      default: 0,
    },
    volume24h: {
      type: Number,
      default: 0,
      min: 0,
    },
    marketCap: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Token metadata
    description: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    logo: {
      type: String,
      default: '',
    },
    // Social links
    socialLinks: {
      twitter: String,
      telegram: String,
      discord: String,
      github: String,
    },
    // Token capabilities
    capabilities: {
      mintable: { type: Boolean, default: false },
      burnable: { type: Boolean, default: false },
      pausable: { type: Boolean, default: false },
      upgradeable: { type: Boolean, default: false },
    },
    // Security information
    scamRisk: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    riskFactors: [{
      type: String,
      enum: ['high_volatility', 'low_liquidity', 'unverified_contract', 'suspicious_activity', 'new_token']
    }],
    // Timestamps
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    deployedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
tokenSchema.index({ symbol: 1 });
tokenSchema.index({ address: 1 });
tokenSchema.index({ chainId: 1 });
tokenSchema.index({ isActive: 1 });
tokenSchema.index({ isVerified: 1 });
tokenSchema.index({ price: -1 });
tokenSchema.index({ marketCap: -1 });
tokenSchema.index({ volume24h: -1 });
tokenSchema.index({ scamRisk: 1 });

// Virtual for token ID
tokenSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Virtual for price trend
tokenSchema.virtual('trend').get(function() {
  if (this.change24h > 0) return 'up';
  if (this.change24h < 0) return 'down';
  return 'stable';
});

// Virtual for risk level
tokenSchema.virtual('riskLevel').get(function() {
  if (this.scamRisk >= 80) return 'high';
  if (this.scamRisk >= 50) return 'medium';
  return 'low';
});

// Instance methods
tokenSchema.methods.updatePrice = async function(newPrice, newPriceUSD, change24h, volume24h = 0, marketCap = 0) {
  this.price = newPrice;
  this.priceUSD = newPriceUSD;
  this.change24h = change24h;
  this.volume24h = volume24h;
  this.marketCap = marketCap;
  this.lastUpdated = new Date();
  return this.save();
};

tokenSchema.methods.updateScamRisk = async function(riskScore, riskFactors = []) {
  this.scamRisk = Math.max(0, Math.min(100, riskScore));
  this.riskFactors = riskFactors;
  return this.save();
};

tokenSchema.methods.verify = async function() {
  this.isVerified = true;
  return this.save();
};

tokenSchema.methods.deactivate = async function() {
  this.isActive = false;
  return this.save();
};

// Static methods
tokenSchema.statics.getBySymbol = function(symbol) {
  return this.findOne({ symbol: symbol.toUpperCase() });
};

tokenSchema.statics.getByAddress = function(address) {
  return this.findOne({ address });
};

tokenSchema.statics.getVerifiedTokens = function() {
  return this.find({ isVerified: true, isActive: true });
};

tokenSchema.statics.getTopGainers = function(limit = 10) {
  return this.find({ isActive: true }).sort({ change24h: -1 }).limit(limit);
};

tokenSchema.statics.getTopLosers = function(limit = 10) {
  return this.find({ isActive: true }).sort({ change24h: 1 }).limit(limit);
};

tokenSchema.statics.getByMarketCap = function(limit = 20) {
  return this.find({ isActive: true }).sort({ marketCap: -1 }).limit(limit);
};

tokenSchema.statics.getLowRiskTokens = function(limit = 20) {
  return this.find({ 
    isActive: true, 
    scamRisk: { $lt: 30 } 
  }).sort({ scamRisk: 1 }).limit(limit);
};

// Transform toJSON output
tokenSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    // Format numbers
    ret.price = parseFloat(ret.price.toFixed(6));
    ret.priceUSD = parseFloat(ret.priceUSD.toFixed(6));
    ret.change24h = parseFloat(ret.change24h.toFixed(2));
    ret.volume24h = parseFloat(ret.volume24h.toFixed(2));
    ret.marketCap = parseFloat(ret.marketCap.toFixed(2));
    return ret;
  },
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = { Token }; 