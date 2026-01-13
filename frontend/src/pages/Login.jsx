import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../services/api';
import { saveAuth } from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOTP] = useState('');
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 0) {
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
    }
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await studentAPI.sendOTP(phone);
      
      if (response.data.success) {
        setOtpSent(true);
        setTimer(300);
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
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
        const { token, user } = response.data;
        saveAuth(token, user);

        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/student/dashboard');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await studentAPI.sendOTP(phone);
      
      if (response.data.success) {
        setTimer(300);
        setOTP('');
        alert('OTP resent successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOtpSent(false);
    setPhone('');
    setOTP('');
    setTimer(0);
    setError('');
  };

  return (
    <div className="min-h-screen bg-pure-white flex items-center justify-center p-8">
      <div className="w-full max-w-6xl h-[480px] bg-pure-white shadow-2xl rounded-2xl overflow-hidden flex">
        
        {/* Left Section - Image Only (70%) */}
        <div className="w-[70%] relative bg-gray-50 flex items-center justify-center">
          <img 
            src="/assects/login-lmgg.webp" 
            alt="GECET Login" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right Section - Login Panel (30%) */}
        <div className="w-[30%] bg-primary-purple flex flex-col justify-center px-10">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-pure-white mb-2">Welcome</h1>
            <p className="text-pure-white text-sm opacity-90">Login to your account</p>
          </div>

          {/* Single login type - phone + OTP */}

          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-300 text-pure-white px-3 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Phone input (admin or student) */}
          {!otpSent && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-pure-white text-sm mb-2 font-medium">Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-pure-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-accent-yellow focus:border-opacity-60 transition-colors"
                  placeholder="Enter 10 digit number"
                  maxLength={10}
                  required
                />
                <p className="text-pure-white text-xs mt-2 opacity-70">
                  OTP will be sent to this number
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || phone.length !== 10}
                className="w-full bg-accent-yellow text-heading-dark font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* OTP Verification Form */}
          {otpSent && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="mb-4">
                <p className="text-pure-white text-sm opacity-90">
                  OTP sent to <span className="font-semibold">{phone}</span>
                </p>
              </div>

              <div>
                <label className="block text-pure-white text-sm mb-2 font-medium">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOTP(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-pure-white text-center text-2xl tracking-widest placeholder-white placeholder-opacity-50 focus:outline-none focus:border-accent-yellow focus:border-opacity-60 transition-colors"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-pure-white text-xs mt-2 text-center opacity-80">
                  {timer > 0 ? (
                    <>Expires in <span className="font-semibold">{formatTime(timer)}</span></>
                  ) : (
                    <span className="text-accent-yellow">OTP expired</span>
                  )}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6 || timer === 0}
                className="w-full bg-accent-yellow text-heading-dark font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <div className="text-center mt-4 space-y-2">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading || timer > 240}
                  className="text-accent-yellow hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Resending...' : 'Resend OTP'}
                </button>
                {timer > 240 && (
                  <p className="text-xs text-pure-white opacity-60">
                    Resend available after 1 minute
                  </p>
                )}
                <div>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-pure-white hover:underline text-sm opacity-80"
                  >
                    ← Change Number
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
