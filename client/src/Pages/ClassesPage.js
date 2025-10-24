import React, { useEffect, useState } from "react";

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
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClass, setNewClass] = useState(initialNewClass);
  const [enrollmentStatus, setEnrollmentStatus] = useState({});
  const [userType, setUserType] = useState('');

  useEffect(() => {
    loadClasses();
    // Get user type from localStorage
    const currentUserType = localStorage.getItem('userType') || 'student';
    setUserType(currentUserType);
  }, []);

  const loadClasses = () => {
    // Load classes from localStorage first, then fall back to default data
    const savedClasses = JSON.parse(localStorage.getItem('classes') || 'null');
    if (savedClasses) {
      setData(savedClasses);
    } else {
      // Default classes data
      const defaultClasses = {
        classes: [
          {
            id: 1,
            title: "Web Data Management",
            courseCode: "CS5335",
            description: "Advanced concepts in web data management and database systems",
            instructor: "Dr. Smith",
            schedule: "Mon, Wed, Fri 2:15 PM",
            location: "ERB 130",
            maxStudents: 30,
            currentStudents: 25,
            prerequisites: "CS 5330 or equivalent",
            isEnrolled: false
          },
          {
            id: 2,
            title: "Machine Learning",
            courseCode: "CS 5339",
            description: "Introduction to machine learning algorithms and applications",
            instructor: "Dr. Johnson",
            schedule: "Tue, Thu 10:00 AM",
            location: "ERB 140",
            maxStudents: 25,
            currentStudents: 20,
            prerequisites: "CS 5330, Linear Algebra",
            isEnrolled: false
          }
        ]
      };
      setData(defaultClasses);
      localStorage.setItem('classes', JSON.stringify(defaultClasses));
    }
    
    // Load enrollment status
    const savedEnrollments = JSON.parse(localStorage.getItem('classEnrollments') || '{}');
    setEnrollmentStatus(savedEnrollments);
  };

  if (!data) return <p className="text-center mt-10">Loading...</p>;

  const handleCreateClass = (e) => {
    e.preventDefault();
    const newId = Math.max(0, ...data.classes.map(c => c.id)) + 1;
    const classToAdd = {
      ...newClass,
      id: newId,
      currentStudents: 0,
      isEnrolled: false
    };

    const updatedData = {
      classes: [...data.classes, classToAdd]
    };
    setData(updatedData);
    localStorage.setItem('classes', JSON.stringify(updatedData));
    setNewClass(initialNewClass);
    setShowCreateModal(false);
  };

  const handleEnroll = (classId) => {
    const newStatus = { ...enrollmentStatus, [classId]: true };
    setEnrollmentStatus(newStatus);
    localStorage.setItem('classEnrollments', JSON.stringify(newStatus));
    
    // Update current students count
    const updatedClasses = data.classes.map(cls => 
      cls.id === classId 
        ? { ...cls, currentStudents: cls.currentStudents + 1, isEnrolled: true }
        : cls
    );
    const updatedData = { classes: updatedClasses };
    setData(updatedData);
    localStorage.setItem('classes', JSON.stringify(updatedData));
  };

  const handleUnenroll = (classId) => {
    const newStatus = { ...enrollmentStatus };
    delete newStatus[classId];
    setEnrollmentStatus(newStatus);
    localStorage.setItem('classEnrollments', JSON.stringify(newStatus));
    
    // Update current students count
    const updatedClasses = data.classes.map(cls => 
      cls.id === classId 
        ? { ...cls, currentStudents: cls.currentStudents - 1, isEnrolled: false }
        : cls
    );
    const updatedData = { classes: updatedClasses };
    setData(updatedData);
    localStorage.setItem('classes', JSON.stringify(updatedData));
  };

  const filteredClasses = data.classes.filter(cls => {
    const matchesFilter = filter === 'all' || cls.courseCode.toLowerCase().includes(filter.toLowerCase());
    const matchesSearch = searchQuery === '' || 
      cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const canCreateClass = userType === 'admin' || userType === 'instructor';
  const canEnroll = userType === 'student';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Classes</h1>
          <p className="text-gray-600 mt-1">
            {userType === 'student' ? 'Browse and enroll in classes' : 
             userType === 'instructor' ? 'Manage your classes' : 
             'Manage all classes and enrollments'}
          </p>
        </div>

        {/* Search and Create */}
        <div className="mb-6 flex justify-between items-center">
          <div className="relative w-96">
            <input
              type="search"
              placeholder="Search classes..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {canCreateClass && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Class
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="mb-6">
          <div className="flex space-x-8">
            {['All', 'CS', 'MATH', 'ENG'].map((tab) => (
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

        {/* Class cards */}
        <div className="grid grid-cols-1 gap-4">
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                      {cls.courseCode}
                    </span>
                    <span className="text-sm text-gray-600">
                      {cls.schedule}
                    </span>
                    <span className="text-sm text-gray-600">
                      {cls.location}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium mb-2">{cls.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{cls.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Instructor: {cls.instructor}</span>
                    <span>Students: {cls.currentStudents}/{cls.maxStudents}</span>
                    <span>Prerequisites: {cls.prerequisites}</span>
                  </div>
                </div>
                <div className="ml-4">
                  {canEnroll && (
                    <button
                      onClick={() => enrollmentStatus[cls.id] ? handleUnenroll(cls.id) : handleEnroll(cls.id)}
                      className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                        enrollmentStatus[cls.id]
                          ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                          : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                      }`}
                    >
                      {enrollmentStatus[cls.id] ? 'Unenroll' : 'Enroll'}
                    </button>
                  )}
                  {canCreateClass && (
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700">
                        Edit
                      </button>
                      <button className="px-3 py-1 text-sm text-red-600 hover:text-red-700">
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

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Create New Class</h3>
            <form onSubmit={handleCreateClass}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class Title
                  </label>
                  <input
                    required
                    type="text"
                    value={newClass.title}
                    onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
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
                    onChange={(e) => setNewClass({ ...newClass, courseCode: e.target.value })}
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
                    onChange={(e) => setNewClass({ ...newClass, instructor: e.target.value })}
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
                    onChange={(e) => setNewClass({ ...newClass, schedule: e.target.value })}
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
                    onChange={(e) => setNewClass({ ...newClass, location: e.target.value })}
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
                    onChange={(e) => setNewClass({ ...newClass, maxStudents: e.target.value })}
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
                    onChange={(e) => setNewClass({ ...newClass, prerequisites: e.target.value })}
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
                    onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter class description"
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
                  Create Class
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
