import axios from 'axios';

/**
 * Send OTP via MSG91
 * @param {string} phone - 10 digit mobile number
 * @param {string} otp - OTP to send
 * @returns {Promise<boolean>} - Success status
 */
export const sendOTP = async (phone, otp) => {
  try {

    const apiUrl = 'https://control.msg91.com/api/v5/flow';
    
    const payload = {
      template_id: process.env.SMS_TEMPLATE_ID,
      recipients: [
        {
          mobiles: `91${phone}`,
          OTP: otp,
          Validity: "5"
        }
      ]
    };

    const response = await axios.post(apiUrl, payload, {
      headers: {
        'accept': 'application/json',
        'authkey': process.env.SMS_API_KEY,
        'content-type': 'application/json'
      }
    });

    if (response.data && response.data.type === 'success') {
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
