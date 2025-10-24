import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getUserType, logoutUser, getUserData } from '../utilis/auth';

const DashboardHeader = () => {
  const navigate = useNavigate();
  const userType = getUserType() || 'student';
  const userData = getUserData();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logoutUser();
    alert("You have been logged out.");
    navigate("/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Role-based navigation items
  const getNavigationItems = () => {
    const baseItems = [
      { to: "/dashboard/home", label: "Home" },
      { to: "/dashboard/classes", label: "Classes" },
      { to: "/dashboard/events", label: "Events" },
      { to: "/dashboard/exams", label: "Exams" },
      { to: "/dashboard/announcements", label: "Announcements" },
      { to: "/dashboard/resources", label: "Resources" },
      { to: "/dashboard/profile", label: "Profile" }
    ];

    // Add role-specific tabs
    if (userType === 'admin') {
      baseItems.splice(1, 0, { to: "/dashboard/admin", label: "Admin Dashboard" });
      baseItems.push({ to: "/dashboard/users", label: "Users" });
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold text-blue-600">
        Campus Resource Portal
      </h1>

      {/* Navigation Buttons */}
      <nav className="flex space-x-4">
        {navigationItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Search + Profile Dropdown */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search events or announcements"
          className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-lg transition"
          >
            <img
              src="https://www.svgrepo.com/show/452030/avatar-default.svg"
              alt="Profile"
              className="w-8 h-8 rounded-full border"
            />
            <span className="text-sm text-gray-700">{userData?.name || 'User'}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <div className="font-medium">{userData?.name || 'User'}</div>
                  <div className="text-gray-500">{userData?.email || ''}</div>
                </div>
                <Link
                  to="/dashboard/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  Profile Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;