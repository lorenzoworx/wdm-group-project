// src/Pages/Signup.js
import React, {useEffect, useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { checkValidData } from '../utilis/validate';
import { apiRegister } from '../api/auth';

const Signup = () => {
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    console.log('[Signup] mounted at', window.location.pathname, 'token:', token);
    return () => console.log('[Signup] unmounted');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    const fullName = (nameRef.current?.value || '').trim();
    const email = (emailRef.current?.value || '').trim();
    const password = passwordRef.current?.value || '';

    const validation = checkValidData(fullName, email, password);
    if (validation) {
      setErrorMessage(validation);
      setIsLoading(false);
      return;
    }

    try {
      const { token, user } = await apiRegister({ name: fullName, email, password });
      // store token and user
      localStorage.setItem('userToken', token);
      localStorage.setItem('userType', user.role || 'student');
      localStorage.setItem('userData', JSON.stringify({ name: user.name, email: user.email, userType: user.role || 'student' }));
      navigate('/dashboard/home');
    } catch (err) {
      let msg = err?.message || 'Registration failed';
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
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
            <input ref={nameRef} type="text" placeholder="Enter your full name" className="p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" disabled={isLoading} required />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input ref={emailRef} type="email" placeholder="you@university.edu" className="p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" disabled={isLoading} required />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input ref={passwordRef} type="password" placeholder="Enter your password" className="p-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" disabled={isLoading} required />
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{errorMessage}</div>
          )}

          <button type="submit" className={`w-full p-3 rounded-lg text-white font-medium ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition`} disabled={isLoading}>
            {isLoading ? 'Please wait...' : 'Sign up'}
          </button>

          <p className="text-center text-gray-600 mt-4">
            Already have an account?{' '}
            <button type="button" onClick={() => navigate('/')} className="text-blue-600 hover:underline">Log in</button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
