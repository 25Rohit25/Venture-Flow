import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext.js';
import { AppShell, DashboardShell } from '../components/layout/AppShell.js';
import { LandingPage } from '../features/landing/LandingPage.js';
import { LoginPage } from '../features/auth/LoginPage.js';
import { RegisterPage } from '../features/auth/RegisterPage.js';
import { DiscoverPage } from '../features/startups/DiscoverPage.js';
import { StartupDetailPage } from '../features/startups/StartupDetailPage.js';
import { StartupEditorPage } from '../features/startups/StartupEditorPage.js';
import { FounderDashboardPage } from '../features/dashboard/FounderDashboardPage.js';
import { InvestorDashboardPage } from '../features/dashboard/InvestorDashboardPage.js';
import { InterestsPage } from '../features/interests/InterestsPage.js';
import { BookmarksPage } from '../features/bookmarks/BookmarksPage.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { Skeleton } from '../components/ui/Skeleton.js';

// Route guards
function RequireAuth() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-10 w-40" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function RequireFounder() {
  const { user } = useAuth();
  if (user?.role !== 'FOUNDER') {
    return <Navigate to="/dashboard/investor" replace />;
  }
  return <Outlet />;
}

function RequireInvestor() {
  const { user } = useAuth();
  if (user?.role !== 'INVESTOR') {
    return <Navigate to="/dashboard/founder" replace />;
  }
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppShell>
        <LandingPage />
      </AppShell>
    ),
  },
  {
    path: '/discover',
    element: (
      <AppShell>
        <DiscoverPage />
      </AppShell>
    ),
  },
  {
    path: '/startups/:id',
    element: (
      <AppShell>
        <StartupDetailPage />
      </AppShell>
    ),
  },
  {
    path: '/login',
    element: (
      <AppShell>
        <LoginPage />
      </AppShell>
    ),
  },
  {
    path: '/register',
    element: (
      <AppShell>
        <RegisterPage />
      </AppShell>
    ),
  },

  // Protected Routes
  {
    path: '/dashboard',
    element: <RequireAuth />,
    children: [
      // Common interests route
      {
        path: 'interests',
        element: (
          <DashboardShell>
            <InterestsPage />
          </DashboardShell>
        ),
      },

      // Founder-only routes
      {
        element: <RequireFounder />,
        children: [
          {
            path: 'founder',
            element: (
              <DashboardShell>
                <FounderDashboardPage />
              </DashboardShell>
            ),
          },
          {
            path: 'startups/new',
            element: (
              <DashboardShell>
                <StartupEditorPage />
              </DashboardShell>
            ),
          },
          {
            path: 'startups/:id/edit',
            element: (
              <DashboardShell>
                <StartupEditorPage />
              </DashboardShell>
            ),
          },
        ],
      },

      // Investor-only routes
      {
        element: <RequireInvestor />,
        children: [
          {
            path: 'investor',
            element: (
              <DashboardShell>
                <InvestorDashboardPage />
              </DashboardShell>
            ),
          },
          {
            path: 'bookmarks',
            element: (
              <DashboardShell>
                <BookmarksPage />
              </DashboardShell>
            ),
          },
        ],
      },
    ],
  },

  // 404 Fallback
  {
    path: '*',
    element: (
      <AppShell>
        <div className="max-w-xl mx-auto py-24 px-4 text-center">
          <EmptyState
            title="Page Not Found (404)"
            description="The page you requested does not exist or has been moved."
            actionText="Go to Homepage"
            onAction={() => window.location.assign('/')}
          />
        </div>
      </AppShell>
    ),
  },
]);
