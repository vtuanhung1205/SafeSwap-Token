const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // For faster queries
LL    },
    address: {
      type: String,
      required: true,
      trim: true,
      // Aptos address format: 0x + 64 hex characters
      validate: {
        validator: function(v) {
          return /^0x[a-fA-F0-9]{64}$/.test(v);
        },
        message: 'Invalid Aptos address format'
      }
    },
    publicKey: {
      type: String,
      required: true,
      trim: true,
      // Aptos public key format
      validate: {
        validator: function(v) {
          return /^0x[a-fA-F0-9]{64}$/.test(v);
        },
        message: 'Invalid Aptos public key format'
      }
    },
    // Wallet name for user identification
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'My Wallet'
    },
    // Wallet description
    description: {
      type: String,
      trim: true,
      default: ''
    },
    chainId: {
      type: String,
      required: true,
      enum: ['aptos-mainnet', 'aptos-testnet', 'aptos-devnet'],
      default: 'aptos-testnet',
    },
    // Aptos specific fields
    sequenceNumber: {
      type: Number,
      default: 0,
      min: 0,
    },
    authenticationKey: {
      type: String,
      trim: true,
    },
    // Token balances - store as Map for flexibility
    tokenBalances: {
      type: Map,
      of: {
        amount: { type: Number, default: 0 },
        decimals: { type: Number, default: 6 },
        symbol: String,
        name: String,
        lastUpdated: { type: Date, default: Date.now }
      },
      default: {}
    },
    // APT balance (native token)
    aptBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Connection status
    isConnected: {
      type: Boolean,
      default: false,
    },
    // Last sync timestamp
    lastSyncAt: {
      type: Date,
      default: Date.now,
    },
    // Wallet security settings
    security: {
      // Require confirmation for large transactions
      requireConfirmation: {
        type: Boolean,
        default: true
      },
      // Minimum amount that requires confirmation
      confirmationThreshold: {
        type: Number,
        default: 100 // APT
      },
      // Maximum daily transaction limit
      dailyLimit: {
        type: Number,
        default: 1000 // APT
      },
      // Daily transaction count
      dailyTransactions: {
        type: Number,
        default: 0
      },
      // Last transaction date for daily reset
      lastTransactionDate: {
        type: Date,
        default: Date.now
      }
    },
    // Aptos specific metadata
    accountType: {
      type: String,
      enum: ['single_signer', 'multi_signer'],
      default: 'single_signer'
    },
    // For multi-signer accounts
    signers: [{
      type: String,
      trim: true
    }],
    // Account capabilities
    hasDelegatedWithdrawal: {
      type: Boolean,
      default: false
    },
    hasDelegatedKeyRotation: {
      type: Boolean,
      default: false
    },
    // Wallet permissions
    permissions: {
      canSwap: {
        type: Boolean,
        default: true
      },
      canTransfer: {
        type: Boolean,
        default: true
      },
      canStake: {
        type: Boolean,
        default: false
      },
      canVote: {
        type: Boolean,
        default: false
      }
    },
    // Wallet metadata
    metadata: {
      // Wallet creation source
      source: {
        type: String,
        enum: ['user_created', 'imported', 'generated'],
        default: 'user_created'
      },
      // Wallet tags for organization
      tags: [{
        type: String,
        trim: true
      }],
      // Custom wallet icon/color
      color: {
        type: String,
        default: '#3B82F6'
      },
      // Wallet notes
      notes: {
        type: String,
        default: ''
      }
    }
  },
  {
    timestamps: true,
  }
);

// Indexes for performance and security
walletSchema.index({ userId: 1 });
walletSchema.index({ userId: 1, isConnected: 1 });
walletSchema.index({ address: 1, chainId: 1 });
walletSchema.index({ userId: 1, address: 1 }, { unique: true }); // Ensure one address per user
walletSchema.index({ lastSyncAt: -1 }); // For sync operations

// Virtual for wallet ID
walletSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Virtual for short address
walletSchema.virtual('shortAddress').get(function() {
  if (!this.address) return '';
  return `${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
});

// Virtual for total balance in USD (if prices available)
walletSchema.virtual('totalBalanceUSD').get(function() {
  // This would be calculated based on current token prices
  return this.aptBalance; // Simplified for now
});

// Virtual for wallet status
walletSchema.virtual('status').get(function() {
  if (!this.isConnected) return 'disconnected';
  if (this.lastSyncAt < new Date(Date.now() - 5 * 60 * 1000)) return 'outdated'; // 5 minutes
  return 'connected';
});

// Instance methods
walletSchema.methods.updateAptBalance = async function(newBalance) {
  this.aptBalance = newBalance;
  this.lastSyncAt = new Date();
  return this.save();
};

walletSchema.methods.updateTokenBalance = async function(tokenAddress, balanceData) {
  this.tokenBalances.set(tokenAddress, {
    ...balanceData,
    lastUpdated: new Date()
  });
  this.lastSyncAt = new Date();
  return this.save();
};

walletSchema.methods.getTokenBalance = function(tokenAddress) {
  return this.tokenBalances.get(tokenAddress);
};

walletSchema.methods.connect = async function() {
  this.isConnected = true;
  this.lastSyncAt = new Date();
  return this.save();
};

walletSchema.methods.disconnect = async function() {
  this.isConnected = false;
  this.lastSyncAt = new Date();
  return this.save();
};

walletSchema.methods.updateSequenceNumber = async function(sequenceNumber) {
  this.sequenceNumber = sequenceNumber;
  this.lastSyncAt = new Date();
  return this.save();
};

// Security methods
walletSchema.methods.checkTransactionLimit = function(amount) {
  const today = new Date().toDateString();
  const lastTransactionDate = this.security.lastTransactionDate.toDateString();
  
  // Reset daily count if it's a new day
  if (today !== lastTransactionDate) {
    this.security.dailyTransactions = 0;
    this.security.lastTransactionDate = new Date();
  }
  
  // Check if transaction would exceed daily limit
  if (this.security.dailyTransactions >= 50) { // Max 50 transactions per day
    return { allowed: false, reason: 'Daily transaction limit exceeded' };
  }
  
  // Check if amount exceeds daily limit
  if (amount > this.security.dailyLimit) {
    return { allowed: false, reason: 'Transaction amount exceeds daily limit' };
  }
  
  return { allowed: true };
};

walletSchema.methods.recordTransaction = async function(amount) {
  this.security.dailyTransactions += 1;
  this.security.lastTransactionDate = new Date();
  return this.save();
};

walletSchema.methods.requiresConfirmation = function(amount) {
  return this.security.requireConfirmation && amount >= this.security.confirmationThreshold;
};

// Static methods
walletSchema.statics.findByUserAndAddress = function(userId, address) {
  return this.findOne({ userId, address });
};

walletSchema.statics.getUserWallets = function(userId, includeDisconnected = false) {
  const query = { userId };
  if (!includeDisconnected) {
    query.isConnected = true;
  }
  return this.find(query).sort({ lastSyncAt: -1 });
};

walletSchema.statics.getConnectedWallets = function(userId) {
  return this.find({ userId, isConnected: true }).sort({ lastSyncAt: -1 });
};

walletSchema.statics.validateOwnership = function(walletId, userId) {
  return this.findOne({ _id: walletId, userId });
};

// Transform toJSON output
walletSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    // Format numbers
    ret.aptBalance = parseFloat(ret.aptBalance.toFixed(6));
    // Don't expose sensitive security data
    delete ret.security;
    return ret;
  },
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = { Wallet };
