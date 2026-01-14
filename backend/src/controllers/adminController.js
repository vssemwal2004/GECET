import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Student from '../models/Student.js';
import Announcement from '../models/Announcement.js';
import fs from 'fs';
import csvParser from 'csv-parser';

/**
 * Admin Login
 * POST /api/admin/login
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Check admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: adminEmail, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        email: adminEmail,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Upload CSV and save students
 * POST /api/admin/upload-csv
 */
export const uploadCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No CSV file uploaded'
      });
    }

    // Validate file type
    if (req.file.mimetype !== 'text/csv' && !req.file.originalname.endsWith('.csv')) {
      // Delete uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Only CSV files are allowed'
      });
    }

    const students = [];
    const errors = [];
    let lineNumber = 1;

    // Parse CSV
    fs.createReadStream(req.file.path)
      .pipe(csvParser())
      .on('data', (row) => {
        lineNumber++;
        
        // Normalize row keys to lowercase for case-insensitive matching
        const normalizedRow = {};
        Object.keys(row).forEach(key => {
          normalizedRow[key.toLowerCase().trim()] = row[key];
        });
        
        // Validate required fields (case-insensitive)
        const requiredFields = ['name', 'email', 'phone', 'course', 'campus', 'phase', 'university', 'department'];
        const missingFields = requiredFields.filter(field => !normalizedRow[field]);
        
        if (missingFields.length > 0) {
          errors.push({
            line: lineNumber,
            error: `Missing required fields: ${missingFields.join(', ')}`
          });
          return;
        }

        // Validate phone number
        if (!/^\d{10}$/.test(normalizedRow.phone.trim())) {
          errors.push({
            line: lineNumber,
            error: 'Phone number must be exactly 10 digits'
          });
          return;
        }

        students.push({
          name: normalizedRow.name.trim(),
          email: normalizedRow.email.trim().toLowerCase(),
          phone: normalizedRow.phone.trim(),
          course: normalizedRow.course.trim(),
          campus: normalizedRow.campus.trim(),
          phase: normalizedRow.phase.trim(),
          university: normalizedRow.university.trim(),
          department: normalizedRow.department.trim(),
          offerLetterLink: normalizedRow.offerletterlink?.trim() || '',
          result: normalizedRow.result?.trim() || '',
          paymentLink: normalizedRow.paymentlink?.trim() || ''
        });
      })
      .on('end', async () => {
        try {
          // Delete uploaded file
          fs.unlinkSync(req.file.path);

          if (students.length === 0) {
            return res.status(400).json({
              success: false,
              message: 'No valid student data found in CSV',
              errors
            });
          }

          // Save or update students in database
          const savedStudents = [];
          const updateErrors = [];

          for (const studentData of students) {
            try {
              // Check if student with same phone exists
              const existingStudent = await Student.findOne({ phone: studentData.phone });

              if (existingStudent) {
                // Update existing student
                const updated = await Student.findOneAndUpdate(
                  { phone: studentData.phone },
                  studentData,
                  { new: true, runValidators: true }
                );
                savedStudents.push(updated);
              } else {
                // Create new student
                const newStudent = await Student.create(studentData);
                savedStudents.push(newStudent);
              }
            } catch (err) {
              updateErrors.push({
                phone: studentData.phone,
                error: err.message
              });
            }
          }

          res.json({
            success: true,
            message: 'CSV processed successfully',
            data: {
              totalProcessed: students.length,
              successfulSaves: savedStudents.length,
              parseErrors: errors.length,
              saveErrors: updateErrors.length
            },
            errors: errors.length > 0 || updateErrors.length > 0 ? { parseErrors: errors, saveErrors: updateErrors } : undefined
          });

        } catch (error) {
          console.error('Error processing students:', error);
          res.status(500).json({
            success: false,
            message: 'Error processing CSV data'
          });
        }
      })
      .on('error', (error) => {
        // Delete uploaded file
        fs.unlinkSync(req.file.path);
        console.error('CSV parsing error:', error);
        res.status(500).json({
          success: false,
          message: 'Error parsing CSV file'
        });
      });

  } catch (error) {
    console.error('Upload CSV error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all students (for admin dashboard)
 * GET /api/admin/students
 */
export const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get Announcement
 * GET /api/admin/announcement
 */
export const getAnnouncement = async (req, res) => {
  try {
    let announcement = await Announcement.findOne().sort({ updatedAt: -1 });
    
    // Create default announcement if none exists
    if (!announcement) {
      announcement = await Announcement.create({
        content: '<p>Welcome to GECET Admission Portal!</p>',
        updatedBy: 'Admin'
      });
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
 * Update Announcement
 * PUT /api/admin/announcement
 */
export const updateAnnouncement = async (req, res) => {
  try {
    const { content } = req.body;

    if (content === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    let announcement = await Announcement.findOne().sort({ updatedAt: -1 });

    if (!announcement) {
      announcement = await Announcement.create({
        content,
        updatedBy: req.user?.email || 'Admin'
      });
    } else {
      announcement.content = content;
      announcement.updatedBy = req.user?.email || 'Admin';
      await announcement.save();
    }

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      announcement
    });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update announcement'
    });
  }
};

