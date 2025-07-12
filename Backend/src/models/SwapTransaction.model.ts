import mongoose, { Document, Schema } from 'mongoose';

export interface ISwapTransaction extends Document {
  userId: mongoose.Types.ObjectId;
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  exchangeRate: number;
  transactionHash: string;
  status: 'pending' | 'completed' | 'failed';
  scamRisk: number;
  createdAt: Date;
  updatedAt: Date;
}

const swapTransactionSchema = new Schema<ISwapTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fromToken: {
      type: String,
      required: true,
    },
    toToken: {
      type: String,
      required: true,
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
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    scamRisk: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
swapTransactionSchema.index({ userId: 1 });
swapTransactionSchema.index({ transactionHash: 1 });
swapTransactionSchema.index({ status: 1 });
swapTransactionSchema.index({ createdAt: -1 });

// Virtual for transaction ID
swapTransactionSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
swapTransactionSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const SwapTransaction = mongoose.model<ISwapTransaction>('SwapTransaction', swapTransactionSchema); 