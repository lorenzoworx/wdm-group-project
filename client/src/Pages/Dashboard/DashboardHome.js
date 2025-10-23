import React from "react";

const DashboardHome = () => {
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Welcome Banner */}
      <div className="bg-blue-100 p-6 rounded-2xl mb-8">
        <h2 className="text-xl font-semibold text-gray-800">Welcome back!</h2>
        <p className="text-gray-600">
          Here’s what’s happening on campus today.
        </p>
      </div>

      {/* Featured Events + Announcements */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Featured Events */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Featured Events
            </h3>
            <div className="flex space-x-2 text-sm">
              <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-200">
                Today
              </button>
              <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-200">
                This Week
              </button>
              <button className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-200">
                This Month
              </button>
            </div>
          </div>

          <div className="flex space-x-4">
            {/* Event Card 1 */}
            <div className="border rounded-xl p-4 w-1/3 hover:shadow-md transition">
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                Class
              </span>
              <h4 className="font-medium mt-2 text-gray-800">
                Web Data Management — Lecture
              </h4>
              <p className="text-sm text-gray-500">
                Sep 18, 2–3:15 PM • ERB 130
              </p>
              <p className="text-xs text-gray-400">
                Week 4 topics and exercises.
              </p>
              <button className="text-blue-600 text-sm mt-2 hover:underline">
                Attend
              </button>
            </div>

            {/* Event Card 2 */}
            <div className="border rounded-xl p-4 w-1/3 hover:shadow-md transition">
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                Quiz
              </span>
              <h4 className="font-medium mt-2 text-gray-800">
                Quiz 1 — ER Modeling
              </h4>
              <p className="text-sm text-gray-500">
                Sep 20, 3–3:20 PM • ERB 130
              </p>
              <p className="text-xs text-gray-400">
                Short in-class quiz on ER fundamentals.
              </p>
              <button className="text-blue-600 text-sm mt-2 hover:underline">
                Remind me
              </button>
            </div>

            {/* Event Card 3 */}
            <div className="border rounded-xl p-4 w-1/3 hover:shadow-md transition">
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                Final
              </span>
              <h4 className="font-medium mt-2 text-gray-800">Final Exam</h4>
              <p className="text-sm text-gray-500">
                Dec 10, 1–3 PM • Main Hall
              </p>
              <p className="text-xs text-gray-400">
                Comprehensive assessment — good luck!
              </p>
              <button className="text-blue-600 text-sm mt-2 hover:underline">
                Add to calendar
              </button>
            </div>
          </div>
        </div>

        {/* Latest Announcements */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Latest Announcements
            </h3>
            <button className="text-blue-600 text-sm hover:underline">
              View all
            </button>
          </div>

          <ul className="text-sm text-gray-700 space-y-3">
            <li>
              <p className="font-semibold text-gray-900">
                Class rescheduled: Math 101
              </p>
              <span className="text-xs text-gray-400">Sep 12</span>
            </li>
            <li>
              <p className="font-semibold text-gray-900">
                Assignment deadline extended
              </p>
              <span className="text-xs text-gray-400">Sep 11</span>
            </li>
            <li>
              <p className="font-semibold text-gray-900">
                Campus closed: Holiday
              </p>
              <span className="text-xs text-gray-400">Sep 10</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Grades, Files, Messages */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Grades */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <div className="flex justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Grades</h3>
            <button className="text-blue-600 text-sm hover:underline">
              View all
            </button>
          </div>
          <div className="space-y-3 text-gray-700 text-sm">
            <div className="flex justify-between">
              <span>CS5335 • Quiz 1</span>
              <span className="font-medium">92%</span>
            </div>
            <div className="flex justify-between">
              <span>CS5335 • Project 1</span>
              <span className="font-medium">A−</span>
            </div>
            <div className="flex justify-between">
              <span>MATH101 • Midterm</span>
              <span className="font-medium">B+</span>
            </div>
          </div>
        </div>

        {/* Files */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <div className="flex justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Files</h3>
            <button className="text-blue-600 text-sm hover:underline">
              Open files
            </button>
          </div>
          <ul className="text-sm space-y-2 text-gray-700">
            <li>
              <span className="mr-1">📄</span> ER-Modeling-StudyGuide.pdf{" "}
              <span className="text-gray-400 text-xs">1.2 MB</span>
            </li>
            <li>
              <span className="mr-1">🧾</span> Calculus_Week3_Notes.docx{" "}
              <span className="text-gray-400 text-xs">350 KB</span>
            </li>
            <li>
              <span className="mr-1">🗜️</span> Quiz1_Solutions.zip{" "}
              <span className="text-gray-400 text-xs">2.4 MB</span>
            </li>
          </ul>
        </div>

        {/* Messages */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <div className="flex justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Messages</h3>
            <button className="text-blue-600 text-sm hover:underline">
              Open inbox
            </button>
          </div>
          <ul className="text-sm space-y-3 text-gray-700">
            <li>
              <p className="font-semibold text-gray-900">Dr. Smith</p>
              <span className="text-xs text-gray-500">
                Reminder: Quiz 1 format & allowed materials
              </span>
            </li>
            <li>
              <p className="font-semibold text-gray-900">TA • Maria</p>
              <span className="text-xs text-gray-500">
                Office hours moved to Thursday
              </span>
            </li>
            <li>
              <p className="font-semibold text-gray-900">Career Services</p>
              <span className="text-xs text-gray-500">
                Resume workshop slides & next steps
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom 3 Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow text-center hover:shadow-md transition">
          <h4 className="font-medium text-gray-800 mb-1">Resources</h4>
          <p className="text-gray-500 text-sm">Find files, links & guides.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow text-center hover:shadow-md transition">
          <h4 className="font-medium text-gray-800 mb-1">Profile</h4>
          <p className="text-gray-500 text-sm">Manage settings & RSVPs.</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow text-center hover:shadow-md transition">
          <h4 className="font-medium text-gray-800 mb-1">Help (AI)</h4>
          <p className="text-gray-500 text-sm">
            Chat with AI for quick assistance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
