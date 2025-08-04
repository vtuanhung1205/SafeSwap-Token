const mongoose = require('mongoose');

/**
 * Session Model - Quản lý session đơn giản cho wallet-based authentication
 * Chỉ lưu thông tin cần thiết để identify user qua wallet address
 */
const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    walletAddress: {
      type: String,
      required: true,
      index: true,
    },
    walletType: {
      type: String,
      enum: ['aptos', 'ethereum', 'solana'],
      default: 'aptos',
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    userAgent: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index to automatically delete expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Kiểm tra session có hết hạn chưa
 */
sessionSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

/**
 * Cập nhật thời gian hoạt động cuối cùng
 */
sessionSchema.methods.updateActivity = async function() {
  this.lastActivity = new Date();
  return this.save();
};

/**
 * Tìm session theo sessionId (chỉ trả về session chưa hết hạn)
 */
sessionSchema.statics.findBySessionId = function(sessionId) {
  return this.findOne({ sessionId, expiresAt: { $gt: new Date() } });
};

/**
 * Tìm tất cả session của một wallet address
 */
sessionSchema.statics.findByWalletAddress = function(walletAddress) {
  return this.find({ walletAddress, expiresAt: { $gt: new Date() } });
};

/**
 * Xóa các session đã hết hạn
 */
sessionSchema.statics.cleanupExpired = async function() {
  return this.deleteMany({ expiresAt: { $lt: new Date() } });
};

/**
 * Tạo session mới cho wallet
 */
sessionSchema.statics.createSession = async function(sessionData) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  const session = new this({
    ...sessionData,
    expiresAt,
  });
  
  return session.save();
};

// Transform toJSON output - loại bỏ các field không cần thiết
sessionSchema.set('toJSON', {
  versionKey: false,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Session = mongoose.model('Session', sessionSchema);

module.exports = { Session }; 