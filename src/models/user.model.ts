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
  networks?: NetworkDetails[];
  password?: string;
  createdAt: Date;
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
  networks: [
    {
      networkID: {
        type: Schema.Types.ObjectId,
        ref: 'Network',
      },
      networkLink: {
        type: String,
      },
      trackType: {
        type: Schema.Types.ObjectId,
        ref: 'Track',
      },
    },
  ],
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
