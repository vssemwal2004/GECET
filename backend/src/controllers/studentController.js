import jwt from 'jsonwebtoken';
import validator from 'validator';
import Student from '../models/Student.js';
import OTP from '../models/OTP.js';
import FailedOTPAttempt from '../models/FailedOTPAttempt.js';
import Announcement from '../models/Announcement.js';
import { generateOTP, sendOTP } from '../services/smsService.js';

// In-memory tracker for OTP request cooldowns
const otpRequestTracker = new Map();

// Cleanup old entries from tracker every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of otpRequestTracker.entries()) {
    if (now - value > 3600000) { // Remove entries older than 1 hour
      otpRequestTracker.delete(key);
    }
  }
}, 3600000);

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

    // Sanitize phone input - trim only (no escape for numeric values)
    const sanitizedPhone = phone.trim();

    const adminPhone = process.env.ADMIN_PHONE;
    const isAdminPhone = adminPhone && sanitizedPhone === adminPhone;

    // If not admin phone, ensure student exists
    if (!isAdminPhone) {
      const student = await Student.findOne({ phone: sanitizedPhone });
      if (!student) {
        return res.status(404).json({
          success: false,
          message: 'Student not found with this phone number'
        });
      }
    }

    // ENHANCED RATE LIMITING
    // 1. Check in-memory cooldown (3 minutes between requests)
    const now = Date.now();
    const lastRequest = otpRequestTracker.get(sanitizedPhone);
    const cooldownPeriod = 180000; // 3 minutes in milliseconds
    
    if (lastRequest && (now - lastRequest) < cooldownPeriod) {
      const waitTime = Math.ceil((cooldownPeriod - (now - lastRequest)) / 1000);
      const minutes = Math.floor(waitTime / 60);
      const seconds = waitTime % 60;
      return res.status(429).json({
        success: false,
        message: `Please wait ${minutes}:${seconds.toString().padStart(2, '0')} minutes before requesting another OTP`
      });
    }

    // 2. Check daily limit (maximum 10 OTP requests per day)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const dailyOTPCount = await OTP.countDocuments({
      phone: sanitizedPhone,
      createdAt: { $gte: todayStart }
    });
    
    if (dailyOTPCount >= 10) {
      return res.status(429).json({
        success: false,
        message: 'Daily OTP limit (10 requests) reached. Please try again tomorrow.'
      });
    }

    // 3. Check if OTP was sent recently (within last 3 minutes) - database check
    const recentOTP = await OTP.findOne({
      phone: sanitizedPhone,
      createdAt: { $gte: new Date(Date.now() - cooldownPeriod) }
    });

    if (recentOTP) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 3 minutes before requesting another OTP'
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Set expiry time (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete any existing OTPs for this phone
    await OTP.deleteMany({ phone: sanitizedPhone });
    
    // Clear any old failed attempts to give fresh 4 attempts with new OTP
    await FailedOTPAttempt.deleteMany({ phone: sanitizedPhone });

    // Save OTP to database
    await OTP.create({ phone: sanitizedPhone, otp, expiresAt });
    
    // Update in-memory tracker
    otpRequestTracker.set(sanitizedPhone, now);

    // Send OTP via SMS
    const smsSent = await sendOTP(sanitizedPhone, otp);

    if (!smsSent) {
      console.error('Failed to send SMS');
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.'
      });
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

    // Sanitize inputs - trim and validate format only (don't escape numeric values)
    const sanitizedPhone = phone.trim();
    const sanitizedOTP = otp.trim();
    
    // Validate phone format
    if (!/^\d{10}$/.test(sanitizedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }
    
    // Validate OTP format
    if (!/^\d{6}$/.test(sanitizedOTP)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits'
      });
    }

    // BRUTE FORCE PROTECTION - Check actual failed attempts
    // Allow 4 wrong attempts per OTP session before blocking
    const recentFailedAttempts = await FailedOTPAttempt.countDocuments({
      phone: sanitizedPhone,
      createdAt: { $gte: new Date(Date.now() - 300000) } // Last 5 minutes (OTP validity period)
    });

    if (recentFailedAttempts >= 4) {
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.'
      });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ phone: sanitizedPhone, otp: sanitizedOTP });

    if (!otpRecord) {
      // Log failed attempt
      const failedAttemptExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      await FailedOTPAttempt.create({
        phone: sanitizedPhone,
        attemptedOTP: sanitizedOTP,
        ipAddress: req.ip || req.connection?.remoteAddress,
        expiresAt: failedAttemptExpiry
      });

      const remainingAttempts = 4 - recentFailedAttempts - 1;
      return res.status(401).json({
        success: false,
        message: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.`
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
    
    // Clear any failed attempts for this phone after successful verification
    await FailedOTPAttempt.deleteMany({ phone: sanitizedPhone });

    const adminPhone = process.env.ADMIN_PHONE;

    // If phone matches admin phone, log in as admin
    if (adminPhone && sanitizedPhone === adminPhone) {
      const token = jwt.sign(
        {
          phone: sanitizedPhone,
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
          phone: sanitizedPhone,
          role: 'admin'
        }
      });
    }

    // Otherwise, treat as student login
    const student = await Student.findOne({ phone: sanitizedPhone });

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
        phase: student.phase,
        university: student.university,
        department: student.department,
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

/**
 * Get Announcement for Students
 * GET /api/student/announcement
 */
export const getStudentAnnouncement = async (req, res) => {
  try {
    let announcement = await Announcement.findOne().sort({ updatedAt: -1 });
    
    if (!announcement) {
      announcement = {
        content: '<p>Welcome to GECET Admission Portal!</p>',
        updatedAt: new Date()
      };
    }

    res.json({
      success: true,
      announcement
    });
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcement'
    });
  }
};

/**
 * Get All Announcements for Students
 * GET /api/student/announcements
 */
export const getAllStudentAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: announcements
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements'
    });
  }
};
