// src/Pages/Signup.js
import React from 'react';

const Signup = () => {
  // You can copy and adapt the form structure from your Login.js
  // Make sure it includes fields like Name, Email, Password, User Type
  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Sign Up
        </h1>
        {/* Add your signup form fields here */}
        <p className="text-center mt-4">Form fields go here...</p>
         {/* Link back to login */}
         <p className="text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <a href="/" className="text-blue-600 hover:underline"> {/* Or use Link from react-router-dom */}
                Log in
            </a>
        </p>
      </div>
    </div>
  );
};

export default Signup; 