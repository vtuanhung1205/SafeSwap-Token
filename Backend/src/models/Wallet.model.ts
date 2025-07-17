import mongoose, { Document, Schema } from 'mongoose';

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  address: string;
  publicKey: string;
  chainId: string;
  balance: number;
  isConnected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    address: {
      type: String,
      required: true,
      unique: true,
    },
    publicKey: {
      type: String,
      required: true,
    },
    chainId: {
      type: String,
      required: true,
      default: 'aptos-testnet',
    },
    balance: {
      type: Number,
      default: 0,
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for performance
walletSchema.index({ userId: 1 });
walletSchema.index({ address: 1 });
walletSchema.index({ isConnected: 1 });

// Virtual for wallet ID
walletSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtual fields are serialized
walletSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc: any, ret: any) {
    delete ret._id;
  },
});

export const Wallet = mongoose.model<IWallet>('Wallet', walletSchema); 