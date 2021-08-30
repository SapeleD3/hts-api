import { Document, model, Schema } from 'mongoose';

export type NetworkUser = {
  userId: string;
  joinedAt: Date;
};
export interface iNetworkDocument extends Document {
  networkID: string;
  TrackId: string;
  networkLink: string;
  networkOwner: string;
  networkChildren: NetworkUser[];
  updatedAt: Date;
  createdAt: Date;
}

const networkSchema = new Schema({
  networkID: {
    type: String,
    required: true,
  },
  networkLink: {
    type: String,
    required: true,
  },
  networkOwner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  networkChildren: [
    {
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
      joinedAt: {
        type: Date,
      },
    },
  ],
  track: {
    type: Schema.Types.ObjectId,
    ref: 'Track',
    required: true,
  },
  updatedAt: {
    type: Date,
    default: new Date(),
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

export const Network = model<iNetworkDocument>('Network', networkSchema);
