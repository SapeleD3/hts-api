import { Document, model, Schema } from 'mongoose';

export interface iTrackDocument extends Document {
  trackName: string;
  entryAmount: number;
  cycles: number;
  createdAt: Date;
}

const trackSchema = new Schema({
  trackName: {
    type: String,
    required: true,
  },
  entryAmount: {
    type: Number,
    required: true,
  },
  cycles: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

export const Track = model<iTrackDocument>('Track', trackSchema);
