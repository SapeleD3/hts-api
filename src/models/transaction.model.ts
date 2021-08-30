import { Document, model, Schema } from 'mongoose';

export interface iTransactionDocument extends Document {
  status: string;
  reference: string;
  amountSent: Number;
  user: string;
  createdAt: Date;
}

const transactionSchema = new Schema({
  status: {
    type: String,
    required: true,
  },
  amountSent: {
    type: Number,
    required: true,
  },
  reference: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

export const Transaction = model<iTransactionDocument>(
  'Transaction',
  transactionSchema
);
