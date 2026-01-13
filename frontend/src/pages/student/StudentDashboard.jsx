import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { logout, getUser } from '../../utils/auth';
import 'react-quill/dist/quill.snow.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchAnnouncement();
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
    

  const fetchAnnouncement = async () => {
    try {
      const response = await studentAPI.getAnnouncement();
      if (response.data.success) {
        setAnnouncement(response.data.announcement.content);
      }
    } catch (err) {
      console.error('Failed to fetch announcement:', err);
    }
  };  setLoading(false);
    }
  };

  const fetchAnnouncement = async () => {
    try {
      const response = await studentAPI.getAnnouncement();
      if (response.data.success) {
        setAnnouncement(response.data.announcement.content);
      }
    } catch (err) {
      console.error('Failed to fetch announcement:', err);
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

        {/* Announcement Section */}
        {announcement && (
          <div className="card mb-6 bg-amber-50 border border-amber-200">
            <h3 className="heading text-xl mb-4 text-amber-900">📢 Announcement</h3>
            <div 
              className="ql-editor p-0" 
              dangerouslySetInnerHTML={{ __html: announcement }}
              style={{ 
                border: 'none',
                fontSize: '0.95rem',
                padding: 0
              }}
            />
          </div>
        )}

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
          {/* Offer Letter */}
          <div className="card bg-green-50 border-green-200">
            <div className="flex items-center mb-4">
              <div className="bg-green-500 text-white p-3 rounded-lg mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="heading text-lg">Offer Letter</h4>
                <p className="text-sm text-gray-600">Download your admission offer</p>
              </div>
            </div>
            <button
              onClick={handleDownloadOffer}
              disabled={!profile?.offerLetterLink}
              className="btn-success w-full"
            >
              {profile?.offerLetterLink ? 'Download Offer Letter' : 'Not Available Yet'}
            </button>
          </div>

          {/* Payment */}
          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 text-white p-3 rounded-lg mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h4 className="heading text-lg">Make Payment</h4>
                <p className="text-sm text-gray-600">Pay your admission fees</p>
              </div>
            </div>
            <button
              onClick={handlePayment}
              disabled={!profile?.paymentLink}
              className="btn-primary w-full"
            >
              {profile?.paymentLink ? 'Proceed to Payment' : 'Not Available Yet'}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="card bg-yellow-50 border-yellow-200 mt-6">
          <h4 className="heading text-lg mb-2">Need Help?</h4>
          <p className="text-gray-600 text-sm">
            If you have any questions about your admission or face any issues, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
