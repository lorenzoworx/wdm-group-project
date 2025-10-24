import React, { useEffect, useState } from "react";

const InstructorDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/data/instructorData.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      <h1 className="text-2xl font-semibold text-gray-800">Instructor Dashboard</h1>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-bold mb-3 text-gray-700">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          {data.quickActions.map((action, i) => (
            <button
              key={i}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              {action}
            </button>
          ))}
        </div>
      </section>

      {/* Exams */}
      <section>
        <h2 className="text-xl font-bold mb-3 text-gray-700">Exams</h2>
        <ul className="bg-white rounded-2xl shadow divide-y divide-gray-200">
          {data.exams.map((exam, i) => (
            <li key={i} className="p-4">{exam}</li>
          ))}
        </ul>
      </section>

      {/* Reports */}
      <section>
        <h2 className="text-xl font-bold mb-3 text-gray-700">Student Reports</h2>
        <ul className="bg-white rounded-2xl shadow divide-y divide-gray-200">
          {data.reports.map((report, i) => (
            <li key={i} className="p-4">{report}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default InstructorDashboard;
