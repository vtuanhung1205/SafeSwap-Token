const mongoose = require('mongoose');

/**
 * SwapTransaction Model - Lưu lịch sử swap transactions
 * Tối ưu cho production với real funds, chỉ lưu thông tin cần thiết
 */
const swapTransactionSchema = new mongoose.Schema(
  {
    // Wallet identification (thay thế userId)
    walletAddress: {
      type: String,
      required: true,
      trim: true,
      index: true,
      validate: {
        validator: function(v) {
          return /^0x[a-fA-F0-9]{64}$/.test(v);
        },
        message: 'Invalid Aptos wallet address format'
      }
    },
    
    // Token information
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
    
    // Amounts and rates
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
    slippage: {
      type: Number,
      default: 0.5, // 0.5% default slippage
      min: 0,
      max: 50,
    },
    
    // Transaction details
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
    
    // Gas information
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
    
    // Status and metadata
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'cancelled', 'submitted'],
      default: 'pending',
    },
    chainId: {
      type: String,
      required: true,
      enum: ['aptos-mainnet', 'aptos-testnet', 'aptos-devnet'],
      default: 'aptos-mainnet',
    },
    blockNumber: {
      type: Number,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    errorCode: {
      type: String,
      default: null,
    },
    
    // Timestamps
    timestamp: {
      type: Date,
      default: Date.now,
    },
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

// Indexes for optimal query performance
swapTransactionSchema.index({ walletAddress: 1, createdAt: -1 }); // User's transaction history
swapTransactionSchema.index({ status: 1 }); // Filter by status
swapTransactionSchema.index({ transactionHash: 1 }); // Find by hash
swapTransactionSchema.index({ createdAt: -1 }); // Recent transactions
swapTransactionSchema.index({ fromToken: 1, toToken: 1 }); // Token pair analytics

/**
 * Virtual field: Transaction pair (e.g., "APT/USDC")
 */
swapTransactionSchema.virtual('pair').get(function() {
  return `${this.fromToken}/${this.toToken}`;
});

/**
 * Virtual field: Gas cost in APT
 */
swapTransactionSchema.virtual('gasCostApt').get(function() {
  if (this.gasUsed && this.gasUnitPrice) {
    return (this.gasUsed * this.gasUnitPrice) / 100000000; // Convert to APT
  }
  return 0;
});

/**
 * Instance methods
 */

/**
 * Đánh dấu transaction hoàn thành
 */
swapTransactionSchema.methods.markAsCompleted = async function(blockNumber, gasUsed, gasUnitPrice) {
  this.status = 'completed';
  this.blockNumber = blockNumber;
  this.gasUsed = gasUsed;
  this.gasUnitPrice = gasUnitPrice;
  return this.save();
};

/**
 * Đánh dấu transaction thất bại
 */
swapTransactionSchema.methods.markAsFailed = async function(errorMessage, errorCode = null) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  this.errorCode = errorCode;
  return this.save();
};

/**
 * Đánh dấu transaction đã submit
 */
swapTransactionSchema.methods.markAsSubmitted = async function(sequenceNumber, version) {
  this.status = 'submitted';
  this.sequenceNumber = sequenceNumber;
  this.version = version;
  return this.save();
};

/**
 * Static methods
 */

/**
 * Lấy lịch sử transactions của một wallet
 */
swapTransactionSchema.statics.getByWallet = function(walletAddress, limit = 50) {
  return this.find({ walletAddress })
    .sort({ createdAt: -1 })
    .limit(limit);
};

/**
 * Lấy transactions theo status
 */
swapTransactionSchema.statics.getByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

/**
 * Lấy transactions theo chain
 */
swapTransactionSchema.statics.getByChain = function(chainId) {
  return this.find({ chainId }).sort({ createdAt: -1 });
};

/**
 * Tính volume 24h
 */
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
        totalGasUsed: { $sum: '$gasUsed' }
      }
    }
  ]);
  
  return result[0] || { totalVolume: 0, transactionCount: 0, totalGasUsed: 0 };
};

/**
 * Lấy transaction theo hash
 */
swapTransactionSchema.statics.getByHash = function(transactionHash) {
  return this.findOne({ transactionHash });
};

// Transform toJSON output - format numbers và loại bỏ fields không cần thiết
swapTransactionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc, ret) {
    // Format amounts to 6 decimal places
    ret.fromAmount = parseFloat(ret.fromAmount.toFixed(6));
    ret.toAmount = parseFloat(ret.toAmount.toFixed(6));
    ret.exchangeRate = parseFloat(ret.exchangeRate.toFixed(6));
    
    // Loại bỏ các field nhạy cảm
    delete ret.__v;
    
    return ret;
  },
});

const SwapTransaction = mongoose.model('SwapTransaction', swapTransactionSchema);

module.exports = { SwapTransaction };
