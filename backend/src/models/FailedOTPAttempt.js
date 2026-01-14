import mongoose from 'mongoose';

const failedOTPAttemptSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Phone number must be exactly 10 digits'
    }
  },
  attemptedOTP: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // Auto-delete after expiry
  }
}, {
  timestamps: true
});

// Index for efficient querying
failedOTPAttemptSchema.index({ phone: 1, createdAt: -1 });

export default mongoose.model('FailedOTPAttempt', failedOTPAttemptSchema);
