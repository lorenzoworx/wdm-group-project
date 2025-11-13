import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MessageBoard from "../MessageBoard";

const StudentHomepage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/data/studentData.json') //
      .then(res => res.json()) //
      .then(json => setData(json)) //
      .catch(error => console.error('Error loading data:', error)); //
  }, []); //

  if (!data) return <div className="p-6">Loading...</div>; //

  return (
    <div className="min-h-screen bg-gray-50"> {/* */}
      <div className="page-container py-6"> {/* */}
        {/* Welcome Section */}
        <MessageBoard />
        <div className="mb-8"> {/* */}
          <h1 className="text-2xl font-semibold text-gray-900">Welcome back!</h1> {/* */}
          <p className="text-gray-600 mt-1">Here's what's happening on campus today.</p> {/* */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"> {/* */}
          {/* Main Content - Featured Events & Announcements */}
          <div className="lg:col-span-2 space-y-6"> {/* */}
            {/* Featured Events */}
            <div> {/* */}
              <div className="flex items-center justify-between mb-4"> {/* */}
                <h2 className="text-xl font-semibold text-gray-900">Featured Events</h2> {/* */}
                <div className="flex space-x-4"> {/* */}
                  <button className="text-sm text-gray-600 hover:text-gray-900">Today</button> {/* */}
                  <button className="text-sm text-gray-600 hover:text-gray-900">This Week</button> {/* */}
                  <button className="text-sm text-gray-600 hover:text-gray-900">This Month</button> {/* */}
                </div>
              </div>

              <div className="space-y-4"> {/* */}
                {data.featuredEvents.map((event, index) => ( //
                  <div key={index} className="bg-white rounded-lg shadow p-4"> {/* */}
                    <div className="flex items-start justify-between responsive-row"> {/* */}
                      <div> {/* */}
                        <span className={`badge ${
                          event.type === 'Class' ? 'bg-blue-100 text-blue-800' :
                          event.type === 'Quiz' ? 'bg-yellow-100 text-yellow-800' :
                          event.type === 'Final' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'}
                        `}>
                          {event.type} • {event.course} {/* */}
                        </span>
                        <h3 className="mt-2 font-medium text-gray-900">{event.title}</h3> {/* */}
                        <p className="text-sm text-gray-500 mt-1"> {/* */}
                          {event.date}, {event.time} • {event.location} {/* */}
                        </p>
                      </div>
                      <div className="mt-3 sm:mt-0">{
                        /* Ensure the button moves below on small screens */
                        }
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">{event.buttonText}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Announcements */}
            <div> {/* */}
              <div className="flex items-center justify-between mb-4"> {/* */}
                <h2 className="text-xl font-semibold text-gray-900">Latest Announcements</h2> {/* */}
                <Link to="/dashboard/announcements" className="text-sm text-blue-600 hover:text-blue-700">View all</Link> {/* */}
              </div>
              <div className="space-y-4"> {/* */}
                {data.announcements.map((announcement, index) => (
                  <div key={index} className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between responsive-row">
                      <div>
                        <span className="badge bg-gray-100 text-gray-800">{announcement.course}</span>
                        <h3 className="mt-1 text-gray-900">{announcement.subject}</h3>
                      </div>
                      <span className="text-sm text-gray-500 mt-2 sm:mt-0">{announcement.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6"> {/* */}
            {/* Grades Section */}
            <div className="bg-white rounded-lg shadow p-4"> {/* */}
              <div className="flex items-center justify-between mb-4"> {/* */}
                <h2 className="text-lg font-semibold text-gray-900">Grades</h2> {/* */}
                <Link to="/grades" className="text-sm text-blue-600 hover:text-blue-700">View all</Link> {/* */}
              </div>
              <div className="space-y-3"> {/* */}
                {data.grades.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between responsive-row">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{grade.course} • {grade.name}</p>
                    </div>
                    <span className="text-sm text-gray-600 mt-2 sm:mt-0">{grade.score}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Files Section */}
            <div className="bg-white rounded-lg shadow p-4"> {/* */}
              <div className="flex items-center justify-between mb-4"> {/* */}
                <h2 className="text-lg font-semibold text-gray-900">Files</h2> {/* */}
                <button className="text-sm text-blue-600 hover:text-blue-700">Open Files</button> {/* */}
              </div>
              <div className="space-y-3"> {/* */}
                {data.files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between responsive-row">
                    <div className="flex items-center">
                      <span className={`mr-2 p-1 rounded ${file.type === 'PDF' ? 'bg-red-100' : 'bg-blue-100'}`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 break-words">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.size}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages Section */}
            <div className="bg-white rounded-lg shadow p-4"> {/* */}
              <div className="flex items-center justify-between mb-4"> {/* */}
                <h2 className="text-lg font-semibold text-gray-900">Messages</h2> {/* */}
                <button className="text-sm text-blue-600 hover:text-blue-700">Open Inbox</button> {/* */}
              </div>
              <div className="space-y-3"> {/* */}
                {data.messages.map((message, index) => ( //
                  <div key={index} className="flex items-center justify-between"> {/* */}
                    <div> {/* */}
                      <p className="text-sm font-medium text-gray-900">{message.sender}</p> {/* */}
                      <p className="text-xs text-gray-500">{message.message}</p> {/* */}
                    </div>
                    <span className="text-xs text-gray-500">{message.time}</span> {/* */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentHomepage; //
