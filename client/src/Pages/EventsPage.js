import React, { useEffect, useState } from "react";

const initialNewEvent = {
  title: "",
  date: "",
  time: "",
  location: "",
  tag: "CS",
  description: ""
};

const EventsPage = () => {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [registrationStatus, setRegistrationStatus] = useState({});
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState(initialNewEvent);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    // Load events from localStorage first, then fall back to JSON file
    const savedEvents = JSON.parse(localStorage.getItem('events') || 'null');
    if (savedEvents) {
      setData(savedEvents);
    } else {
      fetch("/data/eventsData.json")
        .then((res) => res.json())
        .then((json) => {
          setData(json);
          localStorage.setItem('events', JSON.stringify(json));
        })
        .catch(() => setData({ events: [] }));
    }
    // Load registration status
    const savedRegistrations = JSON.parse(localStorage.getItem('eventRegistrations') || '{}');
    setRegistrationStatus(savedRegistrations);
  };

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  const handleCreateEvent = (e) => {
    e.preventDefault();
    const newId = Math.max(0, ...data.events.map(e => e.id)) + 1;
    const eventToAdd = {
      ...newEvent,
      id: newId,
    };

    const updatedData = {
      events: [...data.events, eventToAdd]
    };
    setData(updatedData);
    localStorage.setItem('events', JSON.stringify(updatedData));
    setNewEvent(initialNewEvent);
    setShowCreateModal(false);
  };

  const handleRegister = (eventId) => {
    const event = data.events.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setShowRegistrationModal(true);
    }
  };

  const confirmRegistration = () => {
    if (selectedEvent) {
      const newStatus = { ...registrationStatus, [selectedEvent.id]: true };
      setRegistrationStatus(newStatus);
      localStorage.setItem('eventRegistrations', JSON.stringify(newStatus));
      setShowRegistrationModal(false);
      setSelectedEvent(null);
    }
  };

  const filteredEvents = data.events.filter(event => {
    const matchesFilter = filter === 'all' || event.tag.toLowerCase() === filter;
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Campus Events</h1>
          <p className="text-gray-600 mt-1">Browse and register for upcoming events</p>
        </div>

        {/* Search and Create */}
        <div className="mb-6 flex justify-between items-center">
          <div className="relative w-96">
            <input
              type="search"
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Event
          </button>
        </div>

        {/* Filter tabs */}
        <div className="mb-6">
          <div className="flex space-x-8">
            {['All', 'CS', 'Career', 'Analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab.toLowerCase())}
                className={`py-2 px-1 -mb-px border-b-2 transition-colors ${
                  filter === tab.toLowerCase()
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Event cards */}
        <div className="grid grid-cols-1 gap-4">
          {filteredEvents.map((event) => (
            <div key={event.id} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  event.tag === 'CS' ? 'bg-blue-100 text-blue-700' :
                  event.tag === 'Career' ? 'bg-green-100 text-green-700' :
                  'bg-purple-100 text-purple-700'
                }`}>
                  {event.tag}
                </span>
                <span className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {event.date} • {event.time}
                </span>
                <span className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {event.location}
                </span>
              </div>
              <h3 className="text-lg font-medium mt-2">{event.title}</h3>
              {event.description && (
                <p className="mt-2 text-gray-600 text-sm">{event.description}</p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => handleRegister(event.id)}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                    registrationStatus[event.id]
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  {registrationStatus[event.id] ? 'Registered' : 'Register'}
                </button>
                <button className="text-sm text-gray-600 hover:text-gray-800">
                  Add to calendar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Create New Event</h3>
            <form onSubmit={handleCreateEvent}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title
                  </label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <input
                      required
                      type="text"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Sep 25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time
                    </label>
                    <input
                      required
                      type="text"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 2-4 PM"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter event description"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Registration Modal */}
      {showRegistrationModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Register for Event</h3>
            <p className="text-gray-600 mb-4">
              Would you like to register for "{selectedEvent.title}"?
            </p>
            <div className="text-gray-600 mb-6">
              <p className="mb-2">Event Details:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Date: {selectedEvent.date}</li>
                <li>Time: {selectedEvent.time}</li>
                <li>Location: {selectedEvent.location}</li>
                {selectedEvent.description && (
                  <li className="mt-2 text-sm">{selectedEvent.description}</li>
                )}
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
              <button
                onClick={confirmRegistration}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
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
