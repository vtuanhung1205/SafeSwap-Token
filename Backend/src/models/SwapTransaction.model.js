const mongoose = require('mongoose');

const swapTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Aptos specific fields
    fromToken: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    toToken: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    // Token addresses (Aptos resource addresses)
    fromTokenAddress: {
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
    toTokenAddress: {
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
    fromAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    toAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    exchangeRate: {
      type: Number,
      required: true,
      min: 0,
    },
    // Aptos transaction fields
    transactionHash: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^0x[a-fA-F0-9]{64}$/.test(v);
        },
        message: 'Invalid Aptos transaction hash format'
      }
    },
    // Aptos specific transaction fields
    sequenceNumber: {
      type: Number,
      required: true,
      min: 0,
    },
    version: {
      type: Number,
      required: true,
      min: 0,
    },
    // Aptos gas fields
    gasUsed: {
      type: Number,
      default: null,
      min: 0,
    },
    gasUnitPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    maxGasAmount: {
      type: Number,
      default: null,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled', 'submitted'],
      default: 'pending',
    },
    scamRisk: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    fee: {
      type: Number,
      default: 0,
      min: 0,
    },
    slippage: {
      type: Number,
      default: 0.5, // 0.5% default slippage
      min: 0,
      max: 50,
    },
    walletAddress: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v) {
          return /^0x[a-fA-F0-9]{64}$/.test(v);
        },
        message: 'Invalid Aptos wallet address format'
      }
    },
    // Aptos specific fields
    chainId: {
      type: String,
      required: true,
      enum: ['aptos-mainnet', 'aptos-testnet', 'aptos-devnet'],
      default: 'aptos-testnet',
    },
    // Move module information
    moveModule: {
      type: String,
      required: true,
      trim: true,
    },
    moveFunction: {
      type: String,
      required: true,
      trim: true,
    },
    // Transaction payload
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    // Aptos transaction metadata
    timestamp: {
      type: Date,
      default: Date.now,
    },
    blockNumber: {
      type: Number,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    // For failed transactions
    errorCode: {
      type: String,
      default: null,
    },
    // Transaction expiration
    expirationTimestamp: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
    }
  },
  {
    timestamps: true,
  }
);

// Remove duplicate indexes - only use schema-level unique: true and necessary compound indexes
swapTransactionSchema.index({ userId: 1 });
swapTransactionSchema.index({ status: 1 });
swapTransactionSchema.index({ createdAt: -1 });
swapTransactionSchema.index({ walletAddress: 1 });
swapTransactionSchema.index({ fromToken: 1, toToken: 1 });
swapTransactionSchema.index({ chainId: 1 });
swapTransactionSchema.index({ transactionHash: 1 });
swapTransactionSchema.index({ sequenceNumber: 1, walletAddress: 1 });

// Virtual for transaction ID
swapTransactionSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Virtual for transaction pair
swapTransactionSchema.virtual('pair').get(function() {
  return `${this.fromToken}/${this.toToken}`;
});

// Virtual for gas cost in APT
swapTransactionSchema.virtual('gasCostApt').get(function() {
  if (this.gasUsed && this.gasUnitPrice) {
    return (this.gasUsed * this.gasUnitPrice) / 100000000; // Convert to APT
  }
  return 0;
});

// Instance methods
swapTransactionSchema.methods.markAsCompleted = async function(blockNumber, gasUsed, gasUnitPrice) {
  this.status = 'completed';
  this.blockNumber = blockNumber;
  this.gasUsed = gasUsed;
  this.gasUnitPrice = gasUnitPrice;
  return this.save();
};

swapTransactionSchema.methods.markAsFailed = async function(errorMessage, errorCode = null) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  this.errorCode = errorCode;
  return this.save();
};

swapTransactionSchema.methods.markAsSubmitted = async function(sequenceNumber, version) {
  this.status = 'submitted';
  this.sequenceNumber = sequenceNumber;
  this.version = version;
  return this.save();
};

swapTransactionSchema.methods.updateScamRisk = async function(riskScore) {
  this.scamRisk = Math.max(0, Math.min(100, riskScore));
  return this.save();
};

// Static methods
swapTransactionSchema.statics.getByUser = function(userId, limit = 20) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'email name');
};

swapTransactionSchema.statics.getByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

swapTransactionSchema.statics.getByChain = function(chainId) {
  return this.find({ chainId }).sort({ createdAt: -1 });
};

swapTransactionSchema.statics.getVolume24h = async function() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const result = await this.aggregate([
    {
      $match: {
        createdAt: { $gte: yesterday },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalVolume: { $sum: '$fromAmount' },
        transactionCount: { $sum: 1 },
        totalFees: { $sum: '$fee' }
      }
    }
  ]);
  
  return result[0] || { totalVolume: 0, transactionCount: 0, totalFees: 0 };
};

// Transform toJSON output
swapTransactionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    
    // Format amounts to 6 decimal places
    ret.fromAmount = parseFloat(ret.fromAmount.toFixed(6));
    ret.toAmount = parseFloat(ret.toAmount.toFixed(6));
    ret.exchangeRate = parseFloat(ret.exchangeRate.toFixed(6));
    ret.fee = parseFloat(ret.fee.toFixed(6));
    
    return ret;
  },
});

const SwapTransaction = mongoose.model('SwapTransaction', swapTransactionSchema);

module.exports = { SwapTransaction };
