import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
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

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;
