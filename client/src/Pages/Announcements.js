// Pandey, Bhumika - 1000XXXXXX
// Announcements page (compat version for older linters)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserType, getUserData, logoutUser } from '../utilis/auth';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../api/announcements';

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
  const [userData, setUserDataState] = useState(null);
  // visible debug message so deployed builds show activity without relying on console
  const [debugMsg, setDebugMsg] = useState('');

  useEffect(function () {
    loadAnnouncements();
    loadUserData();
  }, []);

  const navigate = useNavigate();

  function loadUserData() {
    const user = getUserData();
    const type = getUserType();
    setUserDataState(user);
    setUserType(type);
  }

  function loadAnnouncements() {
    getAnnouncements()
        .then(function (resp) {
          const list =
              resp && resp.announcements && Array.isArray(resp.announcements)
                  ? resp.announcements
                  : [];
          setAnnouncements(list);
          try {
            localStorage.setItem('announcements', JSON.stringify(list));
          } catch (e) {}
        })
        .catch(function () {
          var saved = [];
          try {
            saved = JSON.parse(localStorage.getItem('announcements') || '[]');
          } catch (e) {
            saved = [];
          }
          if (saved && saved.length > 0) {
            setAnnouncements(saved);
          } else {
            var defaults = [
              {
                id: 1,
                title: 'Dept update: New lab hours',
                department: 'CS',
                date: 'Sep 12',
                description: 'Lab open until 8pm Mon-Thu; booking is required.',
                attachments: [{ name: 'Lab_Schedule.pdf', type: 'pdf' }],
                tags: ['CS', 'Facilities', 'Pinned'],
                isPinned: true,
                createdBy: 'system',
                createdAt: new Date().toISOString(),
              },
              {
                id: 2,
                title: 'Workshop posted: Intro to Git',
                department: 'IT',
                date: 'Sep 11',
                description: 'Basics of Git and GitHub',
                tags: ['IT', 'Workshop'],
                isPinned: false,
                createdBy: 'system',
                createdAt: new Date().toISOString(),
              },
            ];
            setAnnouncements(defaults);
            try {
              localStorage.setItem('announcements', JSON.stringify(defaults));
            } catch (e) {}
          }
        });
  }

  function handleCreateAnnouncement(e) {
    try {
      e.preventDefault();
    } catch (err) {}

    var payload = {
      title: newAnnouncement.title,
      description: newAnnouncement.description,
      department: newAnnouncement.department,
      tags: newAnnouncement.tags || [],
      isPinned: !!newAnnouncement.isPinned,
    };
    // show visible feedback immediately
    try { setDebugMsg('Creating announcement...'); } catch (er) {}

    createAnnouncement(payload)
        .then(function (resp) {
          var ann = resp && resp.announcement ? resp.announcement : null;
          var updated = announcements.slice(0);
          if (ann) {
            updated.push(ann);
          } else {
            updated.push({
              id: Date.now(),
              title: payload.title,
              description: payload.description,
              department: payload.department,
              tags: payload.tags,
              isPinned: payload.isPinned,
              createdAt: new Date().toISOString(),
              createdBy: userData && userData.email ? userData.email : 'system',
            });
          }
          setAnnouncements(updated);
          try {
            localStorage.setItem('announcements', JSON.stringify(updated));
          } catch (e) {}
          setNewAnnouncement(initialNewAnnouncement);
          setShowCreateModal(false);
          try { setDebugMsg('Announcement created'); } catch (er) {}
        })
        .catch(function (err) {
          // If the backend reports an invalid token, force local logout so users re-authenticate
          var msg = err && err.message ? err.message : String(err || 'unknown');
          console.error('create announcement error', msg, err);
          if (msg.toLowerCase().indexOf('invalid token') !== -1 || msg.toLowerCase().indexOf('not signed in') !== -1) {
            try { logoutUser(); } catch (e) {}
            try { setDebugMsg('Session expired or invalid token. Please sign out and sign in again.'); } catch (e) {}
            // Close modal and do not persist fallback silently so user knows the create did not reach the server
            setShowCreateModal(false);
            try { navigate('/login'); } catch (e) {}
            return;
          }

          // fallback: persist locally when backend is unreachable or other errors occur
          var fallback = {
            id: Date.now(),
            title: newAnnouncement.title,
            description: newAnnouncement.description,
            department: newAnnouncement.department,
            tags: newAnnouncement.tags || [],
            isPinned: !!newAnnouncement.isPinned,
            createdAt: new Date().toISOString(),
            createdBy: userData && userData.email ? userData.email : 'system',
          };
          var updated = announcements.slice(0);
          updated.push(fallback);
          setAnnouncements(updated);
          try {
            localStorage.setItem('announcements', JSON.stringify(updated));
          } catch (e) {}
          setNewAnnouncement(initialNewAnnouncement);
          setShowCreateModal(false);
          try { setDebugMsg('Create failed: ' + (msg || 'unknown')); } catch (er) {}
        });
  }

  function handleEditAnnouncement(announcement) {
    setEditingAnnouncement(announcement);
    setShowEditModal(true);
  }

  function handleUpdateAnnouncement(e) {
    e.preventDefault();

    if (!editingAnnouncement) return;

    var payload = {
      id: editingAnnouncement.id,
      title: editingAnnouncement.title,
      description: editingAnnouncement.description,
      department: editingAnnouncement.department,
      tags: editingAnnouncement.tags || [],
      isPinned: !!editingAnnouncement.isPinned,
    };

    updateAnnouncement(payload)
        .then(function (resp) {
          var ann = resp && resp.announcement ? resp.announcement : payload;
          var updated = announcements.map(function (a) {
            return a.id === ann.id ? Object.assign({}, a, ann) : a;
          });
          setAnnouncements(updated);
          try {
            localStorage.setItem('announcements', JSON.stringify(updated));
          } catch (e) {}
          setShowEditModal(false);
          setEditingAnnouncement(null);
        })
        .catch(function (err) {
          var msg = err && err.message ? err.message : String(err || 'unknown');
          console.error('update announcement error', msg, err);
          if (msg.toLowerCase().indexOf('invalid token') !== -1 || msg.toLowerCase().indexOf('not signed in') !== -1) {
            try { logoutUser(); } catch (e) {}
            try { setDebugMsg('Session expired or invalid token. Please sign out and sign in again.'); } catch (e) {}
            setShowEditModal(false);
            setEditingAnnouncement(null);
            try { navigate('/login'); } catch (e) {}
            return;
          }

          var updated = announcements.map(function (a) {
            return a.id === editingAnnouncement.id
                ? Object.assign({}, a, editingAnnouncement)
                : a;
          });
          setAnnouncements(updated);
          try {
            localStorage.setItem('announcements', JSON.stringify(updated));
          } catch (e) {}
          setShowEditModal(false);
          setEditingAnnouncement(null);
        });
  }

  function handleDeleteAnnouncement(id) {
    if (!window.confirm('Are you sure you want to delete this announcement?')) {
      return;
    }
    deleteAnnouncement(id)
        .then(function () {
          var updated = announcements.filter(function (a) {
            return a.id !== id;
          });
          setAnnouncements(updated);
          try {
            localStorage.setItem('announcements', JSON.stringify(updated));
          } catch (e) {}
        })
        .catch(function (err) {
          var msg = err && err.message ? err.message : String(err || 'unknown');
          console.error('delete announcement error', msg, err);
          if (msg.toLowerCase().indexOf('invalid token') !== -1 || msg.toLowerCase().indexOf('not signed in') !== -1) {
            try { logoutUser(); } catch (e) {}
            try { setDebugMsg('Session expired or invalid token. Please sign out and sign in again.'); } catch (e) {}
            try { navigate('/login'); } catch (e) {}
            return;
          }

          var updated = announcements.filter(function (a) {
            return a.id !== id;
          });
          setAnnouncements(updated);
          try {
            localStorage.setItem('announcements', JSON.stringify(updated));
          } catch (e) {}
        });
  }

  var canManageAnnouncements =
      userType === 'admin' || userType === 'instructor';

  var filteredAnnouncements = announcements.filter(function (a) {
    var q = (searchQuery || '').toLowerCase();
    var matchesSearch =
        q === '' ||
        (a.title || '').toLowerCase().indexOf(q) !== -1 ||
        (a.description || '').toLowerCase().indexOf(q) !== -1;

    var matchesDepartment =
        filter === 'All Departments' || a.department === filter;

    var matchesPinned = !showPinnedOnly || !!a.isPinned;

    return matchesSearch && matchesDepartment && matchesPinned;
  });

  return (
      <div className="min-h-screen bg-gray-50">
        {/* visible debug banner */}
        {debugMsg ? (
          <div className="fixed top-4 right-4 bg-yellow-100 text-yellow-900 px-4 py-2 rounded shadow z-50">
            {debugMsg}
          </div>
        ) : null}
        <div className="max-w-5xl mx-auto p-6 w-full">
          {/* Header & controls */}
          <div className="mb-6 flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <h1 className="text-2xl font-semibold text-gray-900">
                Announcements
              </h1>

              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
                {canManageAnnouncements && (
                    <>
                      <button
                          onClick={function () {
                            setShowCreateModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                      >
                        Create Announcement
                      </button>

                      {/* Admin-only debug button to test API from deployed UI (temporary) */}
                    </>
                )}

                <div className="relative w-full sm:w-auto sm:min-w-[260px]">
                  <input
                      type="text"
                      placeholder="Search announcements..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchQuery}
                      onChange={function (e) {
                        setSearchQuery(e.target.value);
                      }}
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

                <div className="flex items-center flex-wrap gap-3">
                  <select
                      className="border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filter}
                      onChange={function (e) {
                        setFilter(e.target.value);
                      }}
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
                        onChange={function (e) {
                          setShowPinnedOnly(e.target.checked);
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        aria-label="Pinned only"
                    />
                    <span className="text-sm text-gray-700">Pinned only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-4">
            {filteredAnnouncements.map(function (a) {
              return (
                  <div key={a.id} className="bg-white shadow rounded-lg p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {(a.department || '') + ' • ' + (a.date || '')}
                      </span>
                          {a.isPinned ? (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          📌 Pinned
                        </span>
                          ) : null}
                        </div>

                        <h2 className="text-lg font-medium text-gray-900 mb-2 break-words">
                          {a.title}
                        </h2>
                        <p className="text-gray-600 mb-4 break-words">
                          {a.description}
                        </p>

                        {a.attachments && a.attachments.length ? (
                            <div className="mt-4">
                              <div className="flex flex-wrap gap-3">
                                {a.attachments.map(function (att, i) {
                                  return (
                                      <button
                                          key={i}
                                          onClick={function () {
                                            window.open('/data/' + att.name, '_blank');
                                          }}
                                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                                          aria-label={'Open attachment ' + att.name}
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
                                        {att.name}
                                      </button>
                                  );
                                })}
                              </div>
                            </div>
                        ) : null}

                        <div className="mt-4 flex flex-wrap gap-2">
                          {(a.tags || []).map(function (tag, i) {
                            return (
                                <span
                                    key={i}
                                    className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                            {tag}
                          </span>
                            );
                          })}
                        </div>
                      </div>

                      {canManageAnnouncements ? (
                          <div className="flex-shrink-0 flex gap-2 mt-2 sm:mt-0">
                            <button
                                onClick={function () {
                                  handleEditAnnouncement(a);
                                }}
                                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                            >
                              Edit
                            </button>
                            <button
                                onClick={function () {
                                  handleDeleteAnnouncement(a.id);
                                }}
                                className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                      ) : null}
                    </div>
                  </div>
              );
            })}
          </div>
        </div>

        {/* Create Modal */}
        {showCreateModal ? (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-2 max-h-[90vh] overflow-auto">
                <h3 className="text-xl font-semibold mb-4">Create New Announcement</h3>
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
                          onChange={function (e) {
                            setNewAnnouncement(
                                Object.assign({}, newAnnouncement, { title: e.target.value })
                            );
                          }}
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
                          onChange={function (e) {
                            setNewAnnouncement(
                                Object.assign({}, newAnnouncement, { department: e.target.value })
                            );
                          }}
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
                          onChange={function (e) {
                            setNewAnnouncement(
                                Object.assign({}, newAnnouncement, { description: e.target.value })
                            );
                          }}
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
                          value={(newAnnouncement.tags || []).join(', ')}
                          onChange={function (e) {
                            var parts = e.target.value.split(',');
                            var cleaned = [];
                            for (var i = 0; i < parts.length; i++) {
                              var t = parts[i].trim();
                              if (t) cleaned.push(t);
                            }
                            setNewAnnouncement(
                                Object.assign({}, newAnnouncement, { tags: cleaned })
                            );
                          }}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Important, Workshop, Update"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                          type="checkbox"
                          id="isPinned"
                          checked={!!newAnnouncement.isPinned}
                          onChange={function (e) {
                            setNewAnnouncement(
                                Object.assign({}, newAnnouncement, { isPinned: e.target.checked })
                            );
                          }}
                          className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="isPinned" className="text-sm text-gray-700">
                        Pin this announcement
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={function () {
                          setShowCreateModal(false);
                        }}
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
        ) : null}

        {/* Edit Modal */}
        {showEditModal && editingAnnouncement ? (
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
                          onChange={function (e) {
                            setEditingAnnouncement(
                                Object.assign({}, editingAnnouncement, { title: e.target.value })
                            );
                          }}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <select
                          value={editingAnnouncement.department}
                          onChange={function (e) {
                            setEditingAnnouncement(
                                Object.assign({}, editingAnnouncement, { department: e.target.value })
                            );
                          }}
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
                          onChange={function (e) {
                            setEditingAnnouncement(
                                Object.assign({}, editingAnnouncement, { description: e.target.value })
                            );
                          }}
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
                          onChange={function (e) {
                            var parts = e.target.value.split(',');
                            var cleaned = [];
                            for (var i = 0; i < parts.length; i++) {
                              var t = parts[i].trim();
                              if (t) cleaned.push(t);
                            }
                            setEditingAnnouncement(
                                Object.assign({}, editingAnnouncement, { tags: cleaned })
                            );
                          }}
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                          type="checkbox"
                          id="editPinned"
                          checked={!!editingAnnouncement.isPinned}
                          onChange={function (e) {
                            setEditingAnnouncement(
                                Object.assign({}, editingAnnouncement, { isPinned: e.target.checked })
                            );
                          }}
                          className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="editPinned" className="text-sm text-gray-700">
                        Pin this announcement
                      </label>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={function () {
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
        ) : null}
      </div>
  );
};

export default Announcements;
