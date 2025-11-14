import React, { useEffect, useState } from "react";
import { getEvents, createEvent, updateEvent, deleteEvent } from "../api/events";

const initialNewEvent = {
  title: "",
  date: "",        // YYYY-MM-DD
  startTime: "",   // HH:MM
  endTime: "",     // HH:MM
  location: "",
  tag: "CS",
  description: ""
};

// Helpers to safely read possibly-missing props
function val(x, fallback = "") {
  return (x === null || x === undefined) ? fallback : x;
}
function lc(x) {
  return val(x, "").toString().toLowerCase();
}

const EventsPage = () => {
  const [data, setData] = useState(null);               // { events: [...] }
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState({});
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState(initialNewEvent);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [userType, setUserType] = useState("");

  useEffect(() => {
    loadEvents();
    const currentUserType = localStorage.getItem("userType") || "student";
    setUserType(currentUserType);
  }, []);

  const loadEvents = () => {
    const run = async () => {
      try {
        const resp = await getEvents(); // expects { events: [...] }
        const list = Array.isArray(resp?.events) ? resp.events : [];
        const payload = { events: list };
        setData(payload);
        localStorage.setItem("events", JSON.stringify(payload));
      } catch (err) {
        // Fallback: localStorage -> public JSON -> empty
        const saved = JSON.parse(localStorage.getItem("events") || "null");
        if (saved && Array.isArray(saved.events)) {
          setData(saved);
        } else {
          try {
            const res = await fetch("/data/eventsData.json");
            const json = await res.json();
            const payload = { events: Array.isArray(json?.events) ? json.events : [] };
            setData(payload);
            localStorage.setItem("events", JSON.stringify(payload));
          } catch {
            setData({ events: [] });
          }
        }
      }
    };
    run();

    const savedRegs = JSON.parse(localStorage.getItem("eventRegistrations") || "{}");
    setRegistrationStatus(savedRegs);
  };

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  // CREATE / UPDATE submit
  const handleSaveEvent = (e) => {
    e.preventDefault();
    const run = async () => {
      const payload = {
        // Server accepts either snake_case or these mapped names; we send snake_case
        title: newEvent.title,
        event_date: newEvent.date,           // YYYY-MM-DD
        start_time: newEvent.startTime,      // HH:MM
        end_time: newEvent.endTime,          // HH:MM
        location: newEvent.location,
        category: newEvent.tag,
        description: newEvent.description
      };

      if (isEditing && editingEventId != null) {
        try {
          const resp = await updateEvent({ id: editingEventId, ...payload });
          const updated = resp?.event || { id: editingEventId, ...payload };
          const next = data.events.map((ev) => (ev.id === editingEventId ? updated : ev));
          const out = { events: next };
          setData(out);
          localStorage.setItem("events", JSON.stringify(out));
          setIsEditing(false);
          setEditingEventId(null);
          setNewEvent(initialNewEvent);
          setShowCreateModal(false);
          return;
        } catch (err) {
          // Local fallback
          const fallback = data.events.map((ev) =>
              ev.id === editingEventId
                  ? {
                    ...ev,
                    title: payload.title,
                    event_date: payload.event_date,
                    start_time: payload.start_time,
                    end_time: payload.end_time,
                    location: payload.location,
                    category: payload.category,
                    description: payload.description
                  }
                  : ev
          );
          const out = { events: fallback };
          setData(out);
          localStorage.setItem("events", JSON.stringify(out));
          setIsEditing(false);
          setEditingEventId(null);
          setNewEvent(initialNewEvent);
          setShowCreateModal(false);
          return;
        }
      }

      // CREATE
      try {
        const resp = await createEvent(payload);
        const serverEvent = resp?.event || null;
        const created = serverEvent
            ? serverEvent
            : {
              id: Math.max(0, ...data.events.map((ev) => Number(ev.id) || 0)) + 1,
              ...payload
            };
        const out = { events: [...data.events, created] };
        setData(out);
        localStorage.setItem("events", JSON.stringify(out));
        setNewEvent(initialNewEvent);
        setShowCreateModal(false);
      } catch (err) {
        // Local fallback
        const newId = Math.max(0, ...data.events.map((ev) => Number(ev.id) || 0)) + 1;
        const fallback = { id: newId, ...payload };
        const out = { events: [...data.events, fallback] };
        setData(out);
        localStorage.setItem("events", JSON.stringify(out));
        setNewEvent(initialNewEvent);
        setShowCreateModal(false);
      }
    };
    run();
  };

  const handleRegister = (eventId) => {
    const ev = data.events.find((e) => e.id === eventId);
    if (ev) {
      setSelectedEvent(ev);
      setShowRegistrationModal(true);
    }
  };

  const handleEdit = (ev) => {
    setIsEditing(true);
    setEditingEventId(ev.id);
    setNewEvent({
      title: val(ev.title),
      date: val(ev.event_date || ev.eventDate || ev.date),
      startTime: val(ev.start_time || ev.startTime || ev.time),
      endTime: val(ev.end_time || ev.endTime || ev.time),
      location: val(ev.location),
      tag: val(ev.category || ev.tag, "CS"),
      description: val(ev.description)
    });
    setShowCreateModal(true);
  };

  const handleDelete = (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    const run = async () => {
      try {
        await deleteEvent(eventId);
        const next = data.events.filter((ev) => ev.id !== eventId);
        const out = { events: next };
        setData(out);
        localStorage.setItem("events", JSON.stringify(out));
      } catch {
        // Local fallback
        const next = data.events.filter((ev) => ev.id !== eventId);
        const out = { events: next };
        setData(out);
        localStorage.setItem("events", JSON.stringify(out));
      }
    };
    run();
  };

  const handleUnregister = (eventId) => {
    const next = { ...registrationStatus };
    delete next[eventId];
    setRegistrationStatus(next);
    localStorage.setItem("eventRegistrations", JSON.stringify(next));
  };

  const confirmRegistration = () => {
    if (!selectedEvent) return;
    const next = { ...registrationStatus, [selectedEvent.id]: true };
    setRegistrationStatus(next);
    localStorage.setItem("eventRegistrations", JSON.stringify(next));
    setShowRegistrationModal(false);
    setSelectedEvent(null);
  };

  const filteredEvents = data.events.filter((event) => {
    // filter tab
    let matchesFilter = true;
    if (filter === "registered") {
      matchesFilter = !!registrationStatus[event.id];
    } else if (filter !== "all") {
      matchesFilter = lc(event.tag || event.category) === filter;
    }

    // search
    const q = lc(searchQuery);
    const inTitle = lc(event.title).includes(q);
    const inDesc = lc(event.description).includes(q);
    const inLoc = lc(event.location).includes(q);

    return matchesFilter && (q === "" || inTitle || inDesc || inLoc);
  });

  const canManage = userType === "admin" || userType === "instructor";
  const isStudent = userType === "student";

  return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto p-6 w-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Campus Events</h1>
            <p className="text-gray-600 mt-1">Browse and register for upcoming events</p>
          </div>

          {/* Search + Create */}
          <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="relative w-full max-w-md">
              <input
                  type="search"
                  placeholder="Search events..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                  className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {canManage && (
                <button
                    onClick={() => {
                      setShowCreateModal(true);
                      setNewEvent(initialNewEvent);
                      setIsEditing(false);
                      setEditingEventId(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                >
                  Create Event
                </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="mb-6">
            <div className="flex space-x-4 overflow-x-auto pb-2 px-1">
              {["All", "Registered", "CS", "Career", "Analytics"].map((tab) => {
                const key = tab.toLowerCase();
                const active = filter === key;
                return (
                    <button
                        key={tab}
                        onClick={() => setFilter(key)}
                        className={
                            "whitespace-nowrap py-2 px-3 -mb-px border-b-2 transition-colors " +
                            (active ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700")
                        }
                    >
                      {tab}
                    </button>
                );
              })}
            </div>
          </div>

          {/* Events list */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="hidden md:grid md:grid-cols-[1fr_200px_160px] gap-4 px-4 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase tracking-wide">
              <div>Event</div>
              <div>Date &amp; Location</div>
              <div className="text-right pr-2">Actions</div>
            </div>

            {filteredEvents.length === 0 && (
                <div className="px-4 py-6 text-gray-500 text-sm">No events match your filters.</div>
            )}

            {filteredEvents.map((event) => {
              const tag = event.tag || event.category || "Other";
              const dateStr = val(event.event_date || event.eventDate || event.date);
              const startStr = val(event.start_time || event.startTime || event.time);
              const endStr = val(event.end_time || event.endTime);
              const desc = val(event.description);

              const tagCls =
                  tag === "CS"
                      ? "bg-blue-100 text-blue-700"
                      : tag === "Career"
                          ? "bg-green-100 text-green-700"
                          : "bg-purple-100 text-purple-700";

              return (
                  <div
                      key={event.id}
                      className="px-4 py-4 border-t border-gray-200 flex flex-col gap-4 md:grid md:grid-cols-[1fr_200px_160px] md:gap-4"
                  >
                    {/* col 1 */}
                    <div className="min-w-0">
                      <div className="flex items-start gap-3 min-w-0">
                        <span className={"px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 " + tagCls}>{tag}</span>
                        <div className="min-w-0">
                          <h3 className="text-base font-medium text-gray-900 leading-snug break-words">{val(event.title)}</h3>
                          {desc && <p className="mt-2 text-sm text-gray-600 leading-relaxed break-words">{desc}</p>}
                        </div>
                      </div>
                    </div>

                    {/* col 2 */}
                    <div className="text-sm text-gray-700">
                      <div className="flex items-start text-gray-700">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="leading-5">
                      {dateStr}
                          {startStr ? ` • ${startStr}` : ""}
                          {endStr ? ` - ${endStr}` : ""}
                    </span>
                      </div>

                      <div className="flex items-start text-gray-700 mt-2">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="leading-5 break-words">{val(event.location)}</span>
                      </div>
                    </div>

                    {/* col 3 */}
                    <div className="flex flex-col items-start gap-2 md:items-end md:text-right text-sm text-gray-700">
                      {isStudent ? (
                          registrationStatus[event.id] ? (
                              <button
                                  onClick={() => handleUnregister(event.id)}
                                  className="px-3 py-1.5 rounded text-sm font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 w-full md:w-auto"
                              >
                                Unregister
                              </button>
                          ) : (
                              <button
                                  onClick={() => handleRegister(event.id)}
                                  className="px-3 py-1.5 rounded text-sm font-medium text-blue-600 hover:text-blue-700 w-full md:w-auto"
                              >
                                Register
                              </button>
                          )
                      ) : (
                          <div className="flex flex-col md:items-end items-start gap-2">
                            <div className="flex gap-2">
                              <button
                                  onClick={() => handleEdit(event)}
                                  className="px-3 py-1.5 rounded text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-100"
                              >
                                Edit
                              </button>
                              <button
                                  onClick={() => handleDelete(event.id)}
                                  className="px-3 py-1.5 rounded text-sm font-medium text-red-600 hover:text-red-700 border border-red-100"
                              >
                                Delete
                              </button>
                            </div>
                            <button className="text-gray-600 hover:text-gray-800 w-full md:w-auto">Add to calendar</button>
                          </div>
                      )}
                    </div>
                  </div>
              );
            })}
          </div>
        </div>

        {/* Create / Edit Modal */}
        {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full mx-2 max-h-[90vh] overflow-auto">
                <h3 className="text-xl font-semibold mb-4">{isEditing ? "Edit Event" : "Create New Event"}</h3>
                <form onSubmit={handleSaveEvent}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                      <input
                          required
                          type="text"
                          value={newEvent.title}
                          onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter event title"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            required
                            type="date"
                            value={newEvent.date}
                            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                          <input
                              required
                              type="time"
                              value={newEvent.startTime}
                              onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
                              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                          <input
                              required
                              type="time"
                              value={newEvent.endTime}
                              onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
                              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                          required
                          type="text"
                          value={newEvent.location}
                          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter location"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                          value={newEvent.tag}
                          onChange={(e) => setNewEvent({ ...newEvent, tag: e.target.value })}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="CS">CS</option>
                        <option value="Career">Career</option>
                        <option value="Analytics">Analytics</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Enter event description"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => {
                          setShowCreateModal(false);
                          setIsEditing(false);
                          setEditingEventId(null);
                          setNewEvent(initialNewEvent);
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      {isEditing ? "Save Changes" : "Create Event"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {/* Registration Modal */}
        {showRegistrationModal && selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 max-w-md w-full mx-2 max-h-[90vh] overflow-auto">
                <h3 className="text-xl font-semibold mb-4">Register for Event</h3>
                <p className="text-gray-600 mb-4">Would you like to register for “{val(selectedEvent.title)}”?</p>
                <div className="text-gray-600 mb-6">
                  <p className="mb-2">Event Details:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Date: {val(selectedEvent.event_date || selectedEvent.eventDate || selectedEvent.date)}</li>
                    <li>
                      Time: {val(selectedEvent.start_time || selectedEvent.startTime || selectedEvent.time)}
                      {val(selectedEvent.end_time || selectedEvent.endTime || "") ? ` - ${val(selectedEvent.end_time || selectedEvent.endTime)}` : ""}
                    </li>
                    <li>Location: {val(selectedEvent.location)}</li>
                    {val(selectedEvent.description) && <li className="mt-2 text-sm">{val(selectedEvent.description)}</li>}
                  </ul>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                      onClick={() => {
                        setShowRegistrationModal(false);
                        setSelectedEvent(null);
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button onClick={confirmRegistration} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Confirm Registration
                  </button>
                </div>
              </div>
            </div>
        )}
      </div>
  );
};

export default EventsPage;
