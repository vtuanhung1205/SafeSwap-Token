const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Transaction identification
  hash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // User information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Transaction details
  fromAddress: {
    type: String,
    required: true,
    index: true
  },
  
  toAddress: {
    type: String,
    required: true,
    index: true
  },
  
  // Token information
  tokenAddress: {
    type: String,
    required: true
  },
  
  tokenName: {
    type: String,
    required: true
  },
  
  tokenSymbol: {
    type: String,
    required: true
  },
  
  // Amount details
  amount: {
    type: String,
    required: true
  },
  
  amountInDecimals: {
    type: Number,
    required: true
  },
  
  // Transaction status
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'reverted'],
    default: 'pending',
    index: true
  },
  
  // Transaction type
  type: {
    type: String,
    enum: ['transfer', 'swap', 'mint', 'burn', 'approve'],
    required: true
  },
  
  // Gas information
  gasUsed: {
    type: Number,
    default: 0
  },
  
  gasPrice: {
    type: Number,
    default: 0
  },
  
  // Block information
  blockNumber: {
    type: Number,
    index: true
  },
  
  blockHash: {
    type: String
  },
  
  // Timestamps
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  
  confirmedAt: {
    type: Date
  },
  
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Error information
  error: {
    type: String
  },
  
  // Network information
  network: {
    type: String,
    default: 'mainnet'
  },
  
  // Chain ID
  chainId: {
    type: Number,
    default: 1
  },
  
  // Transaction fee
  fee: {
    type: String,
    default: '0'
  },
  
  // Transaction events
  events: [{
    type: {
      type: String
    },
    data: mongoose.Schema.Types.Mixed
  }],
  
  // Related transactions (for swaps)
  relatedTransactions: [{
    hash: String,
    type: String
  }],
  
  // User notes
  notes: {
    type: String
  },
  
  // Tags for categorization
  tags: [{
    type: String
  }],
  
  // Risk assessment
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // AI analysis results
  aiAnalysis: {
    isScam: {
      type: Boolean,
      default: false
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    riskFactors: [{
      type: String
    }],
    recommendations: [{
      type: String
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
transactionSchema.index({ userId: 1, timestamp: -1 });
transactionSchema.index({ fromAddress: 1, timestamp: -1 });
transactionSchema.index({ toAddress: 1, timestamp: -1 });
transactionSchema.index({ status: 1, timestamp: -1 });
transactionSchema.index({ type: 1, timestamp: -1 });
transactionSchema.index({ 'aiAnalysis.isScam': 1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  if (this.amountInDecimals) {
    return (parseFloat(this.amount) / Math.pow(10, this.amountInDecimals)).toFixed(this.amountInDecimals);
  }
  return this.amount;
});

// Virtual for transaction age
transactionSchema.virtual('age').get(function() {
  return Date.now() - this.timestamp.getTime();
});

// Static method to get user transactions
transactionSchema.statics.getUserTransactions = function(userId, options = {}) {
  const {
    limit = 50,
    offset = 0,
    status,
    type,
    fromDate,
    toDate,
    sortBy = 'timestamp',
    sortOrder = 'desc'
  } = options;

  const query = { userId };
  
  if (status) query.status = status;
  if (type) query.type = type;
  if (fromDate || toDate) {
    query.timestamp = {};
    if (fromDate) query.timestamp.$gte = new Date(fromDate);
    if (toDate) query.timestamp.$lte = new Date(toDate);
  }

  return this.find(query)
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip(offset)
    .limit(limit)
    .populate('userId', 'username email');
};

// Static method to get transaction statistics
transactionSchema.statics.getTransactionStats = function(userId, timeRange = '30d') {
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          status: '$status',
          type: '$type'
        },
        count: { $sum: 1 },
        totalAmount: { $sum: { $toDouble: '$amount' } }
      }
    }
  ]);
};

// Instance method to update transaction status
transactionSchema.methods.updateStatus = function(status, additionalData = {}) {
  this.status = status;
  
  if (status === 'confirmed') {
    this.confirmedAt = new Date();
  }
  
  if (additionalData.blockNumber) this.blockNumber = additionalData.blockNumber;
  if (additionalData.blockHash) this.blockHash = additionalData.blockHash;
  if (additionalData.gasUsed) this.gasUsed = additionalData.gasUsed;
  if (additionalData.fee) this.fee = additionalData.fee;
  if (additionalData.events) this.events = additionalData.events;
  if (additionalData.error) this.error = additionalData.error;
  
  return this.save();
};

module.exports = mongoose.model('Transaction', transactionSchema); 