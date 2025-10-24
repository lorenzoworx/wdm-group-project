// // // import React, { useState, useRef } from 'react';
// // // import { checkValidData } from '../utilis/validate';
// // // import { Link } from 'react-router-dom';

// // // const Login = () => {
// // //   const [isSignInForm, setIsSignInForm] = useState(true);
// // //   const [errorMessage, setErrorMessage] = useState(null);

// // //   const name = useRef(null);
// // //   const email = useRef(null);
// // //   const password = useRef(null);

// // //   const handleButtonClick = () => {
// // //     console.log(name.current?.value);
// // //     console.log(email.current.value);
// // //     console.log(password.current.value);

// // //     const message = checkValidData(
// // //       !isSignInForm ? name.current.value : '',
// // //       email.current.value,
// // //       password.current.value
// // //     );
// // //     setErrorMessage(message);
// // //     if (message) return;

// // //     // sign in / sign up
// // //     if (!isSignInForm) {
// // //       // sign up logic
// // //     }
// // //   };

// // //   const toggleSignInForm = () => setIsSignInForm(!isSignInForm);

// // //   return (
// // //     <div className="flex justify-center items-center min-h-[80vh] bg-gray-50">
           
// // //       <div className="flex justify-center items-center flex-grow px-4">
// // //         <form
// // //           onSubmit={(e) => e.preventDefault()}
// // //           className="w-full max-w-md bg-white p-8 rounded-xl shadow-md"
// // //         >
// // //           <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
// // //             {isSignInForm ? 'Log in' : 'Sign up'}
// // //           </h1>

// // //           {!isSignInForm && (
// // //             <input
// // //               ref={name}
// // //               type="text"
// // //               placeholder="Full Name"
// // //               className="p-3 mb-4 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
// // //             />
// // //           )}

// // //           <input
// // //             ref={email}
// // //             type="email"
// // //             placeholder="you@university.edu"
// // //             className="p-3 mb-4 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
// // //           />

// // //           <input
// // //             ref={password}
// // //             type="password"
// // //             placeholder="Password"
// // //             className="p-3 mb-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
// // //           />

// // //           <div className="flex justify-end mb-4">
// // //             <Link
// // //               to="/forgot-password"
// // //               className="text-sm text-blue-600 hover:underline"
// // //             >
// // //               Forgot password?
// // //             </Link>
// // //           </div>

// // //           <button
// // //             className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg w-full transition"
// // //             onClick={handleButtonClick}
// // //           >
// // //             {isSignInForm ? 'Log in' : 'Sign up'}
// // //           </button>

// // //           <p className="text-red-600 font-semibold text-center mt-2">{errorMessage}</p>

// // //           <p
// // //             className="text-center text-gray-600 mt-4 cursor-pointer hover:underline"
// // //             onClick={toggleSignInForm}
// // //           >
// // //             {isSignInForm ? (
// // //               <>
// // //                 Don’t have an account?{' '}
// // //                 <Link to="/signup" className="text-blue-600 hover:underline">
// // //                   Sign up
// // //                 </Link>
// // //               </>
// // //             ) : (
// // //               <>
// // //                 Already have an account?{' '}
// // //                 <Link to="/login" className="text-blue-600 hover:underline">
// // //                   Log in
// // //                 </Link>
// // //               </>
// // //             )}
// // //           </p>
// // //         </form>
// // //       </div>
      
// // //     </div>
      
// // //   );
// // // };

// // // export default Login;

// // import React, { useState, useRef } from 'react';
// // import { checkValidData } from '../utilis/validate';
// // import { Link, useNavigate } from 'react-router-dom';

// // const Login = () => {
// //   const [isSignInForm, setIsSignInForm] = useState(true);
// //   const [errorMessage, setErrorMessage] = useState(null);

// //   const name = useRef(null);
// //   const email = useRef(null);
// //   const password = useRef(null);
// //   const navigate = useNavigate();

// //   const handleButtonClick = () => {
// //     const message = checkValidData(
// //       !isSignInForm ? name.current?.value : '',
// //       email.current.value,
// //       password.current.value
// //     );
// //     setErrorMessage(message);
// //     if (message) return;

// //     const userEmail = email.current.value.trim();
// //     const userPassword = password.current.value.trim();

