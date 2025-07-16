import mongoose, { Document, Schema } from 'mongoose';

export interface ITokenPrice extends Document {
  symbol: string;
  name: string;
  price: number;
  change_24h: number;
  volume_24h: number;
  market_cap: number;
  last_updated: Date;
  logo_url?: string;
  rank?: number;
  circulating_supply?: number;
  max_supply?: number;
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
    change_24h: {
      type: Number,
      default: 0,
    },
    volume_24h: {
      type: Number,
      default: 0,
      min: 0,
    },
    market_cap: {
      type: Number,
      default: 0,
      min: 0,
    },
    last_updated: {
      type: Date,
      default: Date.now,
    },
    logo_url: {
      type: String,
      default: '',
    },
    rank: {
      type: Number,
      default: 0,
    },
    circulating_supply: {
      type: Number,
      default: 0,
    },
    max_supply: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
tokenPriceSchema.index({ symbol: 1 });
tokenPriceSchema.index({ last_updated: -1 });
tokenPriceSchema.index({ market_cap: -1 });
tokenPriceSchema.index({ change_24h: -1 });
tokenPriceSchema.index({ volume_24h: -1 });

// Virtual for price ID
tokenPriceSchema.virtual('id').get(function () {
  return (this._id as any).toHexString();
});

// Ensure virtual fields are serialized
tokenPriceSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc: any, ret: any) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const TokenPrice = mongoose.model<ITokenPrice>('TokenPrice', tokenPriceSchema); 