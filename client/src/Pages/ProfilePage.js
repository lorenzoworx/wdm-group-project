import React, { useEffect, useState } from "react";
import { getUserData } from '../utilis/auth';

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    studentId: '',
    address: '',
    bio: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const currentUser = getUserData();
    if (currentUser) {
      setUserData(currentUser);
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        department: currentUser.department || '',
        studentId: currentUser.studentId || '',
        address: currentUser.address || '',
        bio: currentUser.bio || ''
      });
    }
  };

  const handleSave = () => {
    const updatedUserData = {
      ...userData,
      ...formData
    };
    
    localStorage.setItem('userData', JSON.stringify(updatedUserData));
    setUserData(updatedUserData);
    setIsEditing(false);
    
    // Also update in users list if it exists
    const users = JSON.parse(localStorage.getItem('localUsers') || '[]');
    const adminUsers = JSON.parse(localStorage.getItem('adminUsers') || '[]');
    const allUsers = [...users, ...adminUsers];
    
    const userIndex = allUsers.findIndex(u => u.email === userData.email);
    if (userIndex !== -1) {
      allUsers[userIndex] = { ...allUsers[userIndex], ...formData };
      
      if (userData.userType === 'admin' || userData.userType === 'instructor') {
        localStorage.setItem('adminUsers', JSON.stringify(allUsers.filter(u => u.userType === 'admin' || u.userType === 'instructor')));
      } else {
        localStorage.setItem('localUsers', JSON.stringify(allUsers.filter(u => u.userType === 'student' || u.userType === 'qa')));
      }
    }
    
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      department: userData.department || '',
      studentId: userData.studentId || '',
      address: userData.address || '',
      bio: userData.bio || ''
    });
    setIsEditing(false);
  };

  if (!userData) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {userData.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-6 text-white">
                <h2 className="text-2xl font-bold">{userData.name}</h2>
                <p className="text-blue-100">{userData.email}</p>
                <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-white bg-opacity-20 mt-2">
                  {userData.userType.charAt(0).toUpperCase() + userData.userType.slice(1)}
                </span>
              </div>
              <div className="ml-auto">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {userData.name || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {userData.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {userData.phone || 'Not provided'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter department"
                  />
                ) : (
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {userData.department || 'Not provided'}
                  </p>
                )}
              </div>

              {userData.userType === 'student' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student ID
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.studentId}
                      onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter student ID"
                    />
                  ) : (
                    <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                      {userData.studentId || 'Not provided'}
                    </p>
                  )}
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Enter address"
                  />
                ) : (
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {userData.address || 'Not provided'}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Tell us about yourself"
                  />
                ) : (
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">
                    {userData.bio || 'Not provided'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
