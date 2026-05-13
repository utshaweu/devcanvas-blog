import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { LoginPage } from '@/features/auth/LoginPage';
import { SignupPage } from '@/features/auth/SignupPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { ReadingListPage } from '@/features/reading-list/ReadingListPage';
import { BlogListPage } from '@/features/blog/BlogListPage';
import { BlogPostPage } from '@/features/blog/BlogPostPage';
import { CreatePostPage } from '@/features/blog/CreatePostPage';
import { EditPostPage } from '@/features/blog/EditPostPage';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { LoadingOverlay } from '@/components/common/LoadingSpinner';
import { GlobalToastProvider } from '@/contexts/ToastContext';
import { ToastProvider } from '@/components/ui/toast';
import { ToastContainer } from '@/components/common/ToastContainer';
import { NotFound } from '@/components/common/NotFound';
import { ChatBot } from '@/components/common/ChatBot';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Guest Only Route Component
const GuestRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Root layout shared by all routes
const RootLayout: React.FC = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Header />
    <main className="flex-1">
      <Outlet />
    </main>
    <ToastContainer />
    <ChatBot />
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Public Routes
      { index: true, element: <BlogListPage /> },
      { path: 'blog', element: <BlogListPage /> },
      { path: 'blog/:slug', element: <BlogPostPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },

      // Guest Only Routes
      { path: 'login', element: <GuestRoute><LoginPage /></GuestRoute> },
      { path: 'signup', element: <GuestRoute><SignupPage /></GuestRoute> },
      { path: 'forgot-password', element: <GuestRoute><ForgotPasswordPage /></GuestRoute> },

      // Protected Routes
      { path: 'dashboard', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
      { path: 'profile', element: <ProtectedRoute><ProfilePage /></ProtectedRoute> },
      { path: 'analytics', element: <ProtectedRoute><AnalyticsPage /></ProtectedRoute> },
      { path: 'create', element: <ProtectedRoute><CreatePostPage /></ProtectedRoute> },
      { path: 'edit/:id', element: <ProtectedRoute><EditPostPage /></ProtectedRoute> },
      { path: 'reading-list', element: <ProtectedRoute><ReadingListPage /></ProtectedRoute> },

      // 404 Route
      { path: '*', element: <NotFound /> },
    ],
  },
]);

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <GlobalToastProvider>
            <RouterProvider router={router} />
          </GlobalToastProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;

