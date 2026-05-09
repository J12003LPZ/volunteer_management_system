import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { VolunteersListPage } from '@/pages/VolunteersListPage';
import { VolunteerProfilePage } from '@/pages/VolunteerProfilePage';
import { VolunteerRegistrationPage } from '@/pages/VolunteerRegistrationPage';
import { EventsListPage } from '@/pages/EventsListPage';
import { EventDetailsPage } from '@/pages/EventDetailsPage';
import { ShiftsPage } from '@/pages/ShiftsPage';
import { AttendancePage } from '@/pages/AttendancePage';
import { ReportsPage } from '@/pages/ReportsPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { SettingsPage } from '@/pages/SettingsPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <VolunteerRegistrationPage /> },
  {
    element: <ProtectedRoute role="admin" />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/volunteers', element: <VolunteersListPage /> },
          { path: '/volunteers/:id', element: <VolunteerProfilePage /> },
          { path: '/events', element: <EventsListPage /> },
          { path: '/events/:id', element: <EventDetailsPage /> },
          { path: '/shifts', element: <ShiftsPage /> },
          { path: '/attendance', element: <AttendancePage /> },
          { path: '/reports', element: <ReportsPage /> },
          { path: '/messages', element: <MessagesPage /> },
          { path: '/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/dashboard" replace /> },
]);
