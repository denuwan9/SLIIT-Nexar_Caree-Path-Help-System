import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';

// Lazy load pages
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

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
              <Route path="/profile" element={<div className="card">Profile Page Skeleton</div>} />
              <Route path="/interviews" element={<div className="card">Interview Scheduling Skeleton</div>} />
              <Route path="/study-plan" element={<div className="card">Study Plan Generator Skeleton</div>} />
              <Route path="/jobs" element={<div className="card">Job Postings Skeleton</div>} />

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
