import express from 'express';
import {
  sendStudentOTP as sendOtp,
  verifyStudentOTP as verifyOtp
} from '../controllers/studentController.js';

const router = express.Router();

// ❌ NO CSRF HERE
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

export default router;
