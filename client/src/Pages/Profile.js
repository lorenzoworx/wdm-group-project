import React, { useState } from 'react';

const Profile = () => {
  const [profile, setProfile] = useState({
    fullName: 'Alex Student',
    email: 'alex@student.edu',
    phone: '(555) 123-4567',
    studentId: '1234567',
    major: 'Computer Science',
    classification: 'Senior',
    emailNotifications: true,
    smsNotifications: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToggleChange = (pref) => {
    setProfile(prev => ({
      ...prev,
      [pref]: !prev[pref]
    }));
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('userProfile', JSON.stringify(profile));
      setMessage({ text: 'Changes saved successfully!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to save changes. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Profile Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-gray-50"
                    value={profile.studentId}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={profile.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={profile.phone}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Academic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Major
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-gray-50"
                    value={profile.major}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Classification
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded bg-gray-50"
                    value={profile.classification}
                    disabled
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-500">Receive updates about events and announcements</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={profile.emailNotifications}
                      onChange={() => handleToggleChange('emailNotifications')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">SMS Notifications</h3>
                    <p className="text-sm text-gray-500">Get text messages for important updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={profile.smsNotifications}
                      onChange={() => handleToggleChange('smsNotifications')}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Account Actions</h2>
              <div className="space-y-3">
                <button 
                  className={`w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={handleSaveChanges}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button className="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Change Password
                </button>
                {message.text && (
                  <div className={`mt-2 p-2 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Connected Accounts</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    <div>
                      <div className="font-medium">GitHub</div>
                      <div className="text-sm text-gray-500">Connected</div>
                    </div>
                  </div>
                  <button className="text-sm text-red-600 hover:text-red-700">
                    Disconnect
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 8.973a4.485 4.485 0 0 1 2.366-1.973V12.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 8.973zm16.597 3.855l-5.833-3.387L15.119 8.27a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.157v-5.604a.79.79 0 0 0-.407-.786zm2.127-3.546a4.47 4.47 0 0 1 .538 3.014l-.142-.085-4.779-2.759a.776.776 0 0 0-.784 0L10.07 12.82v-2.332a.08.08 0 0 1 .033-.062l4.84-2.791a4.5 4.5 0 0 1 6.121 1.647zm-12.96 3.378L10.123 11l2.020-1.168a.071.071 0 0 1 .071 0l5.819 3.359v2.336a.075.075 0 0 1-.033.062L13.18 17.38zm-1.248-2.659l-2.02-1.173a.075.075 0 0 1-.038-.057V3.2a4.5 4.5 0 0 1 7.375-3.453l-.142.081-4.778 2.758a.795.795 0 0 0-.393.681zm1.069-3.697l5.833-3.369a.776.776 0 0 0 .784 0l5.839 3.369v6.733L13.933 11l-5.833-3.369z"/>
                    </svg>
                    <div>
                      <div className="font-medium">Discord</div>
                      <div className="text-sm text-gray-500">Not connected</div>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Connect
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
