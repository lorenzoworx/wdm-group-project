// import {  RouterProvider } from "react-router-dom";
// import { createBrowserRouter, Outlet } from "react-router-dom";
// import Login from "../Pages/Login";
// import About from "../Pages/About";
// import Contact from "../Pages/Contact";
// import Dashboard from "../Pages/Dashboard/Dashboard";
// import Events from "../Pages/Dashboard/Events";
// import Announcements from "../Pages/Dashboard/Announcements";
// import Resources from "../Pages/Dashboard/Resources";
// import Profile from "../Pages/Dashboard/Profile";
// import Header from "./Header";
// import DashboardHeader from "./DashboardHeader";
// import Footer from "./Footer";
// import Error from "./Error";

// // Layout for main (public) pages
// const MainLayout = () => (
//   <div>
//     <Header />
//     <Outlet />
//     <Footer />
//   </div>
// );

// // Layout for dashboard pages
// const DashboardLayout = () => (
//   <div className="min-h-screen bg-gray-50">
//     <DashboardHeader />
//     <Outlet />
//   </div>
// );

// const Body = () => {
//   const appRouter = createBrowserRouter([
//     {
//       element: <MainLayout />,
//       errorElement: <Error />,
//       children: [
//         { path: "/", element: <Login /> },
//         { path: "/about", element: <About /> },
//         { path: "/contact", element: <Contact /> },
//       ],
//     },
//     {
//       element: <DashboardLayout />,
//       errorElement: <Error />,
//       children: [
//         { path: "/dashboard", element: <Dashboard /> },
//         { path: "/dashboard/events", element: <Events /> },
//         { path: "/dashboard/announcements", element: <Announcements /> },
//         { path: "/dashboard/resources", element: <Resources /> },
//         { path: "/dashboard/profile", element: <Profile /> },
//       ],
//     },
//   ]);

//   return <RouterProvider router={appRouter} />;
// };

// export default Body;



import React from "react";
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

// Layout Components
import Header from "./Header";
import Footer from "./Footer";
import DashboardHeader from "./DashboardHeader";

// Main Pages
import Login from "../Pages/Login";
import About from "../Pages/About";
import Contact from "../Pages/Contact";

// Dashboard Sections
import DashboardHome from "../Pages/DashboardHome";
import Announcements from "../Pages/Announcements";
import Resources from "../Pages/Resources";
import Profile from "../Pages/Profile";

// Dynamic Dashboards
import StudentDashboard from "../Pages/StudentDashboard";
import InstructorDashboard from "../Pages/InstructorDashboard";
import AdminDashboard from "../Pages/AdminDashboard";
import QAOfficePage from "../Pages/QAOfficePage";
import EventsPage from "../Pages/EventsPage";

// Error Page
import Error from "../Pages/Error";


// ---------- Layouts ----------

// Layout for normal pages (Login, About, Contact)
const MainLayout = () => (
  <div>
    <Header />
    <main className="min-h-screen bg-gray-50">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Layout for dashboard pages (with DashboardHeader)
const DashboardLayout = () => (
  <div className="min-h-screen bg-gray-50">
    <DashboardHeader />
    <main className="p-6">
      <Outlet />
    </main>
  </div>
);

// ---------- Router ----------
const Body = () => {
  const appRouter = createBrowserRouter([
    {
      element: <MainLayout />,
      errorElement: <Error />,
      children: [
        { path: "/", element: <Login /> },
        { path: "/about", element: <About /> },
        { path: "/contact", element: <Contact /> },
      ],
    },
    {
      element: <DashboardLayout />,
      errorElement: <Error />,
      children: [
        { path: "/dashboard", element: <DashboardHome /> },
        { path: "/dashboard/events", element: <EventsPage /> },
        { path: "/dashboard/announcements", element: <Announcements /> },
        { path: "/dashboard/resources", element: <Resources /> },
        { path: "/dashboard/profile", element: <Profile /> },
        { path: "/dashboard/student", element: <StudentDashboard /> },
        { path: "/dashboard/instructor", element: <InstructorDashboard /> },
        { path: "/dashboard/admin", element: <AdminDashboard /> },
        { path: "/dashboard/qa", element: <QAOfficePage /> },
      ],
    },
  ]);

  return <RouterProvider router={appRouter} />;
};

export default Body;
