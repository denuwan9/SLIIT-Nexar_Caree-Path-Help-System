import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';

// Lazy load pages
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const ComingSoon = React.lazy(() => import('./pages/ComingSoon'));

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <React.Suspense
          fallback={
            <div className="flex h-screen items-center justify-center bg-slate-50">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
          }
        >
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route
                path="/interviews"
                element={<ComingSoon title="Interview Scheduling" description="Prepare for your dream role with our upcoming AI-powered interview simulators and scheduling system." />}
              />
              <Route
                path="/study"
                element={<ComingSoon title="Study Plan Generator" description="Master any skill with personalized, AI-curated study paths and resource tracking coming soon." />}
              />
              <Route
                path="/careers"
                element={<ComingSoon title="Career Explored" description="Discover your ideal career path with our advanced matching engine and job market analysis tools." />}
              />
              <Route
                path="/settings"
                element={<ComingSoon title="Settings & Privacy" description="Customize your experience and manage your data with our upcoming settings portal." />}
              />

              {/* Admin Only */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <div className="card">Admin Dashboard Skeleton</div>
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/unauthorized" element={<div className="flex h-screen items-center justify-center font-bold text-red-500 text-xl">403 - Unauthorized</div>} />
            <Route path="*" element={<div className="flex h-screen items-center justify-center font-bold text-slate-500 text-xl">404 - Not Found</div>} />
          </Routes>
        </React.Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
