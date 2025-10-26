// Pandey, Bhumika - 1000XXXXXX
// [Teammate Last, First] - [ID]
// Login / Signup flow with localStorage auth
// After successful auth (ANY role), we always land on /dashboard/home

import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkValidData } from '../utilis/validate';

const Login = () => {
  const [isSignInForm, setIsSignInForm] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const name = useRef(null);
  const email = useRef(null);
  const password = useRef(null);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // ---------- 1. VALIDATION ----------
      let validationMessage = null;

      if (!isSignInForm) {
        // Sign up validation: name, email, proper password
        validationMessage = checkValidData(
            name.current?.value || '',
            email.current.value,
            password.current.value
        );
      } else {
        // Login validation: just make sure email looks like an email and password exists
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

      const typedEmail = email.current.value;
      const typedPassword = password.current.value;

      // ---------- 2. SPECIAL ADMIN LOGIN ----------
      // You have a hardcoded admin credential; keep it so you can demo the admin role.
      if (
          isSignInForm &&
          typedEmail === 'admin@uta.edu' &&
          typedPassword === 'Myproject@123'
      ) {
        // Save session info in localStorage
        localStorage.setItem('userToken', 'admin-token');
        localStorage.setItem('userType', 'admin');
        localStorage.setItem(
            'userData',
            JSON.stringify({
              name: 'Admin',
              email: 'admin@uta.edu',
              userType: 'admin',
            })
        );

        // IMPORTANT CHANGE:
        // No matter what role -> go to /dashboard/home
        navigate('/dashboard/home');
        return;
      }

      // ---------- 3. SIGN IN FLOW (non-admin) ----------
      if (isSignInForm) {
        // look up saved users in localStorage
        const users = JSON.parse(localStorage.getItem('localUsers') || '[]');

        const foundUser = users.find(
            (u) => u.email === typedEmail && u.password === typedPassword
        );

        if (foundUser) {
          // set session
          localStorage.setItem('userToken', 'user-token');
          localStorage.setItem('userType', foundUser.userType);
          localStorage.setItem(
              'userData',
              JSON.stringify({
                name: foundUser.name,
                email: foundUser.email,
                userType: foundUser.userType,
              })
          );

          // ALWAYS GO TO /dashboard/home
          navigate('/dashboard/home');
        } else {
          setErrorMessage('Invalid email or password');
        }

        setIsLoading(false);
        return;
      }

      // ---------- 4. SIGN UP FLOW ----------
      // Any new registered user becomes a "student" userType by default.
      if (!isSignInForm) {
        const users = JSON.parse(localStorage.getItem('localUsers') || '[]');
        const exists = users.find((u) => u.email === typedEmail);

        if (exists) {
          setErrorMessage('User already exists. Please login.');
          setIsLoading(false);
          return;
        }

        // Create the new local user
        const newUser = {
          name: name.current.value,
          email: typedEmail,
          password: typedPassword,
          userType: 'student',
        };

        users.push(newUser);
        localStorage.setItem('localUsers', JSON.stringify(users));

        // "Log them in" immediately after sign up
        localStorage.setItem('userToken', 'user-token');
        localStorage.setItem('userType', 'student');
        localStorage.setItem(
            'userData',
            JSON.stringify({
              name: newUser.name,
              email: newUser.email,
              userType: 'student',
            })
        );

        // AGAIN: ALWAYS GO TO /dashboard/home AFTER SIGNUP
        navigate('/dashboard/home');
        setIsLoading(false);
        return;
      }
    } catch (err) {
      setErrorMessage(err.message || 'Something went wrong');
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
              {isLoading
                  ? 'Please wait...'
                  : isSignInForm
                      ? 'Log in'
                      : 'Sign up'}
            </button>

            {/* TOGGLE SIGN IN / SIGN UP */}
            <p className="text-center text-gray-600 mt-4">
              {isSignInForm ? (
                  <>
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={() => setIsSignInForm(false)}
                        className="text-blue-600 hover:underline"
                        disabled={isLoading}
                    >
                      Sign up
                    </button>
                  </>
              ) : (
                  <>
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={() => setIsSignInForm(true)}
                        className="text-blue-600 hover:underline"
                        disabled={isLoading}
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
