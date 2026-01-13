import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';

const StudentLogin = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate phone number
    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await studentAPI.sendOTP(phone);
      
      if (response.data.success) {
        // Navigate to OTP verification page with phone number
        navigate('/student/otp', { state: { phone, devOTP: response.data.devOTP } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-center">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="heading text-3xl mb-2">Student Login</h1>
          <p className="text-gray-600">Enter your mobile number to login</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Mobile Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className="input-field"
              placeholder="Enter 10 digit mobile number"
              maxLength={10}
              required
            />
            <p className="text-sm text-gray-500 mt-1">
              You will receive an OTP on this number
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/admin/login" className="text-[#2563eb] hover:underline">
            Login as Admin
          </a>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
