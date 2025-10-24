import React, { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/data/adminData.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  const renderList = (title, list) => (
    <section>
      <h2 className="text-xl font-bold mb-3 text-gray-700">{title}</h2>
      <ul className="bg-white rounded-2xl shadow divide-y divide-gray-200">
        {list.map((item, i) => (
          <li key={i} className="p-4">{item}</li>
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
