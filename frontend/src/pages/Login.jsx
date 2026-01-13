import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, studentAPI } from '../services/api';
import { saveAuth } from '../utils/auth';

const Login = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [adminData, setAdminData] = useState({ email: '', password: '' });
  
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOTP] = useState('');
  const [timer, setTimer] = useState(0);
  const [devOTP, setDevOTP] = useState('');

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
        setDevOTP(response.data.devOTP || '');
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

          {/* Tab Switcher */}
          <div className="flex gap-1 mb-6 bg-white bg-opacity-10 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setLoginType('student');
                setError('');
                resetStudentForm();
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                loginType === 'student'
                  ? 'bg-pure-white text-primary-purple'
                  : 'text-pure-white hover:bg-white hover:bg-opacity-5'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginType('admin');
                setError('');
                resetStudentForm();
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                loginType === 'admin'
                  ? 'bg-pure-white text-primary-purple'
                  : 'text-pure-white hover:bg-white hover:bg-opacity-5'
              }`}
            >
              Admin
            </button>
          </div>

          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-300 text-pure-white px-3 py-2 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          {devOTP && (
            <div className="bg-accent-yellow bg-opacity-20 border border-accent-yellow text-pure-white px-3 py-2 rounded-lg mb-4 text-sm">
              <strong>Dev OTP:</strong> {devOTP}
            </div>
          )}

          {/* Admin Login Form */}
          {loginType === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-pure-white text-sm mb-2 font-medium">Email</label>
                <input
                  type="email"
                  value={adminData.email}
                  onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-pure-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-accent-yellow focus:border-opacity-60 transition-colors"
                  placeholder="admin@gecet.com"
                  required
                />
              </div>

              <div>
                <label className="block text-pure-white text-sm mb-2 font-medium">Password</label>
                <input
                  type="password"
                  value={adminData.password}
                  onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 border border-white border-opacity-20 text-pure-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-accent-yellow focus:border-opacity-60 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-accent-yellow text-heading-dark font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          )}

          {/* Student Login Form */}
          {loginType === 'student' && !otpSent && (
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

          {/* Student OTP Verification Form */}
          {loginType === 'student' && otpSent && (
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

              <div className="text-center space-y-2 mt-4">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading || timer > 240}
                  className="text-accent-yellow hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend OTP
                </button>
                <div>
                  <button
                    type="button"
                    onClick={resetStudentForm}
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
