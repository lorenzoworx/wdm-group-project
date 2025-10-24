// src/Pages/DashboardHome.js
import React from 'react';

// Define the component function
const DashboardHome = () => {
  // Add content for the general dashboard landing page
  // This could show different summaries based on user type later,
  // but for now, a simple welcome is fine.
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard Home</h1>
      <p className="mt-2 text-gray-600">
        Welcome! Please select an option from the navigation bar.
      </p>
      {/* You could add links or cards here */}
    </div>
  );
};

// Export the component as the default export
export default DashboardHome;