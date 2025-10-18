import React from "react";
import { Link } from "react-router-dom";

const LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"; // sample logo

const Header = () => {
  return (
    <div className="flex justify-between items-center px-8 py-3 bg-white shadow-sm border-b">
      {/* Left - Logo and Name */}
      <div className="flex items-center space-x-3">
        <img className="w-8 h-8" src={LOGO_URL} alt="Logo" />
        <span className="text-gray-800 font-semibold text-lg">Campus Resource Portal</span>
      </div>

      {/* Right - Navigation */}
      <div className="flex items-center space-x-6 text-gray-600 font-medium">
        <Link to="/about" className="hover:text-gray-900">
          About
        </Link>
        <Link to="/contact" className="hover:text-gray-900">
          Contact
        </Link>
        <Link
         to="/signup"
          className="px-4 py-1.5 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition"
        >
          Sign up
        </Link>

      </div>
    </div>
  );
};

export default Header;
