import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import AdminNavbar from '../../components/AdminNavbar';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const UploadStudents = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [announcement, setAnnouncement] = useState('');
  const [announcementLoading, setAnnouncementLoading] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState('');

  useEffect(() => {
    fetchAnnouncement();
  }, []);

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
      setTimeout(() => setError(''), 3000);
    } finally {
      setAnnouncementLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setError('');
      setSuccess('');
      setUploadResult(null);
    } else {
      setError('Please select a valid CSV file');
      setSelectedFile(null);
    }
  };

  const downloadTemplate = () => {
    const headers = ['name', 'email', 'phone', 'course', 'campus', 'offerLetterLink', 'result', 'paymentLink'];
    const sampleData = [
      'John Doe',
      'john@example.com',
      '9876543210',
      'Computer Science',
      'Main Campus',
      'https://example.com/offer.pdf',
      '85',
      'https://example.com/payment'
    ];
    
    const csvContent = headers.join(',') + '\n' + sampleData.join(',');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'student_upload_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');
    setUploadResult(null);

    const formData = new FormData();
    formData.append('csvFile', selectedFile);

    try {
      const response = await adminAPI.uploadCSV(formData);
      
      if (response.data.success) {
        setSuccess(`Successfully processed ${response.data.data.successfulSaves} students`);
        setUploadResult(response.data.data);
        setSelectedFile(null);
        document.getElementById('csvFile').value = '';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Announcement Section */}
          <div className="bg-pure-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-heading-dark mb-2">📢 Announcement Message</h2>
            <p className="text-text-muted text-sm mb-4">
              This message will be visible to all students on their dashboard
            </p>

            {announcementSuccess && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg mb-4 text-sm">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {announcementSuccess}
                </div>
              </div>
            )}

            <ReactQuill
              theme="snow"
              value={announcement}
              onChange={setAnnouncement}
              className="bg-white mb-4 rounded-lg"
              style={{ minHeight: '150px' }}
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
              className="bg-primary-purple text-pure-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {announcementLoading ? 'Updating...' : 'Update Announcement'}
            </button>
          </div>

          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-heading-dark mb-1">Upload Student Data</h2>
            <p className="text-text-muted text-sm">Upload a CSV file containing student information</p>
          </div>

          {/* Upload Card */}
          <div className="bg-pure-white border border-gray-200 rounded-xl shadow-sm p-6">
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg mb-4 text-sm">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {success}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-6">
              {/* Left: File Upload Area */}
              <div className="col-span-2 space-y-4">
                <div className="border-2 border-dashed border-primary-purple rounded-lg p-6 text-center bg-primary-purple bg-opacity-5 hover:bg-opacity-10 transition-all">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-primary-purple mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    
                    <label htmlFor="csvFile" className="cursor-pointer">
                      <span className="bg-primary-purple text-pure-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity inline-block">
                        Choose CSV File
                      </span>
                    </label>
                    <input
                      id="csvFile"
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    <p className="text-text-muted text-xs mt-2">
                      or drag and drop your file here
                    </p>
                  </div>
                </div>

                {selectedFile && (
                  <div className="bg-accent-yellow bg-opacity-10 border border-accent-yellow rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <svg className="w-6 h-6 text-accent-yellow" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-heading-dark">{selectedFile.name}</p>
                          <p className="text-xs text-text-muted">
                            {(selectedFile.size / 1024).toFixed(2)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFile(null);
                          document.getElementById('csvFile').value = '';
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full bg-accent-yellow text-heading-dark font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    'Upload CSV'
                  )}
                </button>

                {/* Upload Results */}
                {uploadResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-green-800 mb-1">Upload Summary</h4>
                    <div className="text-xs text-green-700 space-y-0.5">
                      <p>✓ Successfully saved: <span className="font-bold">{uploadResult.successfulSaves}</span></p>
                      {uploadResult.failedSaves > 0 && (
                        <p className="text-red-600">✗ Failed: <span className="font-bold">{uploadResult.failedSaves}</span></p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: CSV Format Info */}
              <div className="col-span-1 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-heading-dark mb-3">CSV Format</h4>
                  <div className="text-xs text-text-muted space-y-1.5">
                    <div className="flex items-start">
                      <span className="font-medium mr-1">•</span>
                      <span>name</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium mr-1">•</span>
                      <span>email</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium mr-1">•</span>
                      <span>phone</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium mr-1">•</span>
                      <span>course</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium mr-1">•</span>
                      <span>campus</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium mr-1">•</span>
                      <span>offerLetterLink</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium mr-1">•</span>
                      <span>result</span>
                    </div>
                    <div className="flex items-start">
                      <span className="font-medium mr-1">•</span>
                      <span>paymentLink</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={downloadTemplate}
                  className="w-full bg-primary-purple text-pure-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Download Template</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadStudents;
