import React, { useEffect, useState } from "react";
import { getClasses, createClass, updateClass, deleteClass } from "../api/classes"; // NEW: PHP API helpers

const initialNewClass = {
  title: "",
  courseCode: "",
  description: "",
  instructor: "",
  schedule: "",
  location: "",
  maxStudents: "",
  prerequisites: ""
};

const ClassesPage = () => {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClass, setNewClass] = useState(initialNewClass);
  const [enrollmentStatus, setEnrollmentStatus] = useState({});
  const [userType, setUserType] = useState("");
  // Editing state for classes (local-only for now)
  const [isEditing, setIsEditing] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);

  useEffect(() => {
    loadClasses();
    const currentUserType = localStorage.getItem("userType") || "student";
    setUserType(currentUserType);
  }, []);

  // Load classes from PHP API (fallback to empty if it fails)
  const loadClasses = async () => {
    try {
      const rows = await getClasses(); // [{...}]
      setData({ classes: rows });
    } catch (e) {
      console.error("Failed to load classes:", e);
      setData({ classes: [] });
    }
    // Load enrollment status (still client-side)
    const savedEnrollments = JSON.parse(
        localStorage.getItem("classEnrollments") || "{}"
    );
    setEnrollmentStatus(savedEnrollments);
  };

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  // Save handler supports both creating a new class (API) and editing an existing one (local for now)
  const handleSaveClass = async (e) => {
    e.preventDefault();

    // EDIT (use server-side update now)
    if (isEditing && editingClassId != null) {
      try {
        const payload = {
          id: editingClassId,
          title: newClass.title.trim(),
          courseCode: newClass.courseCode.trim(),
          description: newClass.description.trim(),
          instructor: newClass.instructor.trim(),
          schedule: newClass.schedule.trim(),
          location: newClass.location.trim(),
          maxStudents: Number(newClass.maxStudents),
          prerequisites: newClass.prerequisites.trim(),
        };

        const { class: updated } = await updateClass(payload);

        const updatedClasses = data.classes.map((cls) =>
          cls.id === editingClassId ? { ...cls, ...updated } : cls
        );
        setData({ classes: updatedClasses });

        // reset edit state
        setIsEditing(false);
        setEditingClassId(null);
        setNewClass(initialNewClass);
        setShowCreateModal(false);
        return;
      } catch (err) {
        const msg = err?.message || "Failed to update class";
        alert(msg);
        return;
      }
    }

    // CREATE (via API; allowed for admin/instructor only)
    try {
      const payload = {
        title: newClass.title.trim(),
        courseCode: newClass.courseCode.trim(),
        description: newClass.description.trim(),
        instructor: newClass.instructor.trim(),
        schedule: newClass.schedule.trim(),
        location: newClass.location.trim(),
        maxStudents: Number(newClass.maxStudents),
        prerequisites: newClass.prerequisites.trim()
      };

      const { class: created } = await createClass(payload);
      // Prepend newest
      setData({ classes: [created, ...data.classes] });

      setNewClass(initialNewClass);
      setShowCreateModal(false);
    } catch (err) {
      const msg = err?.message || "Failed to create class";
      alert(msg);
    }
  };

  const handleEnroll = (classId) => {
    const newStatus = { ...enrollmentStatus, [classId]: true };
    setEnrollmentStatus(newStatus);
    localStorage.setItem("classEnrollments", JSON.stringify(newStatus));

    const updatedClasses = data.classes.map((cls) =>
        cls.id === classId
            ? {
              ...cls,
              currentStudents: (cls.currentStudents || 0) + 1,
              isEnrolled: true
            }
            : cls
    );
    setData({ classes: updatedClasses });
  };

  const handleUnenroll = (classId) => {
    const newStatus = { ...enrollmentStatus };
    delete newStatus[classId];
    setEnrollmentStatus(newStatus);
    localStorage.setItem("classEnrollments", JSON.stringify(newStatus));

    const updatedClasses = data.classes.map((cls) =>
        cls.id === classId
            ? {
              ...cls,
              currentStudents: Math.max(0, (cls.currentStudents || 1) - 1),
              isEnrolled: false
            }
            : cls
    );
    setData({ classes: updatedClasses });
  };

  const handleEditClick = (cls) => {
    setIsEditing(true);
    setEditingClassId(cls.id);
    setNewClass({
      title: cls.title || "",
      courseCode: cls.courseCode || "",
      description: cls.description || "",
      instructor: cls.instructor || "",
      schedule: cls.schedule || "",
      location: cls.location || "",
      maxStudents: cls.maxStudents || "",
      prerequisites: cls.prerequisites || ""
    });
    setShowCreateModal(true);
  };

  const handleDeleteClass = async (classId) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this class? This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      // Call server API to delete
      await deleteClass(classId);
      // Remove from local UI after server confirms
      const updated = data.classes.filter((c) => c.id !== classId);
      setData({ classes: updated });
    } catch (err) {
      const msg = err?.message || 'Failed to delete class';
      alert(msg);
    }
  };

  const filteredClasses = data.classes.filter((cls) => {
    const matchesFilter =
        filter === "all" ||
        cls.courseCode.toLowerCase().includes(filter.toLowerCase());
    const q = searchQuery.toLowerCase();
    const matchesSearch =
        q === "" ||
        cls.title.toLowerCase().includes(q) ||
        cls.courseCode.toLowerCase().includes(q) ||
        cls.instructor.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const canCreateClass = userType === "admin" || userType === "instructor";
  const canEnroll = userType === "student";

  return (
      <div className="min-h-screen bg-gray-50">
        <div className="page-container p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Classes</h1>
            <p className="text-gray-600 mt-1">
              {userType === "student"
                  ? "Browse and enroll in classes"
                  : userType === "instructor"
                      ? "Manage your classes"
                      : "Manage all classes and enrollments"}
            </p>
          </div>

          {/* Search and Create */}
          <div className="mb-6 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3">
            <div className="relative w-full max-w-md">
              <input
                  type="search"
                  placeholder="Search classes..."
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
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {canCreateClass && (
                <div className="w-full sm:w-auto">
                  <button
                      onClick={() => {
                        setShowCreateModal(true);
                        setNewClass(initialNewClass);
                        setIsEditing(false);
                        setEditingClassId(null);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                  >
                    Create Class
                  </button>
                </div>
            )}
          </div>

          {/* Filter tabs */}
          <div className="mb-6">
            <div className="flex space-x-8">
              {["All", "CS", "MATH", "ENG"].map((tab) => (
                  <button
                      key={tab}
                      onClick={() => setFilter(tab.toLowerCase())}
                      className={`py-2 px-1 -mb-px border-b-2 transition-colors ${
                          filter === tab.toLowerCase()
                              ? "border-blue-600 text-blue-600"
                              : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                  >
                    {tab}
                  </button>
              ))}
            </div>
          </div>

          {/* Class cards */}
          <div className="grid grid-cols-1 gap-4">
            {filteredClasses.map((cls) => (
                <div key={cls.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-start justify-between responsive-row">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                      {cls.courseCode}
                    </span>
                        <span className="text-sm text-gray-600">{cls.schedule}</span>
                        <span className="text-sm text-gray-600">{cls.location}</span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">{cls.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 break-words">
                        {cls.description}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500">
                        <span>Instructor: {cls.instructor}</span>
                        <span>
                      Students: {cls.currentStudents}/{cls.maxStudents}
                    </span>
                        <span>Prerequisites: {cls.prerequisites}</span>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0">
                      {canEnroll && (
                          <button
                              onClick={() =>
                                  enrollmentStatus[cls.id]
                                      ? handleUnenroll(cls.id)
                                      : handleEnroll(cls.id)
                              }
                              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                  enrollmentStatus[cls.id]
                                      ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                                      : "bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                              }`}
                          >
                            {enrollmentStatus[cls.id] ? "Unenroll" : "Enroll"}
                          </button>
                      )}
                      {canCreateClass && (
                          <div className="flex gap-2 mt-2 sm:mt-0">
                            <button
                                onClick={() => handleEditClick(cls)}
                                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700"
                            >
                              Edit
                            </button>
                            <button
                                onClick={() => handleDeleteClass(cls.id)}
                                className="px-3 py-1 text-sm text-red-600 hover:text-red-700"
                            >
                              Delete
                            </button>
                          </div>
                      )}
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* Create/Edit Class Modal */}
        {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl p-6 max-w-2xl w-full modal-scrollable">
                <h3 className="text-xl font-semibold mb-4">
                  {isEditing ? "Edit Class" : "Create New Class"}
                </h3>
                <form onSubmit={handleSaveClass}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Class Title
                      </label>
                      <input
                          required
                          type="text"
                          value={newClass.title}
                          onChange={(e) =>
                              setNewClass({ ...newClass, title: e.target.value })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter class title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course Code
                      </label>
                      <input
                          required
                          type="text"
                          value={newClass.courseCode}
                          onChange={(e) =>
                              setNewClass({ ...newClass, courseCode: e.target.value })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., CS5335"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instructor
                      </label>
                      <input
                          required
                          type="text"
                          value={newClass.instructor}
                          onChange={(e) =>
                              setNewClass({ ...newClass, instructor: e.target.value })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter instructor name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Schedule
                      </label>
                      <input
                          required
                          type="text"
                          value={newClass.schedule}
                          onChange={(e) =>
                              setNewClass({ ...newClass, schedule: e.target.value })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Mon, Wed, Fri 2:15 PM"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                          required
                          type="text"
                          value={newClass.location}
                          onChange={(e) =>
                              setNewClass({ ...newClass, location: e.target.value })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter location"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Students
                      </label>
                      <input
                          required
                          type="number"
                          value={newClass.maxStudents}
                          onChange={(e) =>
                              setNewClass({ ...newClass, maxStudents: e.target.value })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="30"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prerequisites
                      </label>
                      <input
                          type="text"
                          value={newClass.prerequisites}
                          onChange={(e) =>
                              setNewClass({
                                ...newClass,
                                prerequisites: e.target.value
                              })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter prerequisites"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                          value={newClass.description}
                          onChange={(e) =>
                              setNewClass({ ...newClass, description: e.target.value })
                          }
                          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="Enter class description"
                      />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => {
                          setShowCreateModal(false);
                          setIsEditing(false);
                          setEditingClassId(null);
                          setNewClass(initialNewClass);
                        }}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {isEditing ? "Save Changes" : "Create Class"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}
      </div>
  );
};

export default ClassesPage;
