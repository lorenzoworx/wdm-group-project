// import React, { useEffect, useState } from "react";

// const StudentDashboard = () => {
//   const [data, setData] = useState(null);

//   useEffect(() => {
//     fetch("/data/studentData.json")
//       .then((res) => res.json())
//       .then((json) => setData(json));
//   }, []);

//   if (!data) return <p className="text-center mt-10">Loading...</p>;

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <h1 className="text-2xl font-semibold mb-4">Welcome back!</h1>

//       {/* Featured Events */}
//       <section className="mb-6">
//         <h2 className="text-xl font-bold mb-2">Featured Events</h2>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {data.featuredEvents.map((event, index) => (
//             <div key={index} className="bg-white p-4 rounded-xl shadow">
//               <p className="text-sm text-blue-600 font-semibold">{event.type}</p>
//               <h3 className="font-bold text-lg">{event.title}</h3>
//               <p>{event.date} • {event.time} • {event.location}</p>
//               <button className="mt-3 px-3 py-1 bg-blue-500 text-white rounded">
//                 {event.buttonText}
//               </button>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* Grades */}
//       <section className="mb-6">
//         <h2 className="text-xl font-bold mb-2">Grades</h2>
//         <div className="grid grid-cols-2 gap-4">
//           {data.grades.map((grade, index) => (
//             <div key={index} className="bg-white p-4 rounded-xl shadow">
//               <h4 className="font-semibold">{grade.course} — {grade.name}</h4>
//               <p className="text-lg font-bold">{grade.score}</p>
//             </div>
//           ))}
//         </div>
//       </section>
//     </div>
//   );
// };

// export default StudentDashboard;


import React, { useEffect, useState } from "react";
import { Outlet, Link } from "react-router-dom";

const StudentDashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/data/studentData.json")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData({ featuredEvents: [], announcements: [], grades: [], files: [], messages: [] }));
  }, []);

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top banner */}
        <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-white p-6">
          <h1 className="text-2xl font-semibold">Welcome back!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening on campus today.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column (left) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Featured Events */}
            <div className="bg-white p-6 rounded-xl shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold">Featured Events</h2>
                <div className="space-x-2 text-sm">
                  <button className="px-3 py-1 bg-gray-100 rounded">Today</button>
                  <button className="px-3 py-1 bg-gray-100 rounded">This Week</button>
                  <button className="px-3 py-1 bg-gray-100 rounded">This Month</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.featuredEvents.map((ev, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{ev.type}</span>
                      <span className="text-xs text-gray-500">{ev.course}</span>
                    </div>
                    <h3 className="font-semibold">{ev.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{ev.date} • {ev.time} • {ev.location}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <button className="text-sm text-blue-600 border border-blue-100 px-3 py-1 rounded">{ev.buttonText}</button>
                      <button className="text-sm text-gray-500">Add to calendar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cards row: Grades, Files, Messages */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl shadow">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Grades</h3>
                  <Link to="/grades" className="text-sm text-blue-600 hover:underline">View all</Link>
                </div>
                <div className="space-y-3">
                  {data.grades.map((g, idx) => (
                    <div key={idx} className="border rounded p-3">
                      <div className="text-sm text-gray-500">{g.course} • {g.name}</div>
                      <div className="text-xl font-bold">{g.score}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl shadow">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Files</h3>
                  <button className="text-sm text-blue-600 hover:underline">Open files</button>
                </div>
                <ul className="space-y-2">
                  {data.files.map((f, i) => (
                    <li key={i} className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{f.name}</div>
                        <div className="text-xs text-gray-500">{f.type} • {f.size}</div>
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{f.type}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-4 rounded-xl shadow">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Messages</h3>
                  <button className="text-sm text-blue-600 hover:underline">Open inbox</button>
                </div>
                <ul className="space-y-3">
                  {data.messages.map((m, i) => (
                    <li key={i} className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{m.sender}</div>
                        <div className="text-sm text-gray-600">{m.message}</div>
                      </div>
                      <div className="text-xs text-gray-400">{m.time}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right column (aside) */}
          <aside className="space-y-6">
            <div className="bg-white p-4 rounded-xl shadow">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">Latest Announcements</h3>
                <Link to="/dashboard/announcements" className="text-sm text-blue-600 hover:underline">View all</Link>
              </div>
              <ul className="space-y-3">
                {data.announcements.map((a, i) => (
                  <li key={i} className="border rounded p-3">
                    <div className="text-sm text-gray-500">{a.course} • {a.date}</div>
                    <div className="font-medium">{a.subject}</div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-4 rounded-xl shadow flex flex-col space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 bg-gray-50 rounded text-center">Resources<br/><span className="text-sm text-gray-500">Find files, links & guides.</span></div>
                <div className="p-3 bg-gray-50 rounded text-center">Profile<br/><span className="text-sm text-gray-500">Manage settings & RSVPs.</span></div>
                <div className="p-3 bg-gray-50 rounded text-center">Help (AI)<br/><span className="text-sm text-gray-500">Chat with AI for quick assistance.</span></div>
              </div>
            </div>
          </aside>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default StudentDashboard;
