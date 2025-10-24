import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <div className="bg-white text-center text-sm text-gray-500 py-6">
      <div className="flex justify-center space-x-6 mb-2">
        <Link to="/accessibility" className="hover:underline">
          Accessibility
        </Link>
        <Link to="/privacy" className="hover:underline">
          Privacy
        </Link>
        <Link to="/terms" className="hover:underline">
          Terms
        </Link>
      </div>
      <p>© 2025 Campus Resource Portal. All rights reserved.</p>
    </div>
  );
};

export default Footer;
