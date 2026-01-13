import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { logout, getUser } from '../../utils/auth';
import StudentNavbar from '../../components/StudentNavbar';

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
      <div className="min-h-screen bg-gray-50">
        <StudentNavbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-purple border-t-transparent mx-auto mb-4"></div>
            <p className="text-text-muted">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentNavbar />
        <div className="flex items-center justify-center h-screen">
          <div className="bg-pure-white border border-gray-200 rounded-lg p-6 max-w-md">
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-heading-dark mb-2">Error</h2>
              <p className="text-text-muted mb-4">{error}</p>
              <button 
                onClick={fetchProfile} 
                className="bg-primary-purple text-pure-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Personal Information Section */}
        <div className="bg-pure-white border border-gray-200 rounded-lg p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-heading-dark mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <p className="text-xs text-text-muted mb-1">Full Name</p>
              <p className="text-sm font-semibold text-heading-dark">{profile?.name}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Email Address</p>
              <p className="text-sm font-semibold text-heading-dark break-all">{profile?.email}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Mobile Number</p>
              <p className="text-sm font-semibold text-heading-dark">{profile?.phone}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Course</p>
              <p className="text-sm font-semibold text-heading-dark">{profile?.course}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Campus</p>
              <p className="text-sm font-semibold text-heading-dark">{profile?.campus}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-1">Result / Score</p>
              <p className="text-sm font-semibold text-heading-dark">
                {profile?.result ? `${profile.result}%` : 'Pending'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* Offer Letter Card */}
          <div className="bg-pure-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-start sm:items-center mb-4">
              <div className="bg-green-50 p-2 sm:p-3 rounded-lg mr-3 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-semibold text-heading-dark">Offer Letter</h4>
                <p className="text-xs sm:text-sm text-text-muted">Download your admission offer</p>
              </div>
            </div>
            <button
              onClick={handleDownloadOffer}
              disabled={!profile?.offerLetterLink}
              className="w-full bg-green-500 hover:bg-green-600 text-pure-white py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profile?.offerLetterLink ? 'Download Offer Letter' : 'Not Available Yet'}
            </button>
          </div>

          {/* Payment Card */}
          <div className="bg-pure-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <div className="flex items-start sm:items-center mb-4">
              <div className="bg-blue-50 p-2 sm:p-3 rounded-lg mr-3 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-semibold text-heading-dark">Make Payment</h4>
                <p className="text-xs sm:text-sm text-text-muted">Pay your admission fees</p>
              </div>
            </div>
            <button
              onClick={handlePayment}
              disabled={!profile?.paymentLink}
              className="w-full bg-primary-purple hover:opacity-90 text-pure-white py-2.5 sm:py-3 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profile?.paymentLink ? 'Proceed to Payment' : 'Not Available Yet'}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-pure-white border border-gray-200 rounded-lg p-4 sm:p-6">
          <h4 className="text-sm sm:text-base font-semibold text-heading-dark mb-2">Need Help?</h4>
          <p className="text-xs sm:text-sm text-text-muted">
            If you have any questions about your admission or face any issues, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
