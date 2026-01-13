import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import OTP from '../models/OTP.js';
import { generateOTP, sendOTP } from '../services/smsService.js';

/**
 * Send OTP to student's mobile
 * POST /api/student/send-otp
 */
export const sendStudentOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    // Validation
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Validate phone format (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be exactly 10 digits'
      });
    }

    const adminPhone = process.env.ADMIN_PHONE;
    const isAdminPhone = adminPhone && phone === adminPhone;

    // If not admin phone, ensure student exists
    if (!isAdminPhone) {
      const student = await Student.findOne({ phone });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found with this phone number'
        });
      }
    }

    // Rate limiting: Check if OTP was sent recently (within last minute)
    const recentOTP = await OTP.findOne({
      phone,
      createdAt: { $gte: new Date(Date.now() - 60000) } // Within last 1 minute
    });

    if (recentOTP) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting another OTP'
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Set expiry time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete any existing OTPs for this phone
    await OTP.deleteMany({ phone });

    // Save OTP to database
    await OTP.create({ phone, otp, expiresAt });

    // Send OTP via SMS
    const smsSent = await sendOTP(phone, otp);

    if (!smsSent) {
      console.error('Failed to send SMS, but OTP saved in DB');
      // In development, you might want to return the OTP
      // Remove this in production!
      if (process.env.NODE_ENV === 'development') {
        return res.json({
          success: true,
          message: 'OTP generated (SMS service unavailable)',
          devOTP: otp // Only for development
        });
      }
    }

    res.json({
      success: true,
      message: 'OTP sent successfully to your mobile number'
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Verify OTP and login student
 * POST /api/student/verify-otp
 */
export const verifyStudentOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Validation
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required'
      });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ phone, otp });

    if (!otpRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Check if OTP has expired
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(401).json({
        success: false,
        message: 'OTP has expired. Please request a new one.'
      });
    }

    // Delete used OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    const adminPhone = process.env.ADMIN_PHONE;

    // If phone matches admin phone, log in as admin
    if (adminPhone && phone === adminPhone) {
      const token = jwt.sign(
        {
          phone,
          role: 'admin'
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return res.json({
        success: true,
        message: 'Admin login successful',
        token,
        user: {
          name: 'Admin',
          email: process.env.ADMIN_EMAIL || '',
          phone,
          role: 'admin'
        }
      });
    }

    // Otherwise, treat as student login
    const student = await Student.findOne({ phone });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const token = jwt.sign(
      {
        studentId: student._id,
        phone: student.phone,
        role: 'student'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        phone: student.phone,
        role: 'student'
      }
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get student profile
 * GET /api/student/profile
 */
export const getStudentProfile = async (req, res) => {
  try {
    // Student ID comes from JWT token (set by verifyToken middleware)
    const studentId = req.user.studentId;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    res.json({
      success: true,
      data: {
        name: student.name,
        email: student.email,
        phone: student.phone,
        course: student.course,
        campus: student.campus,
        result: student.result,
        offerLetterLink: student.offerLetterLink,
        paymentLink: student.paymentLink
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
