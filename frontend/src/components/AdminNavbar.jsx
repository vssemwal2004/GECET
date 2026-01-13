import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, getUser } from '../utils/auth';

const AdminNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-primary-purple shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Logo/Title */}
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-pure-white">GECET Admin</h1>
            
            {/* Navigation Links */}
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/admin/upload')}
                className={`px-5 py-2 rounded-lg font-medium transition-all ${
                  isActive('/admin/upload')
                    ? 'bg-accent-yellow text-heading-dark'
                    : 'text-pure-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                Upload
              </button>
              <button
                onClick={() => navigate('/admin/database')}
                className={`px-5 py-2 rounded-lg font-medium transition-all ${
                  isActive('/admin/database')
                    ? 'bg-accent-yellow text-heading-dark'
                    : 'text-pure-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                Database
              </button>
            </div>
          </div>

          {/* Right - Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center space-x-3 bg-white bg-opacity-10 hover:bg-opacity-20 transition-all px-4 py-2 rounded-lg"
            >
              <div className="w-9 h-9 bg-accent-yellow rounded-full flex items-center justify-center">
                <span className="text-heading-dark font-bold text-lg">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <svg
                className={`w-4 h-4 text-pure-white transition-transform ${
                  showDropdown ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-pure-white rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="text-sm text-text-muted">Signed in as</p>
                  <p className="text-sm font-semibold text-heading-dark truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
