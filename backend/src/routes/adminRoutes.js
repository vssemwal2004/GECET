import express from 'express';
import multer from 'multer';
import { adminLogin, uploadCSV, getAllStudents, getAnnouncement, updateAnnouncement, addEmployee, getEmployees, updateEmployee, deleteEmployee } from '../controllers/adminController.js';
import { verifyToken, verifyAdmin, verifyAdminOrEmployee } from '../middleware/auth.js';

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
router.get('/students', verifyToken, verifyAdminOrEmployee, getAllStudents);
router.get('/announcement', verifyToken, verifyAdmin, getAnnouncement);
router.put('/announcement', verifyToken, verifyAdmin, updateAnnouncement);
router.post('/employees', verifyToken, verifyAdmin, addEmployee);
router.get('/employees', verifyToken, verifyAdmin, getEmployees);
router.put('/employees/:id', verifyToken, verifyAdmin, updateEmployee);
router.delete('/employees/:id', verifyToken, verifyAdmin, deleteEmployee);

export default router;
