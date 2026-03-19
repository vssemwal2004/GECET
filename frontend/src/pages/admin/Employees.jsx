import { useEffect, useMemo, useState } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import Footer from '../../components/Footer';
import { adminAPI } from '../../services/api';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [phone, setPhone] = useState('');
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editingPhone, setEditingPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const totalEmployees = useMemo(() => employees.length, [employees]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getEmployees();
      if (response.data.success) {
        setEmployees(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!/^\d{10}$/.test(phone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setAdding(true);
    try {
      const response = await adminAPI.addEmployee(phone);
      if (response.data.success) {
        setSuccess('Employee added successfully');
        setPhone('');
        await fetchEmployees();
        setTimeout(() => setSuccess(''), 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee');
    } finally {
      setAdding(false);
    }
  };

  const startEdit = (employee) => {
    setEditingId(employee._id);
    setEditingPhone(employee.phone || '');
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingPhone('');
  };

  const saveEdit = async () => {
    setError('');
    setSuccess('');

    if (!/^\d{10}$/.test(editingPhone)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setSaving(true);
    try {
      const response = await adminAPI.updateEmployee(editingId, editingPhone);
      if (response.data.success) {
        setSuccess('Employee updated successfully');
        cancelEdit();
        await fetchEmployees();
        setTimeout(() => setSuccess(''), 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (employee) => {
    const ok = window.confirm('Delete this employee?');
    if (!ok) return;

    setError('');
    setSuccess('');
    try {
      const response = await adminAPI.deleteEmployee(employee._id);
      if (response.data.success) {
        setSuccess('Employee deleted successfully');
        await fetchEmployees();
        setTimeout(() => setSuccess(''), 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />

      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-2xl font-bold text-heading-dark">Employees</h2>
              <p className="text-text-muted text-xs mt-0.5">
                Total Employees: <span className="font-semibold text-primary-purple">{totalEmployees}</span>
              </p>
            </div>
            <button
              onClick={fetchEmployees}
              className="bg-primary-purple text-pure-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center space-x-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className="bg-pure-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
          <h3 className="text-sm font-semibold text-heading-dark mb-3">Add Employee</h3>
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter 10 digit number"
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-primary-purple transition-colors"
              maxLength={10}
              required
            />
            <button
              type="submit"
              disabled={adding || phone.length !== 10}
              className="bg-primary-purple text-pure-white px-6 py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {adding ? 'Adding...' : 'Add'}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-3 text-xs">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg mb-3 text-xs">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-primary-purple border-t-transparent"></div>
            <p className="text-text-muted text-sm mt-3">Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-text-muted text-sm">No employees found</p>
          </div>
        ) : (
          <div className="bg-pure-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-primary-purple">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-xs font-semibold text-pure-white uppercase tracking-wide">
                      Phone
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-pure-white uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-pure-white divide-y divide-gray-100">
                  {employees.map((employee, index) => {
                    const isEditing = editingId === employee._id;
                    return (
                      <tr
                        key={employee._id}
                        className={`hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50 bg-opacity-40'
                        }`}
                      >
                        <td className="px-3 py-2 whitespace-nowrap">
                          {isEditing ? (
                            <input
                              type="tel"
                              value={editingPhone}
                              onChange={(e) => setEditingPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              className="w-44 px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-primary-purple transition-colors"
                              maxLength={10}
                            />
                          ) : (
                            <div className="text-xs font-medium text-heading-dark">{employee.phone}</div>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={saveEdit}
                                  disabled={saving || editingPhone.length !== 10}
                                  className="bg-accent-yellow text-heading-dark px-3 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="text-primary-purple px-3 py-2 rounded-lg text-xs font-semibold hover:bg-primary-purple hover:bg-opacity-10 transition-colors"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(employee)}
                                  className="text-primary-purple px-3 py-2 rounded-lg text-xs font-semibold hover:bg-primary-purple hover:bg-opacity-10 transition-colors"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(employee)}
                                  className="text-red-600 px-3 py-2 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Employees;
