import React from 'react';

const Contact = () => {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]"> {/* Adjust min-h based on header/footer height */}
      <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-sm w-full">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
        <div className="text-gray-700 space-y-2">
          <p>
            <span className="font-medium">Name:</span> John Doe (Officer)
          </p>
          <p>
            <span className="font-medium">Phone:</span> (555) 123-4567
          </p>
          <p>
            <span className="font-medium">Email:</span> john.doe@university.edu
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;