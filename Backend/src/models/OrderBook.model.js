const mongoose = require('mongoose');

const orderBookSchema = new mongoose.Schema(
  {
    // Pool reference
    poolId: {
      type: String,
      required: true,
      trim: true,
    },
    // Token pair
    baseToken: {
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
    quoteToken: {
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
    baseTokenSymbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    quoteTokenSymbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    // Order book data
    bids: [{
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      total: {
        type: Number,
        required: true,
        min: 0,
      },
      count: {
        type: Number,
        default: 1,
        min: 1,
      }
    }],
    asks: [{
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      total: {
        type: Number,
        required: true,
        min: 0,
      },
      count: {
        type: Number,
        default: 1,
        min: 1,
      }
    }],
    // Market data
    lastPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    high24h: {
      type: Number,
      default: 0,
      min: 0,
    },
    low24h: {
      type: Number,
      default: 0,
      min: 0,
    },
    volume24h: {
      type: Number,
      default: 0,
      min: 0,
    },
    change24h: {
      type: Number,
      default: 0,
    },
    // Spread information
    spread: {
      type: Number,
      default: 0,
      min: 0,
    },
    spreadPercentage: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Depth information
    depth: {
      bids: {
        type: Number,
        default: 0,
        min: 0,
      },
      asks: {
        type: Number,
        default: 0,
        min: 0,
      }
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
    // Order book status
    isActive: {
      type: Boolean,
      default: true,
    },
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
orderBookSchema.index({ poolId: 1 });
orderBookSchema.index({ baseToken: 1, quoteToken: 1 });
orderBookSchema.index({ chainId: 1 });
orderBookSchema.index({ dex: 1 });
orderBookSchema.index({ isActive: 1 });
orderBookSchema.index({ lastUpdated: -1 });

// Virtual for order book ID
orderBookSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Virtual for trading pair
orderBookSchema.virtual('pair').get(function() {
  return `${this.baseTokenSymbol}/${this.quoteTokenSymbol}`;
});

// Virtual for best bid
orderBookSchema.virtual('bestBid').get(function() {
  if (this.bids.length === 0) return null;
  return this.bids[0];
});

// Virtual for best ask
orderBookSchema.virtual('bestAsk').get(function() {
  if (this.asks.length === 0) return null;
  return this.asks[0];
});

// Virtual for mid price
orderBookSchema.virtual('midPrice').get(function() {
  const bestBid = this.bestBid;
  const bestAsk = this.bestAsk;
  
  if (!bestBid || !bestAsk) return this.lastPrice;
  
  return (bestBid.price + bestAsk.price) / 2;
});

// Instance methods
orderBookSchema.methods.updateOrderBook = async function(bids, asks) {
  this.bids = bids;
  this.asks = asks;
  this.lastUpdated = new Date();
  
  // Calculate spread
  if (this.bids.length > 0 && this.asks.length > 0) {
    this.spread = this.asks[0].price - this.bids[0].price;
    this.spreadPercentage = (this.spread / this.bids[0].price) * 100;
  }
  
  // Calculate depth
  this.depth.bids = this.bids.reduce((sum, bid) => sum + bid.amount, 0);
  this.depth.asks = this.asks.reduce((sum, ask) => sum + ask.amount, 0);
  
  return this.save();
};

orderBookSchema.methods.updateMarketData = async function(marketData) {
  this.lastPrice = marketData.lastPrice || this.lastPrice;
  this.high24h = marketData.high24h || this.high24h;
  this.low24h = marketData.low24h || this.low24h;
  this.volume24h = marketData.volume24h || this.volume24h;
  this.change24h = marketData.change24h || this.change24h;
  this.lastUpdated = new Date();
  return this.save();
};

orderBookSchema.methods.getOrderBook = function(depth = 20) {
  return {
    bids: this.bids.slice(0, depth),
    asks: this.asks.slice(0, depth),
    spread: this.spread,
    spreadPercentage: this.spreadPercentage,
    lastPrice: this.lastPrice,
    volume24h: this.volume24h,
    change24h: this.change24h,
    lastUpdated: this.lastUpdated
  };
};

// Static methods
orderBookSchema.statics.getByTokens = function(baseToken, quoteToken) {
  return this.findOne({
    $or: [
      { baseToken, quoteToken },
      { baseToken: quoteToken, quoteToken: baseToken }
    ],
    isActive: true
  });
};

orderBookSchema.statics.getBySymbols = function(baseSymbol, quoteSymbol) {
  return this.findOne({
    $or: [
      { baseTokenSymbol: baseSymbol.toUpperCase(), quoteTokenSymbol: quoteSymbol.toUpperCase() },
      { baseTokenSymbol: quoteSymbol.toUpperCase(), quoteTokenSymbol: baseSymbol.toUpperCase() }
    ],
    isActive: true
  });
};

orderBookSchema.statics.getTopPairs = function(limit = 20) {
  return this.find({ isActive: true })
    .sort({ volume24h: -1 })
    .limit(limit);
};

// Transform toJSON output
orderBookSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    // Format numbers
    ret.lastPrice = parseFloat(ret.lastPrice.toFixed(6));
    ret.high24h = parseFloat(ret.high24h.toFixed(6));
    ret.low24h = parseFloat(ret.low24h.toFixed(6));
    ret.volume24h = parseFloat(ret.volume24h.toFixed(2));
    ret.change24h = parseFloat(ret.change24h.toFixed(2));
    ret.spread = parseFloat(ret.spread.toFixed(6));
    ret.spreadPercentage = parseFloat(ret.spreadPercentage.toFixed(2));
    return ret;
  },
});

const OrderBook = mongoose.model('OrderBook', orderBookSchema);

module.exports = { OrderBook }; 