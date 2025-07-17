import mongoose, { Document, Schema } from 'mongoose';

export interface ITokenPrice extends Document {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

const tokenPriceSchema = new Schema<ITokenPrice>(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    change24h: {
      type: Number,
      default: 0,
    },
    volume24h: {
      type: Number,
      default: 0,
      min: 0,
    },
    marketCap: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
tokenPriceSchema.index({ symbol: 1 });
tokenPriceSchema.index({ lastUpdated: -1 });

// Virtual for price ID
tokenPriceSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
tokenPriceSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc: any, ret: any) => {
    delete ret._id;
  },
});

export const TokenPrice = mongoose.model<ITokenPrice>('TokenPrice', tokenPriceSchema); 