import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { saveAuth } from '../../utils/auth';

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone;
  const devOTP = location.state?.devOTP; // For development only
  
  const [otp, setOTP] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (!phone) {
      navigate('/student/login');
      return;
    }

    // Countdown timer
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phone, navigate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await studentAPI.verifyOTP(phone, otp);
      
      if (response.data.success) {
        saveAuth(response.data.token, response.data.user);
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');

    try {
      const response = await studentAPI.sendOTP(phone);
      
      if (response.data.success) {
        setTimer(300); // Reset timer
        setOTP(''); // Clear OTP input
        alert('OTP resent successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container-center">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="heading text-3xl mb-2">Verify OTP</h1>
          <p className="text-gray-600">
            Enter the OTP sent to <span className="font-semibold">{phone}</span>
          </p>
        </div>

        {devOTP && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg mb-4">
            <strong>Development Mode:</strong> OTP is {devOTP}
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
              className="input-field text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
              required
            />
            <p className="text-sm text-gray-500 mt-1 text-center">
              {timer > 0 ? (
                <>OTP expires in <span className="font-semibold text-[#dc2626]">{formatTime(timer)}</span></>
              ) : (
                <span className="text-[#dc2626]">OTP expired</span>
              )}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || timer === 0}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            onClick={handleResend}
            disabled={resending || timer > 240}
            className="text-[#2563eb] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resending ? 'Resending...' : 'Resend OTP'}
          </button>
          {timer > 240 && (
            <p className="text-xs text-gray-500">
              Resend available after 1 minute
            </p>
          )}
          <div>
            <button
              onClick={() => navigate('/student/login')}
              className="text-gray-600 hover:underline text-sm"
            >
              ← Change Mobile Number
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
