import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import AdminNavbar from '../../components/AdminNavbar';
import Footer from '../../components/Footer';

const StudentDatabase = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
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

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.phone?.includes(searchTerm) ||
    student.course?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />
      
      <div className="flex-1 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-2xl font-bold text-heading-dark">Student Database</h2>
              <p className="text-text-muted text-xs mt-0.5">
                Total Students: <span className="font-semibold text-primary-purple">{students.length}</span>
              </p>
            </div>
            <button
              onClick={fetchStudents}
              className="bg-primary-purple text-pure-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center space-x-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, email, phone, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary-purple transition-colors"
            />
            <svg className="w-4 h-4 text-text-muted absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-xs">
            {error}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary-purple border-t-transparent"></div>
            <p className="text-text-muted text-sm mt-3">Loading students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <svg className="w-12 h-12 text-text-muted mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-text-muted text-sm">
              {searchTerm ? 'No students found matching your search' : 'No students in database'}
            </p>
          </div>
        ) : (
          <div className="bg-pure-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-primary-purple">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-pure-white uppercase tracking-wide">
                      Name
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-pure-white uppercase tracking-wide">
                      Email
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-pure-white uppercase tracking-wide">
                      Phone
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-pure-white uppercase tracking-wide">
                      Course
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-pure-white uppercase tracking-wide">
                      Campus
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-pure-white uppercase tracking-wide">
                      Result
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-pure-white uppercase tracking-wide">
                      Links
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-pure-white divide-y divide-gray-100">
                  {filteredStudents.map((student, index) => (
                    <tr 
                      key={student._id} 
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50 bg-opacity-40'
                      }`}
                    >
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs font-medium text-heading-dark">{student.name}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-600">{student.email}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-600">{student.phone}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-heading-dark">{student.course}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-xs text-gray-600">{student.campus}</div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`px-2 py-0.5 inline-flex text-xs font-medium rounded ${
                          student.result >= 75 
                            ? 'bg-green-50 text-green-700' 
                            : student.result >= 50 
                            ? 'bg-yellow-50 text-yellow-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {student.result ? `${student.result}%` : 'N/A'}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs">
                        <div className="flex space-x-2">
                          {student.offerLetterLink && (
                            <a
                              href={student.offerLetterLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-purple hover:text-accent-yellow font-medium"
                            >
                              Offer
                            </a>
                          )}
                          {student.paymentLink && (
                            <a
                              href={student.paymentLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-purple hover:text-accent-yellow font-medium"
                            >
                              Payment
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results Count */}
        {searchTerm && (
          <div className="mt-3 text-center text-text-muted text-xs">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default StudentDatabase;
