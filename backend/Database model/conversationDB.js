import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const ConversationSchema = new mongoose.Schema(
    {
      participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }],
      lastMessage: {
        type: String,
        default: ''
      },
      lastMessageTime: {
        type: Date,
        default: Date.now
      },
      unreadCount: {
        type: Map,
        of: Number,
        default: {}
      }
    },
    { timestamps: true }
  );
  
  // Create a compound index for participants but not unique to avoid conflicts
  ConversationSchema.index({ participants: 1 });

  export const Conversation = new model('Conversation', ConversationSchema);