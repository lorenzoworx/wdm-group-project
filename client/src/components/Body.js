import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

// Layout components
import Header from './Header';
import Footer from './Footer';
import DashboardHeader from './DashboardHeader';

// Main pages
import Login from '../Pages/Login';
import About from '../Pages/About';
import Contact from '../Pages/Contact';

// Dashboard / sections
import DashboardHome from '../Pages/DashboardHome';
import StudentDashboard from '../Pages/StudentDashboard';
import InstructorDashboard from '../Pages/InstructorDashboard';
import AdminDashboard from '../Pages/AdminDashboard';
import QAOfficePage from '../Pages/QAOfficePage';
import StudentHomepage from '../Pages/StudentHomepage';
import EventsPage from '../Pages/EventsPage';
import Announcements from '../Pages/Announcements';
import Resources from '../Pages/Resources';
import Profile from '../Pages/Profile';

// Error
import Error from '../Pages/Error';

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

// Router
const Body = () => {
  const appRouter = createBrowserRouter([
    {
      element: <MainLayout />,
      errorElement: <Error />,
      children: [
        { path: '/', element: <Login /> },
        { path: '/about', element: <About /> },
        { path: '/contact', element: <Contact /> },
      ],
    },
    {
      element: <DashboardLayout />,
      errorElement: <Error />,
      children: [
        { path: '/dashboard', element: <DashboardHome /> },
        { path: '/dashboard/events', element: <EventsPage /> },
        { path: '/dashboard/announcements', element: <Announcements /> },
        { path: '/dashboard/resources', element: <Resources /> },
        { path: '/dashboard/profile', element: <Profile /> },
        { path: '/dashboard/student', element: <StudentDashboard /> },
        { path: '/dashboard/instructor', element: <InstructorDashboard /> },
        { path: '/dashboard/admin', element: <AdminDashboard /> },
        { path: '/dashboard/qa', element: <QAOfficePage /> },
        { path: '/dashboard/home', element: <StudentHomepage /> },
      ],
    },
  ]);

  return <RouterProvider router={appRouter} />;
};

export default Body;
