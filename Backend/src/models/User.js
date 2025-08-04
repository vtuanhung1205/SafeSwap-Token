const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return this.authProvider === 'email';
    },
    minlength: 6
  },
  
  // Authentication
  authProvider: {
    type: String,
    enum: ['email', 'google'],
    default: 'email'
  },
  googleId: {
    type: String,
    sparse: true
  },
  
  // Profile
  profile: {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    displayName: {
      type: String,
      trim: true
    },
    avatar: {
      type: String
    },
    bio: {
      type: String,
      maxlength: 500
    },
    location: {
      type: String
    },
    website: {
      type: String
    }
  },
  
  // Wallet Info
  walletAddress: {
    type: String,
    lowercase: true,
    trim: true
  },
  walletType: {
    type: String,
    enum: ['petra', 'martian', 'pontem', 'fewcha', 'nightly', 'other'],
    default: 'other'
  },
  
  // Account Status
  accountStatus: {
    type: String,
    enum: ['active', 'suspended', 'pending', 'deleted'],
    default: 'active'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Security
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  
  // Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'dark'
    },
    language: {
      type: String,
      default: 'en'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'friends'],
        default: 'public'
      },
      showWalletAddress: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // API Keys
  apiKeys: [{
    name: String,
    key: String,
    permissions: [String],
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: Date
  }],
  
  // Sessions
  sessions: [{
    token: String,
    device: String,
    ip: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Risk Profile
  riskProfile: {
    level: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    factors: [String],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Transaction Limits
  limits: {
    daily: {
      type: Number,
      default: 10000 // USD
    },
    monthly: {
      type: Number,
      default: 100000 // USD
    },
    single: {
      type: Number,
      default: 5000 // USD
    }
  },
  
  // Statistics
  statistics: {
    totalTransactions: {
      type: Number,
      default: 0
    },
    totalVolume: {
      type: Number,
      default: 0
    },
    lastLogin: Date,
    loginCount: {
      type: Number,
      default: 0
    },
    registrationDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // KYC/AML
  kyc: {
    status: {
      type: String,
      enum: ['none', 'pending', 'verified', 'rejected'],
      default: 'none'
    },
    documents: [{
      type: String,
      url: String,
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    verifiedAt: Date
  },
  
  // Referral System
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
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Support Tickets
  supportTickets: [{
    subject: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ walletAddress: 1 });
userSchema.index({ referralCode: 1 });
userSchema.index({ 'statistics.lastLogin': -1 });

// Virtuals
userSchema.virtual('fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.profile.displayName || this.email;
});

userSchema.virtual('accountAge').get(function() {
  return Math.floor((Date.now() - this.statistics.registrationDate) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified and user uses email auth
  if (this.isModified('password') && this.authProvider === 'email') {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  
  // Generate referral code if not exists
  if (!this.referralCode) {
    this.generateReferralCode();
  }
  
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (this.authProvider !== 'email') {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateReferralCode = function() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  this.referralCode = result;
};

userSchema.methods.updateStats = async function(action) {
  switch (action) {
    case 'login':
      this.statistics.lastLogin = new Date();
      this.statistics.loginCount += 1;
      break;
    case 'logout':
      // Update last activity
      break;
    case 'transaction':
      this.statistics.totalTransactions += 1;
      break;
  }
  await this.save();
};

userSchema.methods.checkLimits = function(amount) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // This is a simplified check - in real implementation, you'd track daily/monthly usage
  return {
    daily: amount <= this.limits.daily,
    monthly: amount <= this.limits.monthly,
    single: amount <= this.limits.single
  };
};

// Static methods
userSchema.statics.findByWalletAddress = function(address) {
  return this.findOne({ walletAddress: address.toLowerCase() });
};

userSchema.statics.getUserStats = async function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalUsers: { $sum: 1 },
        activeUsers: {
          $sum: {
            $cond: [{ $eq: ['$accountStatus', 'active'] }, 1, 0]
          }
        },
        verifiedUsers: {
          $sum: {
            $cond: [{ $eq: ['$isEmailVerified', true] }, 1, 0]
          }
        },
        usersWithWallet: {
          $sum: {
            $cond: [{ $ne: ['$walletAddress', null] }, 1, 0]
          }
        }
      }
    }
  ]);
};

const User = mongoose.model('User', userSchema);

module.exports = User; 