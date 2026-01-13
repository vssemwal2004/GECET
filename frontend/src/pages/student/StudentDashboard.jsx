import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { logout, getUser } from '../../utils/auth';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await studentAPI.getProfile();
      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDownloadOffer = () => {
    if (profile?.offerLetterLink) {
      window.open(profile.offerLetterLink, '_blank');
    }
  };

  const handlePayment = () => {
    if (profile?.paymentLink) {
      window.open(profile.paymentLink, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="container-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2563eb] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-center">
        <div className="card max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="heading text-xl mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={fetchProfile} className="btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="heading text-2xl">Student Dashboard</h1>
          <button onClick={handleLogout} className="btn-danger text-sm py-2">
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Card */}
        <div className="card mb-6 bg-gradient-to-r from-[#2563eb] to-[#1e40af] text-white">
          <h2 className="text-2xl font-bold mb-2">Welcome, {profile?.name}! 👋</h2>
          <p className="text-blue-100">Here's your admission information</p>
        </div>

        {/* Profile Information */}
        <div className="card mb-6">
          <h3 className="heading text-xl mb-4">Personal Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="font-semibold text-gray-900">{profile?.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email Address</p>
              <p className="font-semibold text-gray-900">{profile?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mobile Number</p>
              <p className="font-semibold text-gray-900">{profile?.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Course</p>
              <p className="font-semibold text-gray-900">{profile?.course}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Campus</p>
              <p className="font-semibold text-gray-900">{profile?.campus}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Result / Score</p>
              <p className="font-semibold text-gray-900">
                {profile?.result ? `${profile.result}%` : 'Pending'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Offer Letter Card */}
          <div className="card">
            <div className="flex items-center mb-3">
              <div className="bg-[#16a34a] bg-opacity-10 p-3 rounded-lg mr-3">
                <svg className="w-6 h-6 text-[#16a34a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Offer Letter</h4>
                <p className="text-sm text-gray-500">Download your admission offer</p>
              </div>
            </div>
            <button
              onClick={handleDownloadOffer}
              disabled={!profile?.offerLetterLink}
              className="btn-success w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profile?.offerLetterLink ? 'Download Offer Letter' : 'Not Available Yet'}
            </button>
          </div>

          {/* Payment Card */}
          <div className="card">
            <div className="flex items-center mb-3">
              <div className="bg-[#2563eb] bg-opacity-10 p-3 rounded-lg mr-3">
                <svg className="w-6 h-6 text-[#2563eb]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Make Payment</h4>
                <p className="text-sm text-gray-500">Pay your admission fees</p>
              </div>
            </div>
            <button
              onClick={handlePayment}
              disabled={!profile?.paymentLink}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profile?.paymentLink ? 'Proceed to Payment' : 'Not Available Yet'}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="card mt-6 bg-gray-50">
          <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
          <p className="text-sm text-gray-600">
            If you have any questions about your admission or face any issues, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
