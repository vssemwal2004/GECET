import { Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin, isStudent } from '../utils/auth';

// Protected route for admin only
export const AdminRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Protected route for student only
export const StudentRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isStudent()) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};
