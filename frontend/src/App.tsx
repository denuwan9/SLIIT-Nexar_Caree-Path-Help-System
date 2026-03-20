import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Toaster } from 'react-hot-toast';

// Lazy load pages
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const ComingSoon = React.lazy(() => import('./pages/ComingSoon'));
const AiAdvisorPage = React.lazy(() => import('./pages/AiAdvisorPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const JobPostingDashboard = React.lazy(() => import('./pages/jobPosting/JobPostingDashboard'));
const PublicJobPost = React.lazy(() => import('./pages/jobPosting/PublicJobPost'));

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
          <Toaster 
            position="top-right" 
            toastOptions={{
              className: 'font-main text-sm shadow-xl',
              style: {
                borderRadius: '16px',
                background: '#ffffff',
                color: '#0A0A0A',
                border: '1px solid rgba(0,0,0,0.05)',
              },
              success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } }
            }} 
          />
          <div className="mesh-bg" />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/advisor" element={<AiAdvisorPage />} />
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
              <Route path="/job-posting" element={<JobPostingDashboard />} />
              <Route path="/job-posting/public/:id" element={<PublicJobPost />} />
              <Route path="/settings" element={<SettingsPage />} />

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
