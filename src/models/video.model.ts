import { Document, model, Schema } from 'mongoose';

export interface iVideoDocument extends Document {
  name: string;
  videoUrl: string;
  createdAt?: Date;
  category: string;
  channel: Date;
}

const videoSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  channel: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

export const Video = model<iVideoDocument>('Video', videoSchema);
