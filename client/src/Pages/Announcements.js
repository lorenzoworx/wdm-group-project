import React, { useState } from 'react';

const Announcements = () => {
  const [announcements] = useState([
    {
      title: 'Dept update: New lab hours',
      department: 'CS',
      date: 'Sep 12',
      description: 'Lab open until 8pm Mon-Thu; booking is required.',
      attachments: [
        { name: 'Lab_Schedule.pdf', type: 'pdf' },
        { name: 'Booking_Guide.pdf', type: 'pdf' }
      ],
      tags: ['CS', 'Facilities', 'Pinned']
    },
    {
      title: 'Workshop posted: Intro to Git',
      department: 'IT',
      date: 'Sep 11',
      description: 'Basics of Git and GitHub: branching, PRs, and more.',
      tags: ['IT', 'Workshop']
    },
    {
      title: 'Holiday notice: Campus closed',
      department: 'Admin',
      date: 'Sep 10',
      description: 'Campus will be closed for the federal holiday.',
      tags: ['Admin', 'Holiday']
    }
  ]);

  const [filter, setFilter] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = searchQuery === '' || 
      announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      announcement.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = filter === 'All Departments' || 
      announcement.department === filter;
    
    const matchesPinned = !showPinnedOnly || 
      announcement.tags.includes('Pinned');
    
    return matchesSearch && matchesDepartment && matchesPinned;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header and Search */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Announcements</h1>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search announcements..."
                className="w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              className="border rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>All Departments</option>
              <option>CS</option>
              <option>IT</option>
              <option>Admin</option>
            </select>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showPinnedOnly}
                onChange={(e) => setShowPinnedOnly(e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="text-sm text-gray-700">Pinned only</span>
            </label>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {announcement.department} • {announcement.date}
                    </span>
                  </div>
                  <h2 className="text-lg font-medium text-gray-900 mb-2">{announcement.title}</h2>
                  <p className="text-gray-600 mb-4">{announcement.description}</p>
                  
                  {announcement.attachments && (
                    <div className="mt-4">
                      <div className="space-x-4">
                        {announcement.attachments.map((attachment, i) => (
                          <button
                            key={i}
                            onClick={() => window.open(`/data/${attachment.name}`, '_blank')}
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            {attachment.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {announcement.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Announcements;
