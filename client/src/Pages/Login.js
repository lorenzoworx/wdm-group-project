// Pandey, Bhumika - 1000XXXXXX
// [Teammate Last, First] - [ID]
// Login / Signup flow with PHP + MySQL API (no hardcoded bypass)
// After successful auth (ANY role), we always land on /dashboard/home

import React, { useState, useRef, useEffect } from 'react';
import {useNavigate} from 'react-router-dom';
import { checkValidData } from '../utilis/validate';
import { apiLogin, apiRegister } from '../api/auth';

const Login = () => {
  const [isSignInForm, setIsSignInForm] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const name = useRef(null);
  const email = useRef(null);
  const password = useRef(null);

  // If already logged in (token exists), go to dashboard
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) navigate('/dashboard/home');
  }, [navigate]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // ---------- 1) VALIDATION ----------
      let validationMessage = null;

      if (!isSignInForm) {
        // Sign up validation: name, email, proper password
        validationMessage = checkValidData(
            name.current?.value || '',
            email.current.value,
            password.current.value
        );
      } else {
        // Login validation: basic email/password presence
        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(email.current.value)) {
          validationMessage = 'Email ID is not valid';
        } else if (!password.current.value || password.current.value.length < 1) {
          validationMessage = 'Please enter your password';
        }
      }

      if (validationMessage) {
        setErrorMessage(validationMessage);
        setIsLoading(false);
        return;
      }

      const typedEmail = email.current.value.trim();
      const typedPassword = password.current.value;

      // ---------- 2) SIGN IN (PHP API) ----------
      if (isSignInForm) {
        // IMPORTANT: apiLogin expects (email, password), not an object
        const { token, user } = await apiLogin(typedEmail, typedPassword);

        localStorage.setItem('userToken', token);
        localStorage.setItem('userType', user.role || 'student');
        localStorage.setItem(
            'userData',
            JSON.stringify({
              name: user.name,
              email: user.email,
              userType: user.role || 'student',
            })
        );

        navigate('/dashboard/home');
        setIsLoading(false);
        return;
      }

      // ---------- 3) SIGN UP (PHP API) ----------
      if (!isSignInForm) {
        const fullName = (name.current.value || '').trim();

        const { token, user } = await apiRegister({
          name: fullName,
          email: typedEmail,
          password: typedPassword,
        });

        localStorage.setItem('userToken', token);
        localStorage.setItem('userType', user.role || 'student');
        localStorage.setItem(
            'userData',
            JSON.stringify({
              name: user.name,
              email: user.email,
              userType: user.role || 'student',
            })
        );

        navigate('/dashboard/home');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      // Try to show a helpful message if the API sent text/JSON
      let msg = err?.message || 'Something went wrong';
      try {
        const parsed = JSON.parse(msg);
        if (parsed?.error) msg = parsed.error;
      } catch {}
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="flex justify-center items-center min-h-[80vh] bg-gray-50">
        <div className="flex justify-center items-center flex-grow px-4">
          <form
              onSubmit={handleFormSubmit}
              className="w-full max-w-md bg-white p-8 rounded-xl shadow-md"
          >
            <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
              {isSignInForm ? 'Log in' : 'Sign up'}
            </h1>

            {/* SIGN UP: Show "Full Name" */}
            {!isSignInForm && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Full Name
                  </label>
                  <input
                      ref={name}
                      type="text"
                      placeholder="Enter your full name"
                      className="p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      disabled={isLoading}
                      required
                  />
                </div>
            )}

            {/* EMAIL FIELD */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                  ref={email}
                  type="email"
                  placeholder="you@university.edu"
                  className="p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={isLoading}
                  required
              />
            </div>

            {/* PASSWORD FIELD */}
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                  ref={password}
                  type="password"
                  placeholder="Enter your password"
                  className="p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={isLoading}
                  required
              />
            </div>

            {/* ERROR MESSAGE */}
            {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                  {errorMessage}
                </div>
            )}

            {/* SUBMIT BUTTON */}
            <button
                type="submit"
                className={`w-full p-3 rounded-lg text-white font-medium ${
                    isLoading
                        ? 'bg-blue-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                } transition`}
                disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : isSignInForm ? 'Log in' : 'Sign up'}
            </button>

            {/* TOGGLE SIGN IN / SIGN UP */}
            {/* TOGGLE SIGN IN / SIGN UP */}
            <p className="text-center text-gray-600 mt-4">
              {isSignInForm ? (
                  <>
                    Don’t have an account?{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/signup')}
                        className="text-blue-600 hover:underline font-medium"
                        role="link"
                    >
                      Sign up
                    </button>
                  </>
              ) : (
                  <>
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="text-blue-600 hover:underline font-medium"
                        role="link"
                    >
                      Log in
                    </button>
                  </>
              )}
            </p>

          </form>
        </div>
      </div>
  );
};

export default Login;
