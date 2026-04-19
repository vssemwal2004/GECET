import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentAPI } from '../../services/api';
import StudentNavbar from '../../components/StudentNavbar';
import Footer from '../../components/Footer';

const UFMDetails = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUFMContent();
  }, []);

  const fetchUFMContent = async () => {
    setLoading(true);
    try {
      const response = await studentAPI.getUFMContent();
      if (response.data.success) {
        setContent(response.data.ufmContent.content);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load UFM details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <StudentNavbar />

      <div className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <div className="bg-pure-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl font-bold text-heading-dark">UFM Details</h1>
              <p className="text-sm text-text-muted mt-1">This page shows the additional information shared by the admin for UFM students.</p>
            </div>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="px-4 py-2 rounded-lg bg-primary-purple text-pure-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Back to Dashboard
            </button>
          </div>

          {loading && (
            <div className="text-center py-10 text-text-muted">Loading UFM details...</div>
          )}

          {!loading && error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div
              className="prose max-w-none text-sm text-heading-dark"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default UFMDetails;
