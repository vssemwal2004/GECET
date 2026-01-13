import express from 'express';
import { sendStudentOTP, verifyStudentOTP, getStudentProfile } from '../controllers/studentController.js';
import { verifyToken, verifyStudent } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/send-otp', sendStudentOTP);
router.post('/verify-otp', verifyStudentOTP);

// Protected student routes
router.get('/profile', verifyToken, verifyStudent, getStudentProfile);

export default router;
