const mongoose = require('mongoose');

const tokenPriceSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
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
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    source: {
      type: String,
      default: 'api',
    },
  },
  {
    timestamps: true,
  }
);

// Remove duplicate indexes - only use schema-level unique: true and necessary indexes
tokenPriceSchema.index({ lastUpdated: -1 });
tokenPriceSchema.index({ price: -1 });

// Virtual for price trend
tokenPriceSchema.virtual('trend').get(function() {
  if (this.change24h > 0) return 'up';
  if (this.change24h < 0) return 'down';
  return 'stable';
});

// Instance methods
tokenPriceSchema.methods.updatePrice = async function(newPrice, change24h, volume24h = 0, marketCap = 0) {
  this.price = newPrice;
  this.change24h = change24h;
  this.volume24h = volume24h;
  this.marketCap = marketCap;
  this.lastUpdated = new Date();
  return this.save();
};

// Static methods
tokenPriceSchema.statics.getBySymbol = function(symbol) {
  return this.findOne({ symbol: symbol.toUpperCase() });
};

tokenPriceSchema.statics.getTopGainers = function(limit = 10) {
  return this.find().sort({ change24h: -1 }).limit(limit);
};

tokenPriceSchema.statics.getTopLosers = function(limit = 10) {
  return this.find().sort({ change24h: 1 }).limit(limit);
};

// Transform toJSON output
tokenPriceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    // Format price to 6 decimal places
    ret.price = parseFloat(ret.price.toFixed(6));
    ret.change24h = parseFloat(ret.change24h.toFixed(2));
    return ret;
  },
});

const TokenPrice = mongoose.model('TokenPrice', tokenPriceSchema);

module.exports = { TokenPrice };
