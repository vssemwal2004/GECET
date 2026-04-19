import express from 'express';
import { sendStudentOTP, verifyStudentOTP, getStudentProfile, getStudentAnnouncement, getStudentUFMContent } from '../controllers/studentController.js';
import { verifyToken, verifyStudent } from '../middleware/auth.js';

const router = express.Router();

// Public routes
//router.post('/send-otp', sendStudentOTP);
//router.post('/verify-otp', verifyStudentOTP);

// Protected student routes
router.get('/profile', verifyToken, verifyStudent, getStudentProfile);
router.get('/announcement', verifyToken, verifyStudent, getStudentAnnouncement);
router.get('/ufm-content', verifyToken, verifyStudent, getStudentUFMContent);

export default router;
