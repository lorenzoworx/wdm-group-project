import React, { useEffect, useState } from "react";

const StudentDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/data/studentData.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4">Welcome back!</h1>

      {/* Featured Events */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-2">Featured Events</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.featuredEvents.map((event, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow">
              <p className="text-sm text-blue-600 font-semibold">{event.type}</p>
              <h3 className="font-bold text-lg">{event.title}</h3>
              <p>{event.date} • {event.time} • {event.location}</p>
              <button className="mt-3 px-3 py-1 bg-blue-500 text-white rounded">
                {event.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Grades */}
      <section className="mb-6">
        <h2 className="text-xl font-bold mb-2">Grades</h2>
        <div className="grid grid-cols-2 gap-4">
          {data.grades.map((grade, index) => (
            <div key={index} className="bg-white p-4 rounded-xl shadow">
              <h4 className="font-semibold">{grade.course} — {grade.name}</h4>
              <p className="text-lg font-bold">{grade.score}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
