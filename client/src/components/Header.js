import React, { useState } from "react";
import { Link } from "react-router-dom";

const LOGO_URL =
    "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"; // sample logo

const Header = () => {
    const [open, setOpen] = useState(false);

    return (
        <header className="bg-white shadow-sm border-b">
            {/* Top bar */}
            <div className="mx-auto w-full max-w-screen-xl px-4 py-3 flex items-center justify-between">
                {/* Brand */}
                <div className="flex items-center gap-3">
                    <img className="w-8 h-8" src={LOGO_URL} alt="Logo" />
                    <span className="text-gray-800 font-semibold text-lg leading-tight">
            Campus Resource Portal
          </span>
                </div>

                {/* Mobile menu button */}
                <button
                    type="button"
                    className="sm:hidden p-2 rounded-md hover:bg-gray-100"
                    aria-label="Toggle menu"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                >
                    {open ? (
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

                {/* Desktop nav */}
                <nav className="hidden sm:flex items-center gap-6 text-gray-600 font-medium">
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
                </nav>
            </div>

            {/* Mobile nav (collapsible) */}
            {open && (
                <div className="sm:hidden border-t">
                    <nav className="px-4 py-3 flex flex-col gap-2 text-gray-700">
                        <Link
                            to="/about"
                            className="py-2 hover:text-blue-600"
                            onClick={() => setOpen(false)}
                        >
                            About
                        </Link>
                        <Link
                            to="/contact"
                            className="py-2 hover:text-blue-600"
                            onClick={() => setOpen(false)}
                        >
                            Contact
                        </Link>
                        <Link
                            to="/signup"
                            className="mt-2 w-full text-center px-3 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 transition"
                            onClick={() => setOpen(false)}
                        >
                            Sign up
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
};

export default Header;
