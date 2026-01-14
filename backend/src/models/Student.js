import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v);
      },
      message: 'Phone number must be exactly 10 digits'
    }
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  campus: {
    type: String,
    required: true,
    trim: true
  },
  phase: {
    type: String,
    required: true,
    trim: true
  },
  university: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  offerLetterLink: {
    type: String,
    trim: true
  },
  result: {
    type: Number
  },
  paymentLink: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Student', studentSchema);
