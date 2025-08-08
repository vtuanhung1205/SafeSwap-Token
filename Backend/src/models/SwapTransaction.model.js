const mongoose = require('mongoose');

const swapTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
    transactionHash: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled'],
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
    },
    blockNumber: {
      type: Number,
      default: null,
    },
    gasUsed: {
      type: Number,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
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

// Virtual for transaction ID
swapTransactionSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Virtual for transaction pair
swapTransactionSchema.virtual('pair').get(function() {
  return `${this.fromToken}/${this.toToken}`;
});

// Instance methods
swapTransactionSchema.methods.markAsCompleted = async function(blockNumber, gasUsed) {
  this.status = 'completed';
  this.blockNumber = blockNumber;
  this.gasUsed = gasUsed;
  return this.save();
};

swapTransactionSchema.methods.markAsFailed = async function(errorMessage) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
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
        transactionCount: { $sum: 1 }
      }
    }
  ]);
  
  return result[0] || { totalVolume: 0, transactionCount: 0 };
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
