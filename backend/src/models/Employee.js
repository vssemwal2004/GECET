import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
    },
    createdBy: {
      type: String,
      default: 'admin'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Employee', employeeSchema);
