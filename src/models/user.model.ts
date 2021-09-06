import { Document, model, Schema } from 'mongoose';

export type ReferralDetails = {
  user: string;
  referredAt: Date;
  track: string;
  link: string;
};

export type NetworkDetails = {
  networkID: string;
  networkLink: string;
  trackType: string;
};

export interface iUserDocument extends Document {
  phoneNumber: string;
  email: string;
  fullName: string;
  userName: string;
  referredBy?: ReferralDetails;
  sNetworks?: string;
  pNetworks?: string;
  password?: string;
  createdAt: Date;
  userType: string;
  activationLevel: number;
  amount: 0;
  membersCount: 0;
  activatedUser: boolean;
  lastActive: Date;
}

const userSchema = new Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  activationLevel: {
    type: Number,
    default: 0,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
  },
  referredBy: {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    referredAt: {
      type: Date,
    },
    track: {
      type: Schema.Types.ObjectId,
      ref: 'Track',
    },
    link: {
      type: String,
    },
  },
  sNetworks: {
    type: Schema.Types.ObjectId,
    ref: 'Network',
  },
  pNetworks: {
    type: Schema.Types.ObjectId,
    ref: 'Network',
  },
  amount: {
    type: Number,
    default: 0,
  },
  membersCount: {
    type: Number,
    default: 0,
  },
  activatedUser: {
    type: Boolean,
    default: false,
  },
  lastActive: {
    type: Date,
    default: new Date(),
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

export const User = model<iUserDocument>('User', userSchema);
