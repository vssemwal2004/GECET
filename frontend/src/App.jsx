import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminRoute, StudentRoute } from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import UploadStudents from './pages/admin/UploadStudents';
import StudentDatabase from './pages/admin/StudentDatabase';
import StudentDashboard from './pages/student/StudentDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Unified Login */}
        <Route path="/login" element={<Login />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <Navigate to="/admin/upload" replace />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/upload"
          element={
            <AdminRoute>
              <UploadStudents />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/database"
          element={
            <AdminRoute>
              <StudentDatabase />
            </AdminRoute>
          }
        />

        {/* Student Dashboard */}
        <Route
          path="/student/dashboard"
          element={
            <StudentRoute>
              <StudentDashboard />
            </StudentRoute>
          }
        />

        {/* Legacy routes redirect to unified login */}
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/student/login" element={<Navigate to="/login" replace />} />
        <Route path="/student/otp" element={<Navigate to="/login" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
