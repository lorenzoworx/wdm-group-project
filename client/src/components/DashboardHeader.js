// import { Link } from "react-router-dom";
// import { useNavigate } from "react-router-dom";

// const DashboardHeader = () => {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem("auth");
//     localStorage.removeItem("user");
//     alert("You have been logged out.");
//     navigate("/");
//   };
//   return (
//     <header className="bg-white shadow-md p-4 flex justify-between items-center">
//       <h1 className="text-lg font-semibold text-blue-600">Campus Resource Portal</h1>
//       <nav className="flex space-x-6 text-gray-700">
//         <Link to="/dashboard">Home</Link>
//         <Link to="/dashboard/events">Events</Link>
//         <Link to="/dashboard/announcements">Announcements</Link>
//         <Link to="/dashboard/resources">Resources</Link>
//         <Link to="/dashboard/profile">Profile</Link>
//         <button
//         onClick={handleLogout}
//         className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-200"
//       >
//         Logout
//       </button>
//       </nav>
//       <div className="flex items-center space-x-2">
//         <input
//           type="text"
//           placeholder="Search events or announcements"
//           className="border px-2 py-1 rounded-md"
//         />
//         <img
//           src="https://www.svgrepo.com/show/452030/avatar-default.svg"
//           alt="Profile"
//           className="w-8 h-8 rounded-full"
//         />
//       </div>
//     </header>
//   );
// };

// export default DashboardHeader;
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const DashboardHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    alert("You have been logged out.");
    navigate("/");
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold text-blue-600">
        Campus Resource Portal
      </h1>

      {/* Navigation Buttons */}
      <nav className="flex space-x-4">
        <Link
          to="/dashboard"
          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition"
        >
          Home
        </Link>
        <Link
          to="/dashboard/events"
          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition"
        >
          Events
        </Link>
        <Link
          to="/dashboard/announcements"
          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition"
        >
          Announcements
        </Link>
        <Link
          to="/dashboard/resources"
          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition"
        >
          Resources
        </Link>
        <Link
          to="/dashboard/profile"
          className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition"
        >
          Profile
        </Link>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </nav>

      {/* Search + Avatar */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search events or announcements"
          className="border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <img
          src="https://www.svgrepo.com/show/452030/avatar-default.svg"
          alt="Profile"
          className="w-8 h-8 rounded-full border"
        />
      </div>
    </header>
  );
};

export default DashboardHeader;
