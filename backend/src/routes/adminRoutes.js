import express from 'express';
import multer from 'multer';
import { adminLogin, uploadCSV, getAllStudents } from '../controllers/adminController.js';
import { verifyToken, verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for CSV upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Public routes
router.post('/login', adminLogin);

// Protected admin routes
router.post('/upload-csv', verifyToken, verifyAdmin, upload.single('csvFile'), uploadCSV);
router.get('/students', verifyToken, verifyAdmin, getAllStudents);

export default router;
