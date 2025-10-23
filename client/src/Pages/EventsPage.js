import React, { useEffect, useState } from "react";

const EventsPage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("/data/eventsData.json")
      .then((res) => res.json())
      .then((json) => setData(json));
  }, []);

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-8">
      <h1 className="text-2xl font-semibold text-gray-800">Campus Events</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.events.map((event, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl shadow hover:shadow-lg">
            <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded">
              {event.tag}
            </span>
            <h3 className="mt-2 font-bold text-lg">{event.title}</h3>
            <p className="text-gray-500">{event.date} • {event.time}</p>
            <p className="text-gray-500">{event.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsPage;
