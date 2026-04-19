import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { adminAPI } from '../../services/api';
import AdminNavbar from '../../components/AdminNavbar';
import Footer from '../../components/Footer';

const UFM = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadErrors, setUploadErrors] = useState(null);
  const [ufmContent, setUfmContent] = useState('');
  const [contentLoading, setContentLoading] = useState(false);
  const [contentSuccess, setContentSuccess] = useState('');

  useEffect(() => {
    fetchUFMContent();
  }, []);

  const fetchUFMContent = async () => {
    try {
      const response = await adminAPI.getUFMContent();
      if (response.data.success) {
        setUfmContent(response.data.ufmContent.content);
      }
    } catch (err) {
      console.error('Failed to fetch UFM content:', err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setError('');
      setSuccess('');
      setUploadResult(null);
      setUploadErrors(null);
      return;
    }

    setSelectedFile(null);
    setError('Please select a valid CSV file');
  };

  const downloadTemplate = () => {
    const headers = ['name', 'email', 'phone', 'course', 'campus', 'Phase', 'university', 'department', 'offerLetterLink', 'result', 'paymentLink'];
    const sampleData = [
      'John Doe',
      'john@example.com',
      '9876543210',
      'Computer Science',
      'Main Campus',
      'Phase 1',
      'XYZ University',
      'Engineering',
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
    setUploadErrors(null);

    const formData = new FormData();
    formData.append('csvFile', selectedFile);

    try {
      const response = await adminAPI.uploadUFMCsv(formData);
      if (response.data.success) {
        setSuccess(`Successfully processed ${response.data.data.successfulSaves} UFM students`);
        setUploadResult(response.data.data);
        setUploadErrors(response.data.errors || null);
        setSelectedFile(null);
        const input = document.getElementById('ufmCsvFile');
        if (input) {
          input.value = '';
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload UFM CSV');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateUFMContent = async () => {
    setContentLoading(true);
    setContentSuccess('');
    setError('');

    try {
      const response = await adminAPI.updateUFMContent(ufmContent);
      if (response.data.success) {
        setContentSuccess('UFM details updated successfully!');
        setTimeout(() => setContentSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update UFM details');
      setTimeout(() => setError(''), 3000);
    } finally {
      setContentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />

      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-left">
                <h2 className="text-2xl font-bold text-heading-dark mb-1">UFM Student Upload</h2>
                <p className="text-text-muted text-sm">Only students uploaded here will see the UFM details button in their portal.</p>
              </div>

              <div className="bg-pure-white border border-gray-200 rounded-xl shadow-sm p-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg mb-4 text-sm">
                    {success}
                  </div>
                )}

                <div className="border-2 border-dashed border-primary-purple rounded-lg p-8 text-center bg-primary-purple bg-opacity-5 hover:bg-opacity-10 transition-all mb-4">
                  <label htmlFor="ufmCsvFile" className="cursor-pointer inline-block">
                    <span className="bg-primary-purple text-pure-white px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity inline-block">
                      Choose UFM CSV
                    </span>
                  </label>
                  <input
                    id="ufmCsvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <p className="text-text-muted text-xs mt-3">Upload a CSV with the same student columns used in the regular upload.</p>
                </div>

                <button
                  onClick={downloadTemplate}
                  className="w-full border border-primary-purple text-primary-purple py-3 rounded-lg font-medium hover:bg-primary-purple hover:text-pure-white transition-colors mb-4"
                >
                  Download Same CSV Template
                </button>

                {selectedFile && (
                  <div className="bg-accent-yellow bg-opacity-10 border border-accent-yellow rounded-lg p-3 mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-heading-dark">{selectedFile.name}</p>
                      <p className="text-xs text-text-muted">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        const input = document.getElementById('ufmCsvFile');
                        if (input) {
                          input.value = '';
                        }
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full bg-accent-yellow text-heading-dark font-semibold py-3.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-base"
                >
                  {uploading ? 'Uploading...' : 'Upload UFM CSV'}
                </button>

                {uploadResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">Upload Summary</h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p>Total processed: <span className="font-bold">{uploadResult.totalProcessed}</span></p>
                      <p>Successfully saved: <span className="font-bold">{uploadResult.successfulSaves}</span></p>
                      <p>Parse errors: <span className="font-bold">{uploadResult.parseErrors}</span></p>
                      <p>Save errors: <span className="font-bold">{uploadResult.saveErrors}</span></p>
                    </div>
                  </div>
                )}

                {uploadErrors?.saveErrors?.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <h4 className="text-sm font-semibold text-red-700 mb-2">Save Error Details</h4>
                    <div className="space-y-2">
                      {uploadErrors.saveErrors.map((item, index) => (
                        <div key={`${item.phone}-${index}`} className="text-xs text-red-700">
                          <span className="font-semibold">{item.phone}</span>: {item.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {uploadErrors?.parseErrors?.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <h4 className="text-sm font-semibold text-red-700 mb-2">Parse Error Details</h4>
                    <div className="space-y-2">
                      {uploadErrors.parseErrors.map((item, index) => (
                        <div key={`${item.line}-${index}`} className="text-xs text-red-700">
                          Line {item.line}: {item.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4">
                  <h4 className="text-sm font-semibold text-heading-dark mb-2">CSV Format</h4>
                  <p className="text-xs text-text-muted mb-2">
                    The UFM upload uses the exact same CSV template as the normal upload.
                  </p>
                  <code className="block text-xs text-heading-dark break-all">
                    name,email,phone,course,campus,Phase,university,department,offerLetterLink,result,paymentLink
                  </code>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-left">
                <h2 className="text-2xl font-bold text-heading-dark mb-1">UFM Details Content</h2>
                <p className="text-text-muted text-sm">This content will appear on the student UFM details page after they click the result button.</p>
              </div>

              <div className="bg-pure-white border border-gray-200 rounded-xl shadow-sm p-5">
                {contentSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg mb-4 text-sm">
                    {contentSuccess}
                  </div>
                )}

                <ReactQuill
                  theme="snow"
                  value={ufmContent}
                  onChange={setUfmContent}
                  className="mb-4"
                />

                <button
                  onClick={handleUpdateUFMContent}
                  disabled={contentLoading}
                  className="w-full bg-primary-purple text-pure-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {contentLoading ? 'Updating...' : 'Update UFM Details'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UFM;