// //     // ✅ Sign Up logic
// //     if (!isSignInForm) {
// //       const existingUser = localStorage.getItem('user');
// //       if (existingUser) {
// //         setErrorMessage('User already exists. Please log in.');
// //         return;
// //       }

// //       // Save user details
// //       const newUser = {
// //         name: name.current.value.trim(),
// //         email: userEmail,
// //         password: userPassword,
// //       };
// //       localStorage.setItem('user', JSON.stringify(newUser));
// //       alert('Account created successfully! Please log in now.');
// //       setIsSignInForm(true); // Switch to login form after signup
// //       return;
// //     }

// //     // ✅ Login logic
// //     const savedUser = JSON.parse(localStorage.getItem('user'));
// //     if (
// //       savedUser &&
// //       savedUser.email === userEmail &&
// //       savedUser.password === userPassword
// //     ) {
// //       localStorage.setItem('auth', 'true');
// //       alert('Login successful!');
// //       navigate('studentdashboard');
// //     } else {
// //       setErrorMessage('Invalid email or password.');
// //     }
// //   };

// //   const toggleSignInForm = () => setIsSignInForm(!isSignInForm);

// //   return (
// //     <div className="flex justify-center items-center min-h-[80vh] bg-gray-50">
// //       <div className="flex justify-center items-center flex-grow px-4">
// //         <form
// //           onSubmit={(e) => e.preventDefault()}
// //           className="w-full max-w-md bg-white p-8 rounded-xl shadow-md"
// //         >
// //           <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
// //             {isSignInForm ? 'Log in' : 'Sign up'}
// //           </h1>

// //           {!isSignInForm && (
// //             <input
// //               ref={name}
// //               type="text"
// //               placeholder="Full Name"
// //               className="p-3 mb-4 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
// //             />
// //           )}

// //           <input
// //             ref={email}
// //             type="email"
// //             placeholder="you@university.edu"
// //             className="p-3 mb-4 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
// //           />

// //           <input
// //             ref={password}
// //             type="password"
// //             placeholder="Password"
// //             className="p-3 mb-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
// //           />

// //           <div className="flex justify-end mb-4">
// //             <Link
// //               to="/forgot-password"
// //               className="text-sm text-blue-600 hover:underline"
// //             >
// //               Forgot password?
// //             </Link>
// //           </div>

// //           <button
// //             type="button"
// //             className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg w-full transition"
// //             onClick={handleButtonClick}
// //           >
// //             {isSignInForm ? 'Log in' : 'Sign up'}
// //           </button>

// //           <p className="text-red-600 font-semibold text-center mt-2">{errorMessage}</p>

// //           <p
// //             className="text-center text-gray-600 mt-4 cursor-pointer hover:underline"
// //             onClick={toggleSignInForm}
// //           >
// //             {isSignInForm ? (
// //               <>
// //                 Don’t have an account?{' '}
// //                 <span className="text-blue-600 hover:underline">Sign up</span>
// //               </>
// //             ) : (
// //               <>
// //                 Already have an account?{' '}
// //                 <span className="text-blue-600 hover:underline">Log in</span>
// //               </>
// //             )}
// //           </p>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Login;


// import React, { useState, useRef } from 'react';
// import { checkValidData } from '../utilis/validate';
// import { Link, useNavigate } from 'react-router-dom';

// const Login = () => {
//   const [isSignInForm, setIsSignInForm] = useState(true);
//   const [errorMessage, setErrorMessage] = useState(null);
//   const [userType, setUserType] = useState('student');

//   const name = useRef(null);
//   const email = useRef(null);
//   const password = useRef(null);
//   const navigate = useNavigate();

//   const handleButtonClick = () => {
//     const message = checkValidData(
//       !isSignInForm ? name.current?.value : '',
//       email.current.value,
//       password.current.value
//     );
//     setErrorMessage(message);
//     if (message) return;

//     // If validation passes, redirect to appropriate dashboard
//     if (!message) {
//       navigate(`/dashboard/${userType}`);
//     }
//   };

//   const toggleSignInForm = () => setIsSignInForm(!isSignInForm);

//   return (
//     <div className="flex justify-center items-center min-h-[80vh] bg-gray-50">
//       <div className="flex justify-center items-center flex-grow px-4">
//         <form
//           onSubmit={(e) => e.preventDefault()}
//           className="w-full max-w-md bg-white p-8 rounded-xl shadow-md"
//         >
//           <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
//             {isSignInForm ? 'Log in' : 'Sign up'}
//           </h1>

