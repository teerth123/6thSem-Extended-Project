

const VideoTrackingSchema = new mongoose.Schema(
    {
      videoId: {
        type: String,
        required: true
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      totalWatchTime: {
        type: Number,
        default: 0
      },
      watchPercentage: {
        type: Number,
        default: 0
      },
      completed: {
        type: Boolean,
        default: false
      },
      segments: [{
        start: Number,
        end: Number
      }],
      interactions: [{
        type: {
          type: String,
          enum: ['play', 'pause', 'seek']
        },
        videoTime: Number,
        from: Number,
        to: Number,
        timestamp: Date
      }],
      watchDate: {
        type: Date,
        default: Date.now
      }
    },
    { timestamps: true }
  );
  
  VideoTrackingSchema.index({ videoId: 1, userId: 1 });

  const Videotracking = new model('Videotracking', VideoTrackingSchema)


  exports.default = {Videotracking}