import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
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
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminCareerProfiles = React.lazy(() => import('./pages/AdminCareerProfiles'));
const AdminStudentPreview = React.lazy(() => import('./pages/AdminStudentPreview'));
const StudyPlanPage = React.lazy(() => import('./pages/StudyPlanPage'));

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
};

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
            position="top-center" 
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
              {/* Student Only */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/advisor" element={<AiAdvisorPage />} />
                <Route
                  path="/interviews"
                  element={<ComingSoon title="Interview Scheduling" description="Prepare for your dream role with our upcoming AI-powered interview simulators and scheduling system." />}
                />
                <Route path="/study" element={<StudyPlanPage />} />
                <Route
                  path="/careers"
                  element={<ComingSoon title="Career Explored" description="Discover your ideal career path with our advanced matching engine and job market analysis tools." />}
                />
              </Route>
              
              {/* Shared Routes */}
              <Route path="/settings" element={<SettingsPage />} />

              {/* Admin Only */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/profiles" element={<AdminCareerProfiles />} />
                <Route path="/admin/profiles/:id" element={<AdminStudentPreview />} />
              </Route>
            </Route>

            {/* Redirects */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/unauthorized" element={<div className="flex h-screen items-center justify-center font-bold text-red-500 text-xl">403 - Unauthorized</div>} />
            <Route path="*" element={<div className="flex h-screen items-center justify-center font-bold text-slate-500 text-xl">404 - Not Found</div>} />
          </Routes>
        </React.Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
