import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const AppointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mrId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'cancelled', 'completed', 'rescheduled'],
    default: 'scheduled'
  },
  meetingType: {
    type: String,
    enum: ['in-person', 'video-call', 'phone-call'],
    default: 'in-person'
  },
  location: {
    type: String,
    default: ''
  },
  meetingLink: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  reminders: [{
    reminderTime: {
      type: Date,
      required: true
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  attachments: [{
    filename: String,
    fileUrl: String,
    fileType: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

// Index for efficient querying
AppointmentSchema.index({ doctorId: 1, appointmentDate: 1 });
AppointmentSchema.index({ mrId: 1, appointmentDate: 1 });
AppointmentSchema.index({ status: 1 });

export const Appointment = model('Appointment', AppointmentSchema);
