import React from 'react';

const About = () => {
  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]"> {/* Adjust min-h based on header/footer height */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 text-center">
        Campus Resource Portal
      </h1>
    </div>
  );
};

export default About;