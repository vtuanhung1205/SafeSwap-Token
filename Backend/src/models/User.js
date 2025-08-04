const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic information
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Profile information
  firstName: {
    type: String,
    trim: true
  },
  
  lastName: {
    type: String,
    trim: true
  },
  
  avatar: {
    type: String
  },
  
  // Wallet information
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  
  walletType: {
    type: String,
    enum: ['petra', 'martian', 'pontem', 'other'],
    default: 'other'
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerified: {
    type: Boolean,
    default: false
  },
  
  // Security settings
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  
  twoFactorSecret: {
    type: String
  },
  
  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      showTransactions: { type: Boolean, default: true },
      showBalance: { type: Boolean, default: true }
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  
  // API keys and integrations
  apiKeys: [{
    name: String,
    key: String,
    permissions: [String],
    createdAt: { type: Date, default: Date.now },
    lastUsed: Date
  }],
  
  // Session management
  sessions: [{
    token: String,
    device: String,
    ip: String,
    createdAt: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now }
  }],
  
  // Risk assessment
  riskProfile: {
    level: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    factors: [{
      type: String
    }]
  },
  
  // Transaction limits
  limits: {
    daily: {
      type: Number,
      default: 10000
    },
    monthly: {
      type: Number,
      default: 100000
    },
    single: {
      type: Number,
      default: 5000
    }
  },
  
  // Statistics
  stats: {
    totalTransactions: {
      type: Number,
      default: 0
    },
    totalVolume: {
      type: Number,
      default: 0
    },
    lastTransaction: Date,
    joinDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // KYC/AML information
  kyc: {
    status: {
      type: String,
      enum: ['none', 'pending', 'verified', 'rejected'],
      default: 'none'
    },
    documents: [{
      type: String,
      url: String,
      verified: Boolean,
      uploadedAt: { type: Date, default: Date.now }
    }],
    verifiedAt: Date
  },
  
  // Referral system
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  referrals: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bonus: {
      type: Number,
      default: 0
    }
  }],
  
  // Support tickets
  supportTickets: [{
    id: String,
    subject: String,
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ walletAddress: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'stats.lastTransaction': -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.username;
});

// Virtual for account age
userSchema.virtual('accountAge').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate referral code
userSchema.methods.generateReferralCode = function() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  this.referralCode = `SAFE${timestamp}${random}`.toUpperCase();
  return this.referralCode;
};

// Method to update statistics
userSchema.methods.updateStats = function(transactionData) {
  this.stats.totalTransactions += 1;
  this.stats.totalVolume += parseFloat(transactionData.amount) || 0;
  this.stats.lastTransaction = new Date();
  return this.save();
};

// Method to check transaction limits
userSchema.methods.checkLimits = function(amount) {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // This would need to be implemented with actual transaction queries
  // For now, return true
  return true;
};

// Static method to find by wallet address
userSchema.statics.findByWalletAddress = function(address) {
  return this.findOne({ walletAddress: address.toLowerCase() });
};

// Static method to get user statistics
userSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'transactions',
        localField: '_id',
        foreignField: 'userId',
        as: 'transactions'
      }
    },
    {
      $project: {
        username: 1,
        email: 1,
        walletAddress: 1,
        stats: 1,
        totalTransactions: { $size: '$transactions' },
        totalVolume: {
          $sum: {
            $map: {
              input: '$transactions',
              as: 'tx',
              in: { $toDouble: '$$tx.amount' }
            }
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('User', userSchema); 