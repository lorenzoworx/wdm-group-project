import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Grades = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/studentData.json')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading grades...</div>;
  if (error) return <div className="p-6 text-red-600">Error loading grades: {error}</div>;

  const grades = (data && data.grades) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Grades</h1>
            <p className="text-gray-600 mt-1">All your course grades and assessments.</p>
          </div>
          <div>
            <Link to="/dashboard/home" className="text-sm text-blue-600 hover:underline">Back to Home</Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {grades.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No grades available.</td>
                </tr>
              )}

              {grades.map((g, i) => (
                <tr key={i}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{g.course}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{g.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{g.score}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{g.date || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-500">This is a sample grades page reading data from <code>/data/studentData.json</code>.</p>
        </div>
      </div>
    </div>
  );
};

export default Grades;