//           {/* User Type Selection */}
//           <div className="mb-4">
//             <label className="block text-gray-700 text-sm font-bold mb-2">
//               Login As:
//             </label>
//             <select
//               value={userType}
//               onChange={(e) => setUserType(e.target.value)}
//               className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//             >
//               <option value="student">Student</option>
//               <option value="instructor">Instructor</option>
//               <option value="admin">Admin</option>
//               <option value="qa">QA Officer</option>
//             </select>
//           </div>

//           {!isSignInForm && (
//             <input
//               ref={name}
//               type="text"
//               placeholder="Full Name"
//               className="p-3 mb-4 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//             />
//           )}

//           <input
//             ref={email}
//             type="email"
//             placeholder="you@university.edu"
//             className="p-3 mb-4 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//           />

//           <input
//             ref={password}
//             type="password"
//             placeholder="Password"
//             className="p-3 mb-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
//           />

//           <div className="flex justify-end mb-4">
//             <Link
//               to="/forgot-password"
//               className="text-sm text-blue-600 hover:underline"
//             >
//               Forgot password?
//             </Link>
//           </div>

//           <button
//             className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg w-full transition"
//             onClick={handleButtonClick}
//           >
//             {isSignInForm ? 'Log in' : 'Sign up'}
//           </button>

//           <p className="text-red-600 font-semibold text-center mt-2">{errorMessage}</p>

//           <p className="text-center text-gray-600 mt-4">
//             {isSignInForm ? (
//               <>
//                 Don't have an account?{' '}
//                 <span
//                   className="text-blue-600 hover:underline cursor-pointer"
//                   onClick={toggleSignInForm}
//                 >
//                   Sign up
//                 </span>
//               </>
//             ) : (
//               <>
//                 Already have an account?{' '}
//                 <span
//                   className="text-blue-600 hover:underline cursor-pointer"
//                   onClick={toggleSignInForm}
//                 >
//                   Log in
//                 </span>
//               </>
//             )}
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Login;


import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkValidData } from '../utilis/validate';
import { loginUser, registerUser } from '../utilis/auth';

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
      // Validate form data
      let validationMessage = null;

      if (!isSignInForm) {
        // Sign up: run full validation (name, email, strong password)
        validationMessage = checkValidData(
          name.current?.value || '',
          email.current.value,
          password.current.value
        );
      } else {
        // Login: only check email format and that password is present.
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

      // Check for default admin
      if (isSignInForm && email.current.value === 'admin@uta.edu' && password.current.value === 'Myproject@123') {
        localStorage.setItem('userToken', 'admin-token');
        localStorage.setItem('userType', 'admin');
        localStorage.setItem('userData', JSON.stringify({
          name: 'Admin',
          email: 'admin@uta.edu',
          userType: 'admin'
        }));
        navigate('/dashboard/admin');
        return;
      }

      if (isSignInForm) {
        // Handle login - check existing users
        const users = JSON.parse(localStorage.getItem('localUsers') || '[]');
        const user = users.find(u => u.email === email.current.value && u.password === password.current.value);
        
        if (user) {
          localStorage.setItem('userToken', 'user-token');
          localStorage.setItem('userType', user.userType);
          localStorage.setItem('userData', JSON.stringify({
            name: user.name,
            email: user.email,
            userType: user.userType
          }));
          navigate(`/dashboard/${user.userType}`);
        } else {
          setErrorMessage('Invalid email or password');
        }
      } else {
        // Handle registration - all new users are students by default
        const users = JSON.parse(localStorage.getItem('localUsers') || '[]');
        const exists = users.find(u => u.email === email.current.value);
        
        if (exists) {
          setErrorMessage('User already exists. Please login.');
        } else {
          const newUser = {
            name: name.current.value,
            email: email.current.value,
            password: password.current.value,
            userType: 'student'
          };
          users.push(newUser);
          localStorage.setItem('localUsers', JSON.stringify(users));
          
          localStorage.setItem('userToken', 'user-token');
          localStorage.setItem('userType', 'student');
          localStorage.setItem('userData', JSON.stringify({
            name: newUser.name,
            email: newUser.email,
            userType: 'student'
          }));
          navigate('/dashboard/student');
        }
      }

    } catch (error) {
      setErrorMessage(error.message);
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

          {errorMessage && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {errorMessage}
            </div>
          )}

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