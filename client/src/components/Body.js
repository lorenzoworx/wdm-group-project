import {  RouterProvider } from "react-router-dom";
import { createBrowserRouter, Outlet } from "react-router-dom";
import Login from "../Pages/Login";
import About from "../Pages/About";
import Contact from "../Pages/Contact";
import Dashboard from "../Pages/Dashboard/Dashboard";
import Events from "../Pages/Dashboard/Events";
import Announcements from "../Pages/Dashboard/Announcements";
import Resources from "../Pages/Dashboard/Resources";
import Profile from "../Pages/Dashboard/Profile";
import Header from "./Header";
import DashboardHeader from "./DashboardHeader";
import Footer from "./Footer";
import Error from "./Error";

// Layout for main (public) pages
const MainLayout = () => (
  <div>
    <Header />
    <Outlet />
    <Footer />
  </div>
);

// Layout for dashboard pages
const DashboardLayout = () => (
  <div className="min-h-screen bg-gray-50">
    <DashboardHeader />
    <Outlet />
  </div>
);

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
        { path: "/dashboard", element: <Dashboard /> },
        { path: "/dashboard/events", element: <Events /> },
        { path: "/dashboard/announcements", element: <Announcements /> },
        { path: "/dashboard/resources", element: <Resources /> },
        { path: "/dashboard/profile", element: <Profile /> },
      ],
    },
  ]);

  return <RouterProvider router={appRouter} />;
};

export default Body;
