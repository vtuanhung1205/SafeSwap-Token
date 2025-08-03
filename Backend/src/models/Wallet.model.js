const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    address: {
      type: String,
      required: true,
      unique: true,
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
    isConnected: {
      type: Boolean,
      default: false,
    },
    lastSyncAt: {
      type: Date,
      default: Date.now,
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
    }
  },
  {
    timestamps: true,
  }
);

// Remove duplicate indexes - only use schema-level unique: true and necessary compound indexes
walletSchema.index({ userId: 1 });
walletSchema.index({ isConnected: 1 });
walletSchema.index({ chainId: 1 });
walletSchema.index({ address: 1, chainId: 1 });

// Virtual for transaction ID
walletSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Virtual for short address
walletSchema.virtual('shortAddress').get(function() {
  if (!this.address) return '';
  return `${this.address.slice(0, 6)}...${this.address.slice(-4)}`;
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

walletSchema.methods.refreshBalance = async function() {
  try {
    // This would typically call Aptos API to get current balance
    // For now, we'll just update the timestamp
    this.lastSyncAt = new Date();
    return this.save();
  } catch (error) {
    throw error;
  }
};

walletSchema.methods.updateSequenceNumber = async function(sequenceNumber) {
  this.sequenceNumber = sequenceNumber;
  return this.save();
};

// Transform toJSON output
walletSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = { Wallet };
