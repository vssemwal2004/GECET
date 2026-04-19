import mongoose from 'mongoose';

const ufmContentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      default: ''
    },
    updatedBy: {
      type: String,
      default: 'Admin'
    }
  },
  {
    timestamps: true
  }
);

const UFMContent = mongoose.model('UFMContent', ufmContentSchema);

export default UFMContent;
