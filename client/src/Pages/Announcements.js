// Pandey, Bhumika - 1000XXXXXX
// [Teammate Last, First] - [ID]
// Component originally scaffolded/iterated with AI assistance
// Responsive design: mobile-first w/ Tailwind breakpoints, flex wraps, min-w on inputs
// Accessibility: aria-labels on interactive elements, visible focus rings, semantic headings

import React, { useState, useEffect } from 'react';
import { getUserType, getUserData } from '../utilis/auth';
import { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../api/announcements';

const initialNewAnnouncement = {
  title: '',
  description: '',
  department: 'CS',
  tags: [],
  isPinned: false,
};

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filter, setFilter] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [newAnnouncement, setNewAnnouncement] = useState(initialNewAnnouncement);
  const [userType, setUserType] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadAnnouncements();
    loadUserData();
  }, []);

  const loadUserData = () => {
    const user = getUserData();
    const type = getUserType();
    setUserData(user);
    setUserType(type);
  };

  const loadAnnouncements = () => {
    // Network-first: try server, fall back to localStorage or seeded defaults
    getAnnouncements()
      .then((resp) => {
        const list = resp && Array.isArray(resp.announcements) ? resp.announcements : [];
        setAnnouncements(list);
        localStorage.setItem('announcements', JSON.stringify(list));
      })
      .catch(() => {
        const savedAnnouncements = JSON.parse(localStorage.getItem('announcements') || '[]');
        if (savedAnnouncements && savedAnnouncements.length > 0) {
          setAnnouncements(savedAnnouncements);
        } else {
          // Seed a couple of local announcements if none exist
          const defaultAnnouncements = [
            { id: 1, title: 'Dept update: New lab hours', department: 'CS', date: 'Sep 12', description: 'Lab open until 8pm Mon-Thu; booking is required.', attachments: [{ name: 'Lab_Schedule.pdf', type: 'pdf' }], tags: ['CS','Facilities','Pinned'], isPinned: true, createdBy: 'system', createdAt: new Date().toISOString() },
            { id: 2, title: 'Workshop posted: Intro to Git', department: 'IT', date: 'Sep 11', description: 'Basics of Git and GitHub', tags: ['IT','Workshop'], isPinned: false, createdBy: 'system', createdAt: new Date().toISOString() }
          ];
          setAnnouncements(defaultAnnouncements);
          localStorage.setItem('announcements', JSON.stringify(defaultAnnouncements));
        }
      });
   };

   const handleCreateAnnouncement = (e) => {
     console.debug('Announcements: handleCreateAnnouncement called', { newAnnouncement });
     try { e.preventDefault(); } catch (err) { /* in case called not as event */ }
     const payload = {
       title: newAnnouncement.title,
       description: newAnnouncement.description,
       department: newAnnouncement.department,
       tags: newAnnouncement.tags || [],
       isPinned: !!newAnnouncement.isPinned
     };

    // log before calling network
    console.debug('Announcements: createAnnouncement payload', payload);

    createAnnouncement(payload)
      .then((resp) => {
        const ann = resp && resp.announcement ? resp.announcement : null;
        const updated = ann ? [...announcements, ann] : [...announcements, { ...payload, id: Date.now(), createdAt: new Date().toISOString(), createdBy: userData?.email || 'system' }];
        setAnnouncements(updated);
        localStorage.setItem('announcements', JSON.stringify(updated));
        setNewAnnouncement(initialNewAnnouncement);
        setShowCreateModal(false);
      })
      .catch(() => {
        // fallback to local only
        const localAnn = { ...newAnnouncement, id: Date.now(), createdAt: new Date().toISOString(), createdBy: userData?.email || 'system' };
        const updated = [...announcements, localAnn];
        setAnnouncements(updated);
        localStorage.setItem('announcements', JSON.stringify(updated));
        setNewAnnouncement(initialNewAnnouncement);
        setShowCreateModal(false);
      });
   };

   const handleEditAnnouncement = (announcement) => {
     setEditingAnnouncement(announcement);
     setShowEditModal(true);
   };

   const handleUpdateAnnouncement = (e) => {
     e.preventDefault();
    const payload = {
      id: editingAnnouncement.id,
      title: editingAnnouncement.title,
      description: editingAnnouncement.description,
      department: editingAnnouncement.department,
      tags: editingAnnouncement.tags || [],
      isPinned: !!editingAnnouncement.isPinned
    };

    updateAnnouncement(payload)
      .then((resp) => {
        const ann = resp && resp.announcement ? resp.announcement : payload;
        const updated = announcements.map((a) => (a.id === ann.id ? { ...a, ...ann } : a));
        setAnnouncements(updated);
        localStorage.setItem('announcements', JSON.stringify(updated));
        setShowEditModal(false);
        setEditingAnnouncement(null);
      })
      .catch(() => {
        // local fallback
        const updatedAnnouncements = announcements.map((announcement) =>
          announcement.id === editingAnnouncement.id ? { ...announcement, ...editingAnnouncement } : announcement
        );
        setAnnouncements(updatedAnnouncements);
        localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
        setShowEditModal(false);
        setEditingAnnouncement(null);
      });
   };

   const handleDeleteAnnouncement = (id) => {
     if (window.confirm('Are you sure you want to delete this announcement?')) {
      deleteAnnouncement(id)
        .then(() => {
          const updatedAnnouncements = announcements.filter((announcement) => announcement.id !== id);
          setAnnouncements(updatedAnnouncements);
          localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
        })
        .catch(() => {
          // local fallback delete
          const updatedAnnouncements = announcements.filter((announcement) => announcement.id !== id);
          setAnnouncements(updatedAnnouncements);
          localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
        });
     }
   };

  const canManageAnnouncements =
      userType === 'admin' || userType === 'instructor';

  const filteredAnnouncements = announcements.filter((announcement) => {
    const matchesSearch =
        searchQuery === '' ||
        announcement.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
        announcement.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

    const matchesDepartment =
        filter === 'All Departments' || announcement.department === filter;

    const matchesPinned = !showPinnedOnly || announcement.isPinned;

    return matchesSearch && matchesDepartment && matchesPinned;
  });

  return (
      <div className="min-h-screen bg-gray-50">
        {/* centered responsive container */}
        <div className="max-w-5xl mx-auto p-6 w-full">

          {/* HEADER / CONTROLS */}
          <div className="mb-6 flex flex-col gap-4">
            {/* Desktop: title left, controls right.
              Mobile: stacked. */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              {/* Title */}
              <h1 className="text-2xl font-semibold text-gray-900">
                Announcements
              </h1>

              {/* Control bar: Create / Search / Filters / Pinned */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">

                {/* Create Announcement button (admins/instructors only) */}
                {canManageAnnouncements && (
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                    >
                      Create Announcement
                    </button>
                )}

                {/* Search input */}
                <div className="relative w-full sm:w-auto sm:min-w-[260px]">
                  <input
                      type="text"
                      placeholder="Search announcements..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="Search announcements"
                  />
                  <svg
                      className="w-5 h-5 absolute left-3 top-2.5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                {/* Department filter + pinned toggle */}
                <div className="flex items-center flex-wrap gap-3">
                  <select
                      className="border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      aria-label="Filter by department"
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
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        aria-label="Pinned only"
                    />
                    <span className="text-sm text-gray-700">Pinned only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ANNOUNCEMENTS LIST */}
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
                <div
                    key={announcement.id}
                    className="bg-white shadow rounded-lg p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Main announcement content */}
                    <div className="flex-1 min-w-0">
                      {/* badges row */}
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {announcement.department} • {announcement.date}
                    </span>
                        {announcement.isPinned && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        📌 Pinned
                      </span>
                        )}
                      </div>

                      {/* title + desc */}
                      <h2 className="text-lg font-medium text-gray-900 mb-2 break-words">
                        {announcement.title}
                      </h2>
                      <p className="text-gray-600 mb-4 break-words">
                        {announcement.description}
                      </p>

                      {/* attachments */}
                      {announcement.attachments && (
                          <div className="mt-4">
                            <div className="flex flex-wrap gap-3">
                              {announcement.attachments.map((attachment, i) => (
                                  <button
                                      key={i}
                                      onClick={() =>
                                          window.open(`/data/${attachment.name}`, '_blank')
                                      }
                                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                                      aria-label={`Open attachment ${attachment.name}`}
                                  >
                                    <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                      <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                      />
                                    </svg>
                                    {attachment.name}
                                  </button>
                              ))}
                            </div>
                          </div>
                      )}

                      {/* tags */}
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

                    {/* action buttons */}
                    {canManageAnnouncements && (
                        <div className="flex-shrink-0 flex gap-2 mt-2 sm:mt-0">
                          <button
                              onClick={() => handleEditAnnouncement(announcement)}
                              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </button>
                          <button
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                              className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                    )}
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* CREATE ANNOUNCEMENT MODAL */}
        {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-2 max-h-[90vh] overflow-auto">
                <h3 className="text-xl font-semibold mb-4">
                  Create New Announcement
                </h3>
                <form onSubmit={handleCreateAnnouncement}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                          required
                          type="text"
                          value={newAnnouncement.title}
                          onChange={(e) =>
                              setNewAnnouncement({
                                ...newAnnouncement,
                                title: e.target.value,
                              })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter announcement title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                          value={newAnnouncement.department}
                          onChange={(e) =>
                              setNewAnnouncement({
                                ...newAnnouncement,
                                department: e.target.value,
                              })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="CS">CS</option>
                        <option value="IT">IT</option>
                        <option value="Admin">Admin</option>
                        <option value="Math">Math</option>
                        <option value="Physics">Physics</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                          required
                          value={newAnnouncement.description}
                          onChange={(e) =>
                              setNewAnnouncement({
                                ...newAnnouncement,
                                description: e.target.value,
                              })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="4"
                          placeholder="Enter announcement description"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags (comma-separated)
                      </label>
                      <input
                          type="text"
                          value={newAnnouncement.tags.join(', ')}
                          onChange={(e) =>
                              setNewAnnouncement({
                                ...newAnnouncement,
                                tags: e.target.value
                                    .split(',')
                                    .map((tag) => tag.trim())
                                    .filter((tag) => tag),
                              })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Important, Workshop, Update"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                          type="checkbox"
                          id="isPinned"
                          checked={newAnnouncement.isPinned}
                          onChange={(e) =>
                              setNewAnnouncement({
                                ...newAnnouncement,
                                isPinned: e.target.checked,
                              })
                          }
                          className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                          htmlFor="isPinned"
                          className="text-sm text-gray-700"
                      >
                        Pin this announcement
                      </label>
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
                      Create Announcement
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {/* EDIT ANNOUNCEMENT MODAL */}
        {showEditModal && editingAnnouncement && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-2 max-h-[90vh] overflow-auto">
                <h3 className="text-xl font-semibold mb-4">Edit Announcement</h3>
                <form onSubmit={handleUpdateAnnouncement}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                          required
                          type="text"
                          value={editingAnnouncement.title}
                          onChange={(e) =>
                              setEditingAnnouncement({
                                ...editingAnnouncement,
                                title: e.target.value,
                              })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                          value={editingAnnouncement.department}
                          onChange={(e) =>
                              setEditingAnnouncement({
                                ...editingAnnouncement,
                                department: e.target.value,
                              })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="CS">CS</option>
                        <option value="IT">IT</option>
                        <option value="Admin">Admin</option>
                        <option value="Math">Math</option>
                        <option value="Physics">Physics</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                          required
                          value={editingAnnouncement.description}
                          onChange={(e) =>
                              setEditingAnnouncement({
                                ...editingAnnouncement,
                                description: e.target.value,
                              })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={4}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags (comma-separated)
                      </label>
                      <input
                          type="text"
                          value={(editingAnnouncement.tags || []).join(', ')}
                          onChange={(e) =>
                              setEditingAnnouncement({
                                ...editingAnnouncement,
                                tags: e.target.value
                                    .split(',')
                                    .map((t) => t.trim())
                                    .filter(Boolean),
                              })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                          type="checkbox"
                          id="editPinned"
                          checked={!!editingAnnouncement.isPinned}
                          onChange={(e) =>
                              setEditingAnnouncement({
                                ...editingAnnouncement,
                                isPinned: e.target.checked,
                              })
                          }
                          className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                          htmlFor="editPinned"
                          className="text-sm text-gray-700"
                      >
                        Pin this announcement
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => {
                          setShowEditModal(false);
                          setEditingAnnouncement(null);
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
};

export default Announcements;
