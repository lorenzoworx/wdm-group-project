import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/data/adminData.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  // Map option labels to routes or actions
  const routeMap = {
    'Manage Students': '/dashboard/users',
    'Manage Course': '/dashboard/classes',
    'Manage Permissions': '/dashboard/users',
    'Reports': '/dashboard/reports',
    'Performance': '/dashboard/performance',
    'Manage Coordinator': '/dashboard/users?role=coordinator',
    'Handle Course': '/dashboard/classes',
    'Assign Students': '/dashboard/classes',
    'Reviews': '/dashboard/reviews',
    'Manage QA-Officer': '/dashboard/qa',
    'Assign Course': '/dashboard/classes',
    'Handle Permissions': '/dashboard/users'
  };

  const handleItemClick = (label) => {
    const target = routeMap[label];
    if (target) {
      // Use navigate for internal routes (strip query if necessary)
      navigate(target);
    } else {
      // Friendly message for unimplemented options
      // You could replace this with a modal or future route
      alert(`${label} is not implemented yet. Contact the administrator or check back later.`);
    }
  };

  const renderList = (title, list) => (
    <section>
      <h2 className="text-xl font-bold mb-3 text-gray-700">{title}</h2>
      <ul className="bg-white rounded-2xl shadow divide-y divide-gray-200">
        {list.map((item, i) => (
          <li key={i} className="p-4">
            <button
              onClick={() => handleItemClick(item)}
              className="w-full text-left flex items-center justify-between gap-4 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 rounded"
              aria-label={item}
            >
              <span className="text-gray-700">{item}</span>
              <span className="text-sm text-blue-600">→</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
      {renderList("Students", data.students)}
      {renderList("Coordinators", data.coordinators)}
      {renderList("QA Officers", data.qaOfficers)}
    </div>
  );
};

export default AdminDashboard;
