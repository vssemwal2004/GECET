import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, studentAPI } from '../services/api';
import { saveAuth } from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('student'); // 'admin' or 'student'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Admin form
  const [adminData, setAdminData] = useState({ email: '', password: '' });
  
  // Student form
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOTP] = useState('');
  const [timer, setTimer] = useState(0);
  const [devOTP, setDevOTP] = useState('');

  // Timer countdown
  useState(() => {
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

  // Admin Login Handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminAPI.login(adminData);
      
      if (response.data.success) {
        saveAuth(response.data.token, response.data.user);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Student Send OTP Handler
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
        setTimer(300); // 5 minutes
        setDevOTP(response.data.devOTP || '');
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Student Verify OTP Handler
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
        saveAuth(response.data.token, response.data.user);
        navigate('/student/dashboard');
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
        setDevOTP(response.data.devOTP || '');
        alert('OTP resent successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetStudentForm = () => {
    setOtpSent(false);
    setPhone('');
    setOTP('');
    setTimer(0);
    setError('');
  };

  return (
    <div className="container-center">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="heading text-3xl mb-2">GECET Login</h1>
          <p className="text-gray-600">Welcome to Student Admission Portal</p>
        </div>

        {/* Login Type Toggle */}
        <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setLoginType('student');
              setError('');
              resetStudentForm();
            }}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              loginType === 'student'
                ? 'bg-white text-[#2563eb] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Student Login
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginType('admin');
              setError('');
              resetStudentForm();
            }}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              loginType === 'admin'
                ? 'bg-white text-[#1e293b] shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Admin Login
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {devOTP && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg mb-4">
            <strong>Development Mode:</strong> OTP is {devOTP}
          </div>
        )}

        {/* Admin Login Form */}
        {loginType === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={adminData.email}
                onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                className="input-field"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={adminData.password}
                onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>
        )}

        {/* Student Login Form */}
        {loginType === 'student' && !otpSent && (
          <form onSubmit={handleSendOTP} className="space-y-4">
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
        )}

        {/* Student OTP Verification Form */}
        {loginType === 'student' && otpSent && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600">
                OTP sent to <span className="font-semibold">{phone}</span>
              </p>
            </div>

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
              {loading ? 'Verifying...' : 'Verify OTP & Login'}
            </button>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || timer > 240}
                className="text-[#2563eb] hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resending...' : 'Resend OTP'}
              </button>
              {timer > 240 && (
                <p className="text-xs text-gray-500">
                  Resend available after 1 minute
                </p>
              )}
              <div>
                <button
                  type="button"
                  onClick={resetStudentForm}
                  className="text-gray-600 hover:underline text-sm"
                >
                  ← Change Mobile Number
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
