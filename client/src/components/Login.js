import React, { useState, useRef } from 'react';
import Header from './Header';
import Footer from './Footer';
import { checkValidData } from '../utilis/validate';
import { Link } from 'react-router-dom';

const Login = () => {
  const [isSignInForm, setIsSignInForm] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const name = useRef(null);
  const email = useRef(null);
  const password = useRef(null);

  const handleButtonClick = () => {
    console.log(name.current?.value);
    console.log(email.current.value);
    console.log(password.current.value);

    const message = checkValidData(
      !isSignInForm ? name.current.value : '',
      email.current.value,
      password.current.value
    );
    setErrorMessage(message);
    if (message) return;

    // sign in / sign up
    if (!isSignInForm) {
      // sign up logic
    }
  };

  const toggleSignInForm = () => setIsSignInForm(!isSignInForm);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Centered Form */}
      <div className="flex justify-center items-center flex-grow px-4">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="w-full max-w-md bg-white p-8 rounded-xl shadow-md"
        >
          <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
            {isSignInForm ? 'Log in' : 'Sign up'}
          </h1>

          {!isSignInForm && (
            <input
              ref={name}
              type="text"
              placeholder="Full Name"
              className="p-3 mb-4 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          )}

          <input
            ref={email}
            type="email"
            placeholder="you@university.edu"
            className="p-3 mb-4 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          <input
            ref={password}
            type="password"
            placeholder="Password"
            className="p-3 mb-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />

          <div className="flex justify-end mb-4">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg w-full transition"
            onClick={handleButtonClick}
          >
            {isSignInForm ? 'Log in' : 'Sign up'}
          </button>

          <p className="text-red-600 font-semibold text-center mt-2">{errorMessage}</p>

          <p
            className="text-center text-gray-600 mt-4 cursor-pointer hover:underline"
            onClick={toggleSignInForm}
          >
            {isSignInForm ? (
              <>
                Don’t have an account?{' '}
                <Link to="/signup" className="text-blue-600 hover:underline">
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Log in
                </Link>
              </>
            )}
          </p>
        </form>
      </div>
        <Footer />
    </div>
      
  );
};

export default Login;
