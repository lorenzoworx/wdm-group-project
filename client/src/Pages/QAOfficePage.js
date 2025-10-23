import React, { useEffect, useState } from "react";

const QAOfficePage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/data/qaData.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      <h1 className="text-2xl font-semibold text-gray-800">QA Office Dashboard</h1>

      {/* Reports */}
      <section>
        <h2 className="text-xl font-bold mb-3 text-gray-700">Reports</h2>
        <ul className="bg-white rounded-2xl shadow divide-y divide-gray-200">
          {data.reports.map((r, i) => (
            <li key={i} className="p-4">{r}</li>
          ))}
        </ul>
      </section>

      {/* Actions */}
      <section>
        <h2 className="text-xl font-bold mb-3 text-gray-700">Actions</h2>
        <div className="flex flex-wrap gap-4">
          {data.actions.map((a, i) => (
            <button
              key={i}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
            >
              {a}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default QAOfficePage;
