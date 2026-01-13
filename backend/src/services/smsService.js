import axios from 'axios';

/**
 * Send OTP via 99SMSService
 * @param {string} phone - 10 digit mobile number
 * @param {string} otp - OTP to send
 * @returns {Promise<boolean>} - Success status
 */
export const sendOTP = async (phone, otp) => {
  try {
    // 99SMS Service API Integration
    // Replace this URL with actual 99SMS API endpoint
    const apiUrl = 'https://api.99smsservice.com/api/v2/SendSMS';
    
    const payload = {
      ApiKey: process.env.SMS_API_KEY,
      ClientId: process.env.SMS_SENDER_ID,
      MobileNumbers: phone,
      Message: `Your GECET OTP is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`,
      SenderId: process.env.SMS_SENDER_ID
    };

    const response = await axios.post(apiUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Check if SMS was sent successfully
    if (response.data && response.data.status === 'success') {
      console.log(`OTP sent successfully to ${phone}`);
      return true;
    }
    
    console.error('Failed to send OTP:', response.data);
    return false;
    
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    return false;
  }
};

/**
 * Generate a random 6-digit OTP
 * @returns {string} - 6 digit OTP
 */
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
