import { Document, model, Schema } from 'mongoose';

export interface iAdminUserDocument extends Document {
  userName: string;
  password?: string;
  createdAt: Date;
  userType: string;
  lastActive: Date;
}

const adminUserSchema = new Schema({
  userType: {
    type: String,
    enum: ['user', 'admin'],
    default: 'admin',
  },
  password: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
    unique: true,
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

export const Admin = model<iAdminUserDocument>('Admin', adminUserSchema);
