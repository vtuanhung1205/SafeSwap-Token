const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      required: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true, // For TTL cleanup
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

// Instance methods
sessionSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

sessionSchema.methods.updateActivity = async function() {
  this.lastActivity = new Date();
  return this.save();
};

// Static methods
sessionSchema.statics.findBySessionId = function(sessionId) {
  return this.findOne({ sessionId, expiresAt: { $gt: new Date() } });
};

sessionSchema.statics.findByUserId = function(userId) {
  return this.find({ userId, expiresAt: { $gt: new Date() } });
};

sessionSchema.statics.cleanupExpired = async function() {
  return this.deleteMany({ expiresAt: { $lt: new Date() } });
};

sessionSchema.statics.createSession = async function(sessionData) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  const session = new this({
    ...sessionData,
    expiresAt,
  });
  
  return session.save();
};

// Transform toJSON output
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