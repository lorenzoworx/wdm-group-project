// Pandey, Bhumika - 1000XXXXXX
// [Teammate Last, First] - [ID]
// Header layout + responsive nav/search/profile bar
// Accessibility: aria-labels, focus rings
// This version keeps nav + search + profile on the same row on desktop.

import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { getUserType, getUserData } from "../utilis/auth";
import { signOutUser } from "../firebase";   // <-- new


const DashboardHeader = () => {
  const navigate = useNavigate();
  const userType = getUserType() || "student";
  const userData = getUserData();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      // sign out from Firebase
      await signOutUser();

      // clear any local session data your app uses
      localStorage.removeItem('userToken');
      localStorage.removeItem('userType');
      localStorage.removeItem('userData');

      setShowProfileDropdown(false);   // close the dropdown if open
      alert("You have been logged out.");

      // send them to the login page (or "/" if that's your login route)
      navigate("/login");
    } catch (e) {
      console.error(e);
      alert("Sign out failed. Please try again.");
    }
  };


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close mobile nav on resize to larger screens
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMobileNavOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
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
      { to: "/dashboard/profile", label: "Profile" },
    ];

    if (userType === "admin") {
      // insert "Admin Dashboard" after Home
      baseItems.splice(1, 0, {
        to: "/dashboard/admin",
        label: "Admin Dashboard",
      });
      // add Users tab to the end
      baseItems.push({ to: "/dashboard/users", label: "Users" });
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
      <>
        <header className="bg-white shadow-md">
          {/*
          Container:
          - On mobile: column
          - On md+: row with brand on the left, nav+search+profile on the right
          
          We're NOT using your .page-container here because that class limits width
          to 1100px. Instead we give it more breathing room with Tailwind:
          max-w-screen-xl keeps things from stretching edge-to-edge on giant monitors
          but is wider than 1100px.
        */}
          <div className="mx-auto w-full max-w-screen-xl px-4 py-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

            {/* LEFT SIDE: Brand + mobile menu toggle */}
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-blue-600">
                Campus Resource Portal
              </h1>

              {/* Hamburger only on mobile */}
              <div className="md:hidden">
                <button
                    onClick={() => setMobileNavOpen((s) => !s)}
                    aria-label="Toggle navigation menu"
                    aria-expanded={mobileNavOpen}
                    className="p-2 rounded-md text-blue-600 hover:bg-blue-50"
                >
                  {mobileNavOpen ? (
                      // X icon
                      <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                      >
                        <path
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                  ) : (
                      // Hamburger icon
                      <svg
                          className="w-6 h-6"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                      >
                        <path
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT SIDE: nav links + search + profile (desktop layout) */}
            {/* On mobile, this whole block is hidden because we show a stacked menu below instead */}
            <div className="hidden md:flex md:flex-row md:flex-wrap md:items-center md:justify-end w-full gap-3">
              {/* NAV LINKS (desktop only) */}
              <nav className="flex flex-wrap items-center gap-2">
                {navigationItems.map((item) => (
                    <Link
                        key={item.to}
                        to={item.to}
                        className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md hover:bg-blue-200 transition text-sm"
                    >
                      {item.label}
                    </Link>
                ))}
              </nav>

              {/* SEARCH + PROFILE */}
              <div className="flex items-center flex-shrink-0 gap-3 md:ml-4">
                <input
                    type="text"
                    placeholder="Search events or announcements"
                    aria-label="Search events or announcements"
                    className="border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />

                <div className="relative" ref={dropdownRef}>
                  <button
                      onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                      className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-md transition"
                      aria-haspopup="menu"
                      aria-expanded={showProfileDropdown}
                  >
                    <img
                        src="https://www.svgrepo.com/show/452030/avatar-default.svg"
                        alt="Profile avatar"
                        className="w-8 h-8 rounded-full border"
                    />
                    <span className="text-sm text-gray-700">
                    {userData?.name || "User"}
                  </span>
                    <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {showProfileDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                        <div className="py-1">
                          <div className="px-4 py-2 text-sm text-gray-700 border-b">
                            <div className="font-medium">
                              {userData?.name || "User"}
                            </div>
                            <div className="text-gray-500">
                              {userData?.email || ""}
                            </div>
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
            </div>

          </div>
        </header>

        {/* MOBILE NAV MENU (below header, only when hamburger is open) */}
        <div
            className={`md:hidden ${mobileNavOpen ? "block" : "hidden"} border-t`}
        >
          <div className="px-4 py-3 space-y-2">
            {navigationItems.map((item) => (
                <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileNavOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                >
                  {item.label}
                </Link>
            ))}

            {/* search + profile also available in mobile menu for completeness */}
            <div className="pt-3 border-t">
              <input
                  type="text"
                  placeholder="Search events or announcements"
                  aria-label="Search events or announcements"
                  className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm mb-3"
              />

              <div className="flex items-center gap-2">
                <img
                    src="https://www.svgrepo.com/show/452030/avatar-default.svg"
                    alt="Profile avatar"
                    className="w-8 h-8 rounded-full border"
                />
                <div className="text-sm">
                  <div className="font-medium text-gray-700">
                    {userData?.name || "User"}
                  </div>
                  <div className="text-gray-500 text-xs">
                    {userData?.email || ""}
                  </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-xs text-red-600 ml-auto underline"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
  );
};

export default DashboardHeader;
