import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const SharedVideoTrackingSchema = new mongoose.Schema({
  messageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  currentTime: {
    type: Number,
    default: 0,
    min: 0
  },
  duration: {
    type: Number,
    default: 0,
    min: 0
  },
  watchPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  totalWatchTime: {
    type: Number,
    default: 0,
    min: 0
  },
  lastWatchedAt: {
    type: Date,
    default: null
  },
  firstWatchedAt: {
    type: Date,
    default: null
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  }
}, { timestamps: true });

// Compound index to ensure uniqueness per message per receiver per conversation
SharedVideoTrackingSchema.index({ 
  messageId: 1, 
  receiverId: 1, 
  conversationId: 1 
}, { unique: true });

// Additional indexes for efficient querying
SharedVideoTrackingSchema.index({ senderId: 1, createdAt: -1 });
SharedVideoTrackingSchema.index({ receiverId: 1, lastWatchedAt: -1 });
SharedVideoTrackingSchema.index({ conversationId: 1, createdAt: -1 });

// Pre-save middleware to calculate watch percentage
SharedVideoTrackingSchema.pre('save', function(next) {
  if (this.duration > 0) {
    this.watchPercentage = Math.min(Math.round((this.currentTime / this.duration) * 100), 100);
    this.isCompleted = this.watchPercentage >= 95; // Consider 95% as completed
  }
  next();
});

export const SharedVideoTracking = model('SharedVideoTracking', SharedVideoTrackingSchema);
