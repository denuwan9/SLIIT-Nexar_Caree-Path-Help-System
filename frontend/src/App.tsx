import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicRoute } from './components/auth/PublicRoute';
import { Layout } from './components/layout/Layout';
import { Toaster } from 'react-hot-toast';

// Lazy load pages
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const AiAdvisorPage = React.lazy(() => import('./pages/AiAdvisorPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminCareerProfiles = React.lazy(() => import('./pages/AdminCareerProfiles'));
const AdminStudentPreview = React.lazy(() => import('./pages/AdminStudentPreview'));
const AdminJobPosts = React.lazy(() => import('./pages/AdminJobPosts'));
const StudyPlanPage = React.lazy(() => import('./pages/StudyPlanPage'));
const InterviewSchedulingPage = React.lazy(() => import('./pages/InterviewSchedulingPage'));
const MockInterviewPage = React.lazy(() => import('./pages/MockInterviewPage'));
const JobPostingDashboard = React.lazy(() => import('./pages/JobPostingDashboard'));
const CreateJobPost = React.lazy(() => import('./pages/CreateJobPost'));
const EditJobPost = React.lazy(() => import('./pages/EditJobPost'));
const JobPostDetails = React.lazy(() => import('./pages/JobPostDetails'));
const VerifyEmailPage = React.lazy(() => import('./pages/VerifyEmailPage'));

const RootRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/dashboard" replace />;
};

const NotFoundRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <div className="flex h-screen items-center justify-center font-bold text-slate-500 text-xl">404 - Not Found</div>;
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
            {/* Public Routes - Only accessible when NOT logged in */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>

            {/* Email Verification - Special case public route */}
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              {/* Admin Area - Catch-all for /admin prefix */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminDashboard />} />
                <Route path="profiles" element={<AdminCareerProfiles />} />
                <Route path="profiles/:id" element={<AdminStudentPreview />} />
                <Route path="job-posts" element={<AdminJobPosts />} />
                {/* Catch any other /admin/subpath and redirect to main admin dashboard */}
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Route>

              {/* Student Only Routes */}
              <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/advisor" element={<AiAdvisorPage />} />
                <Route path="/study" element={<StudyPlanPage />} />
                <Route path="/job-postings" element={<JobPostingDashboard />} />
                <Route path="/job-postings/new" element={<CreateJobPost />} />
                <Route path="/job-postings/:id/edit" element={<EditJobPost />} />
                <Route path="/job-postings/:id" element={<JobPostDetails />} />
              </Route>

              {/* Shared Protected Routes */}
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/interviews" element={<InterviewSchedulingPage />} />
              <Route path="/mock-interview" element={<MockInterviewPage />} />
            </Route>

            {/* Global Redirects & Fallbacks */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/unauthorized" element={<div className="flex h-screen items-center justify-center font-bold text-red-500 text-xl">403 - Unauthorized</div>} />
            <Route path="*" element={<NotFoundRedirect />} />
          </Routes>
        </React.Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
