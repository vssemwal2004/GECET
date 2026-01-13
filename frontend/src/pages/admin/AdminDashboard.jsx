import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { logout, getUser } from '../../utils/auth';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchAnnouncement();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getStudents();
      if (response.data.success) {
        setStudents(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setError('');
    } else {
      setError('Please select a valid CSV file');
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('csvFile', selectedFile);

    try {
      const response = await adminAPI.uploadCSV(formData);
      
      if (response.data.success) {
        setSuccess(`Successfully processed ${response.data.data.successfulSaves} students`);
        setSelectedFile(null);
        // Reset file input
        document.getElementById('csvFile').value = '';
        // Refresh student list
        fetchStudents();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  const fetchAnnouncement = async () => {
    try {
      const response = await adminAPI.getAnnouncement();
      if (response.data.success) {
        setAnnouncement(response.data.announcement.content);
      }
    } catch (err) {
      console.error('Failed to fetch announcement:', err);
    }
  };

  const handleUpdateAnnouncement = async () => {
    setAnnouncementLoading(true);
    setAnnouncementSuccess('');

    try {
      const response = await adminAPI.updateAnnouncement(announcement);
      if (response.data.success) {
        setAnnouncementSuccess('Announcement updated successfully!');
        setTimeout(() => setAnnouncementSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update announcement');
    } finally {
      setAnnouncementLoading(false);
    }
  };


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="heading text-2xl">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.email}</span>
            <button onClick={handleLogout} className="btn-danger text-sm py-2">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Announcement Section */}
        <div className="card mb-8">
          <h2 className="heading text-xl mb-4">Announcement Message</h2>
          <p className="text-gray-600 mb-4 text-sm">
            This message will be visible to all students on their dashboard
          </p>

          {announcementSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
              {announcementSuccess}
            </div>
          )}

          <ReactQuill
            theme="snow"
            value={announcement}
            onChange={setAnnouncement}
            className="bg-white mb-4"
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['link'],
                ['clean']
              ]
            }}
            formats={[
              'header',
              'bold', 'italic', 'underline', 'strike',
              'list', 'bullet',
              'color', 'background',
              'align',
              'link'
            ]}
          />

          <button
            onClick={handleUpdateAnnouncement}
            disabled={announcementLoading}
            className="btn-primary mt-4"
          >
            {announcementLoading ? 'Updating...' : 'Update Announcement'}
          </button>
        </div>

        {/* CSV Upload Section */}
        <div className="card mb-8">
          <h2 className="heading text-xl mb-4">Upload Student Data</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="label">Select CSV File</label>
              <input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="input-field"
              />
              <p className="text-sm text-gray-500 mt-2">
                Required columns: name, email, phone, course, campus, offerLetterLink, result, paymentLink
              </p>
            </div>

            {selectedFile && (
              <div className="text-sm text-gray-700">
                Selected: <span className="font-medium">{selectedFile.name}</span>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </div>
        </div>

        {/* Students List */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="heading text-xl">Uploaded Students ({students.length})</h2>
            <button onClick={fetchStudents} className="btn-secondary text-sm py-2">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No students found. Upload a CSV file to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campus</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Result</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{student.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.phone}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.course}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.campus}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.result ? `${student.result}%` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
