const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  type: {
    type: String,
    enum: ['swap', 'transfer', 'receive', 'stake', 'unstake'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed', 'cancelled'],
    default: 'pending'
  },
  hash: {
    type: String,
    unique: true,
    sparse: true
  },
  fromAddress: {
    type: String,
    required: true
  },
  toAddress: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  tokenAddress: {
    type: String,
    required: true
  },
  tokenSymbol: {
    type: String,
    required: true
  },
  gasUsed: {
    type: Number,
    default: 0
  },
  gasPrice: {
    type: Number,
    default: 0
  },
  fee: {
    type: Number,
    default: 0
  },
  blockNumber: {
    type: Number
  },
  blockHash: {
    type: String
  },
  confirmations: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better query performance
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ hash: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ type: 1 });

// Virtual for total fee
transactionSchema.virtual('totalFee').get(function() {
  return this.gasUsed * this.gasPrice;
});

// Instance method to update status
transactionSchema.methods.updateStatus = function(newStatus, hash = null) {
  this.status = newStatus;
  if (hash) {
    this.hash = hash;
  }
  return this.save();
};

// Static method to get user transactions
transactionSchema.statics.getUserTransactions = function(userId, options = {}) {
  const { limit = 50, offset = 0, type, status } = options;
  
  const query = { userId };
  if (type) query.type = type;
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .populate('walletId', 'address');
};

// Static method to get transaction statistics
transactionSchema.statics.getUserStats = function(userId, timeRange = '30d') {
  const now = new Date();
  let startDate;
  
  switch (timeRange) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId), createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalFees: { $sum: '$fee' }
      }
    }
  ]);
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = { Transaction }; 