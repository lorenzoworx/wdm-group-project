// src/components/Body.jsx
import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

// Layout components
import Header from './Header';
import Footer from './Footer';
import DashboardHeader from './DashboardHeader';

// Main pages (these files must export DEFAULT components)
import Login from '../Pages/Login';
import About from '../Pages/About';
import Contact from '../Pages/Contact';
import Signup from '../Pages/Signup';

// Dashboard / sections (also default exports)
import DashboardHome from '../Pages/DashboardHome';
import StudentDashboard from '../Pages/StudentDashboard';
import InstructorDashboard from '../Pages/InstructorDashboard';
import AdminDashboard from '../Pages/AdminDashboard';
import QAOfficePage from '../Pages/QAOfficePage';
import StudentHomepage from '../Pages/StudentHomepage';
import EventsPage from '../Pages/EventsPage';
import ClassesPage from '../Pages/ClassesPage';
import ExamsPage from '../Pages/ExamsPage';
import UsersPage from '../Pages/UsersPage';
import ProfilePage from '../Pages/ProfilePage';
import Announcements from '../Pages/Announcements';
import Resources from '../Pages/Resources';
import Reports from '../Pages/Reports';
import Performance from '../Pages/Performance';
import Reviews from '../Pages/Reviews';
import Grades from '../Pages/Grades';

// Avoid naming collision with the global Error constructor
import ErrorPage from '../Pages/Error';

const MainLayout = () => (
    <div>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <Outlet />
      </main>
      <Footer />
    </div>
);

const DashboardLayout = () => (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="p-6">
        <div className="app-container">
          <Outlet />
        </div>
      </main>
    </div>
);

const router = createBrowserRouter([
  {
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/', element: <Login /> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
      { path: '/signup', element: <Signup /> },
    ],
  },
  {
    element: <DashboardLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/dashboard', element: <DashboardHome /> },
      { path: '/dashboard/home', element: <StudentHomepage /> },
      { path: '/dashboard/events', element: <EventsPage /> },
      { path: '/dashboard/classes', element: <ClassesPage /> },
      { path: '/dashboard/exams', element: <ExamsPage /> },
      { path: '/dashboard/users', element: <UsersPage /> },
      { path: '/dashboard/reports', element: <Reports /> },
      { path: '/dashboard/performance', element: <Performance /> },
      { path: '/dashboard/reviews', element: <Reviews /> },
      { path: '/dashboard/profile', element: <ProfilePage /> },
      { path: '/dashboard/announcements', element: <Announcements /> },
      { path: '/dashboard/resources', element: <Resources /> },
      { path: '/dashboard/grades', element: <Grades /> },
      { path: '/grades', element: <Grades /> },
      { path: '/dashboard/student', element: <StudentDashboard /> },
      { path: '/dashboard/instructor', element: <InstructorDashboard /> },
      { path: '/dashboard/admin', element: <AdminDashboard /> },
      { path: '/dashboard/qa', element: <QAOfficePage /> },
    ],
  },
]);

export default function Body() {
  return <RouterProvider router={router} />;
}
