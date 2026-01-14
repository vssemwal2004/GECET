import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import { logout, getUser } from '../../utils/auth';
import StudentNavbar from '../../components/StudentNavbar';
import 'react-quill/dist/quill.snow.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchAnnouncements();
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

  const fetchAnnouncements = async () => {
    try {
      const response = await studentAPI.getAnnouncement();
      if (response.data.success && response.data.announcement) {
        setAnnouncements([response.data.announcement]);
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

      <div className="container mx-auto px-4 py-4 max-w-5xl">
        {/* Personal Information Section */}
        <div className="bg-pure-white border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="text-base font-semibold text-heading-dark mb-3">Personal Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-text-muted mb-0.5">Full Name</p>
              <p className="text-sm font-semibold text-heading-dark">{profile?.name}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-0.5">Email</p>
              <p className="text-sm font-semibold text-heading-dark break-all">{profile?.email}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-0.5">Mobile</p>
              <p className="text-sm font-semibold text-heading-dark">{profile?.phone}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-0.5">Course</p>
              <p className="text-sm font-semibold text-heading-dark">{profile?.course}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-0.5">Campus</p>
              <p className="text-sm font-semibold text-heading-dark">{profile?.campus}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-0.5">Result</p>
              <p className="text-sm font-semibold text-heading-dark">
                {profile?.result ? `${profile.result}%` : 'Pending'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Offer Letter and Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Offer Letter Card */}
          <div className="bg-pure-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <div className="bg-green-50 p-2 rounded-lg mr-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-heading-dark">Offer Letter</h4>
            </div>
            <button
              onClick={handleDownloadOffer}
              disabled={!profile?.offerLetterLink}
              className="w-full bg-green-500 hover:bg-green-600 text-pure-white py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profile?.offerLetterLink ? 'Download' : 'Not Available'}
            </button>
          </div>

          {/* Payment Card */}
          <div className="bg-pure-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <div className="bg-blue-50 p-2 rounded-lg mr-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h4 className="text-sm font-semibold text-heading-dark">Payment</h4>
            </div>
            <button
              onClick={handlePayment}
              disabled={!profile?.paymentLink}
              className="w-full bg-primary-purple hover:opacity-90 text-pure-white py-2 rounded-lg text-xs font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {profile?.paymentLink ? 'Pay Now' : 'Not Available'}
            </button>
          </div>
        </div>

        {/* Announcements Section - Full Width Separate Line */}
        <div className="w-full bg-gradient-to-r from-accent-yellow/10 to-primary-purple/10 border-2 border-primary-purple rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="bg-accent-yellow bg-opacity-30 p-2.5 rounded-lg mr-3">
              <svg className="w-6 h-6 text-primary-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-primary-purple">📢 Announcements</h3>
          </div>
          <div className="space-y-3">
            {announcements.length > 0 ? (
              announcements.map((announcement, index) => (
                <div key={announcement._id || index} className="bg-pure-white border-l-4 border-primary-purple pl-4 pr-3 py-3 rounded shadow-sm">
                  {announcement.title && (
                    <h4 className="text-sm font-bold text-heading-dark mb-1">{announcement.title}</h4>
                  )}
                  <div 
                    className="text-xs text-text-muted leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                  />
                  <p className="text-xs text-primary-purple font-medium mt-2">
                    📅 {new Date(announcement.createdAt).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              ))
            ) : (
              <div className="bg-pure-white border border-gray-200 pl-4 pr-3 py-4 rounded text-center">
                <p className="text-sm text-text-muted">No announcements at this time</p>
              </div>
            )}
          </div>
        </div>

        {/* Help Section - One Line */}
        <div className="bg-pure-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-text-muted">
            <span className="font-semibold text-heading-dark">Need Help?</span> Contact us at{' '}
            <a href="tel:18008906027" className="text-primary-purple font-semibold hover:underline">
              Toll-Free: 18008906027
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
