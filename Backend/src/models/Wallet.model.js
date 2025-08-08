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
    },
    publicKey: {
      type: String,
      required: true,
      trim: true,
    },
    chainId: {
      type: String,
      required: true,
      default: 'aptos-testnet',
    },
    balance: {
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
  },
  {
    timestamps: true,
  }
);

// Remove duplicate indexes - only use schema-level unique: true and necessary compound indexes
walletSchema.index({ userId: 1 });
walletSchema.index({ isConnected: 1 });
walletSchema.index({ chainId: 1 });

// Virtual for wallet ID
walletSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Instance methods
walletSchema.methods.updateBalance = async function(newBalance) {
  this.balance = newBalance;
  this.lastSyncAt = new Date();
  return this.save();
};

walletSchema.methods.connect = async function() {
  this.isConnected = true;
  return this.save();
};

walletSchema.methods.disconnect = async function() {
  this.isConnected = false;
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
