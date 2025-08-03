const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Remove single walletAddress field
    // walletAddress: {
    //   type: String,
    //   unique: true,
    //   sparse: true,
    // },
    // Add wallet management
    defaultWalletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      default: null,
    },
    walletPreferences: {
      autoConnect: {
        type: Boolean,
        default: true,
      },
      defaultChain: {
        type: String,
        enum: ['aptos-mainnet', 'aptos-testnet', 'aptos-devnet'],
        default: 'aptos-testnet',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    },
    isVerified: {
      type: Boolean,
      default: true, // Google users are pre-verified
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // User preferences
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto',
      },
      language: {
        type: String,
        default: 'en',
      },
      timezone: {
        type: String,
        default: 'UTC',
      },
      currency: {
        type: String,
        default: 'USD',
      },
    },
    // User statistics
    stats: {
      totalSwaps: {
        type: Number,
        default: 0,
      },
      totalVolume: {
        type: Number,
        default: 0,
      },
      firstSwapAt: {
        type: Date,
        default: null,
      },
      lastActiveAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for connected wallets count
userSchema.virtual('connectedWalletsCount').get(function() {
  return this.wallets ? this.wallets.length : 0;
});

// Instance methods
userSchema.methods.setDefaultWallet = async function(walletId) {
  this.defaultWalletId = walletId;
  return this.save();
};

userSchema.methods.updateStats = async function(swapData) {
  this.stats.totalSwaps += 1;
  this.stats.totalVolume += swapData.volume || 0;
  this.stats.lastActiveAt = new Date();
  
  if (!this.stats.firstSwapAt) {
    this.stats.firstSwapAt = new Date();
  }
  
  return this.save();
};

userSchema.methods.getConnectedWallets = async function() {
  const { Wallet } = require('./Wallet.model');
  return await Wallet.find({ 
    userId: this._id, 
    isConnected: true 
  }).sort({ lastSyncAt: -1 });
};

userSchema.methods.getDefaultWallet = async function() {
  if (!this.defaultWalletId) return null;
  
  const { Wallet } = require('./Wallet.model');
  return await Wallet.findOne({ 
    _id: this.defaultWalletId,
    userId: this._id 
  });
};

// Static methods
userSchema.statics.findByWalletAddress = function(address) {
  return this.findOne({
    'wallets.address': address
  });
};

userSchema.statics.getUserStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        totalSwaps: { $sum: '$stats.totalSwaps' },
        totalVolume: { $sum: '$stats.totalVolume' },
        avgSwapsPerUser: { $avg: '$stats.totalSwaps' },
        activeUsers: {
          $sum: {
            $cond: [
              { $gte: ['$stats.lastActiveAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
              1,
              0
            ]
          }
        }
      }
    }
  ]);
};

// Transform toJSON output
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
