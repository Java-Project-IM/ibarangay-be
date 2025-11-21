import mongoose, { Schema } from 'mongoose';
import { IComplaint } from '../types';

const complaintSchema = new Schema<IComplaint>(
  {
    userId: {
      type: String,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'resolved', 'closed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    attachments: [{
      type: String,
    }],
    response: {
      type: String,
    },
    resolvedBy: {
      type: String,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
complaintSchema.index({ userId: 1, status: 1 });
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ createdAt: -1 });

export default mongoose.model<IComplaint>('Complaint', complaintSchema);