import { useNavigate } from 'react-router-dom';
import { logout, getUser } from '../utils/auth';

const StudentNavbar = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-pure-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left - Logo */}
          <div className="flex items-center">
            <img 
              src="/assects/logo.webp" 
              alt="GECET Logo" 
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>

          {/* Center - Welcome Message */}
          <div className="flex-1 text-center px-4">
            <p className="text-sm sm:text-base font-semibold text-heading-dark">
              Welcome, <span className="text-primary-purple">{user?.name || 'Student'}</span>
            </p>
          </div>

          {/* Right - Logout Button */}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-pure-white px-4 sm:px-6 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default StudentNavbar;
