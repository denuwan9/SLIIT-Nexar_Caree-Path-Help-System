import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowRight, Loader2, UserCircle2, MailCheck, KeyRound, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
import { 
  loginSchema, 
  signupSchema, 
  forgotPasswordSchema, 
  otpSchema, 
  resetPasswordSchema, 
  type LoginInput, 
  type SignupInput,
  type ForgotPasswordInput,
  type OTPInput,
  type ResetPasswordInput
} from './authSchemas';
import { useAuth } from '../../components/auth/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

// Use the paths the user specified as imports if possible, otherwise rely on relative string paths
import logo from '../../assets/logo.png';

interface AuthModuleProps {
  initialView?: 'login' | 'signup';
}

type AuthView = 'login' | 'signup' | 'forgot-password' | 'otp-verify' | 'reset-password';

const AuthModule: React.FC<AuthModuleProps> = ({ initialView = 'login' }) => {
  const [view, setView] = useState<AuthView>(initialView);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  
  const { login, signup, forgotPassword, verifyOTP, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for specialized redirect messages from ProtectedRoute
  React.useEffect(() => {
    const state = location.state as { message?: string };
    if (state?.message) {
      setAuthError(state.message);
      // Clear the state so the message doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const toggleView = () => {
    setAuthError(null);
    setView(v => v === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Top Header Elements */}
      <div className="w-full flex justify-between items-center mb-8 lg:mb-12">
        <div className="flex items-center gap-2">
          <img src={logo} alt="SLIIT" className="h-10 w-auto object-contain" />
        </div>
        <button 
          onClick={toggleView}
          className="flex items-center gap-2 text-[12px] font-bold text-[#64748B] hover:text-[#1E293B] transition-colors"
        >
          <div className="w-6 h-6 rounded-full bg-[#F1F5F9] flex items-center justify-center">
             <UserCircle2 size={13} className="text-[#94A3B8]" />
          </div>
          {view === 'login' || view === 'forgot-password' || view === 'otp-verify' || view === 'reset-password' 
            ? 'Establish Identity' 
            : 'Authenticate'}
        </button>
      </div>

      <div className="flex-1 w-full flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {verificationSent ? (
            <VerificationSentView 
              key="verification-sent" 
              onBack={() => {
                setVerificationSent(false);
                setView('login');
              }} 
            />
          ) : view === 'login' ? (
            <LoginView 
              key="login" 
              onSwitch={toggleView} 
              onForgotPassword={() => setView('forgot-password')}
              showPassword={showPassword} 
              setShowPassword={setShowPassword}
              authError={authError}
              onSubmit={async (data) => {
                setAuthError(null);
                try {
                  const user = await login(data.email, data.password);
                  toast.success('Authentication successful');
                  if (user?.role === 'admin') navigate('/admin');
                  else navigate('/dashboard');
                } catch (err: any) {
                  const msg = err.response?.data?.message || err.message || 'Invalid credentials or server error. Please try again.';
                  setAuthError(msg);
                  toast.error(msg);
                }
              }}
            />
          ) : view === 'signup' ? (
            <SignupView 
              key="signup" 
              onSwitch={toggleView} 
              showPassword={showPassword} 
              setShowPassword={setShowPassword}
              authError={authError}
              onSubmit={async (data) => {
                setAuthError(null);
                try {
                  await signup(data);
                  setVerificationSent(true);
                  toast.success('Account created! Please verify your email.');
                } catch (err: any) {
                  const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
                  setAuthError(msg);
                  toast.error(msg);
                }
              }}
            />
          ) : view === 'forgot-password' ? (
            <ForgotPasswordView 
              key="forgot-password"
              onBack={() => setView('login')}
              onSubmit={async (data) => {
                setAuthError(null);
                try {
                  await forgotPassword(data.email);
                  setForgotPasswordEmail(data.email);
                  setView('otp-verify');
                  toast.success('OTP sent to your email');
                } catch (err: any) {
                  const msg = err.response?.data?.message || 'Failed to send OTP';
                  setAuthError(msg);
                  toast.error(msg);
                }
              }}
              authError={authError}
            />
          ) : view === 'otp-verify' ? (
            <OTPVerificationView 
              key="otp-verify"
              email={forgotPasswordEmail}
              onBack={() => setView('forgot-password')}
              onSubmit={async (data) => {
                setAuthError(null);
                try {
                  await verifyOTP(forgotPasswordEmail, data.otp);
                  setView('reset-password');
                  toast.success('OTP verified successfully');
                } catch (err: any) {
                  const msg = err.response?.data?.message || 'Invalid OTP';
                  setAuthError(msg);
                  toast.error(msg);
                }
              }}
              authError={authError}
            />
          ) : (
            <ResetPasswordView 
              key="reset-password"
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              onSubmit={async (data) => {
                setAuthError(null);
                try {
                  await resetPassword(forgotPasswordEmail, data.password);
                  toast.success('Password reset successfully');
                  setView('login');
                } catch (err: any) {
                  const msg = err.response?.data?.message || 'Failed to reset password';
                  setAuthError(msg);
                  toast.error(msg);
                }
              }}
              authError={authError}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* --- Shared Layout Props --- */
interface ViewProps {
  onSwitch?: () => void;
  onForgotPassword?: () => void;
  onBack?: () => void;
  showPassword?: boolean;
  setShowPassword?: (show: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  authError?: string | null;
  email?: string;
}

/* --- Authenticate (Login) View --- */
const LoginView = ({ onSwitch, onForgotPassword, showPassword, setShowPassword, onSubmit, authError }: ViewProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur'
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col text-[#1E293B]"
    >
      <div className="mb-8 text-left">
        <h2 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">Welcome to SLIIT Nexar</h2>
        <p className="text-[#64748B] text-[15px] font-medium">Please login to your system account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
        {authError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-bold text-center">
            {authError}
          </div>
        )}
        <div>
          <label className="block text-[13px] font-bold text-[#334155] mb-2">SLIIT Email</label>
          <input 
            {...register('email')}
            placeholder="student@my.sliit.lk or staff@sliit.lk"
            className={`w-full px-5 py-3.5 bg-[#F1F5F9] border rounded-xl text-[14px] font-semibold transition-all outline-none text-[#0F172A] placeholder-[#94A3B8] focus:bg-white ${
               errors.email 
                 ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                 : 'border-transparent hover:border-[#CBD5E1] focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10'
            }`}
          />
          {errors.email && <span className="text-[12px] font-bold text-red-500 mt-2 block">Institutional email (@sliit.lk or @my.sliit.lk) is required</span>}
        </div>

        <div className="relative">
          <label className="block text-[13px] font-bold text-[#334155] mb-2">Access Password</label>
          <div className="relative">
            <input 
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`w-full pl-5 pr-12 py-3.5 bg-[#F1F5F9] border rounded-xl text-[14px] font-semibold transition-all outline-none text-[#0F172A] placeholder-[#94A3B8] focus:bg-white ${
                 errors.password 
                   ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                   : 'border-transparent hover:border-[#CBD5E1] focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10'
              }`}
            />
            <button 
              type="button"
              onClick={() => setShowPassword && setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="text-[12px] font-bold text-red-500 mt-2 block">Password is required</span>}
        </div>

        <div className="w-full flex justify-end mt-2 mb-6">
          <button 
            type="button" 
            onClick={onForgotPassword}
            className="text-[13px] font-bold text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            Forgot Password?
          </button>
        </div>

        <div className="space-y-3">
          <button 
            disabled={isSubmitting}
            type="submit" 
            className="w-full h-[52px] bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(249,115,22,0.25)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)] disabled:opacity-70 group"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                Login to Nexar
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="text-center mt-10">
        <span className="text-[14px] font-medium text-[#64748B]">
          Are you new?{' '}
          <button onClick={onSwitch} className="text-[#0ea5e9] font-bold hover:underline">
            Create an Account
          </button>
        </span>
      </div>
    </motion.div>
  );
};

/* --- Register (Signup) View --- */
const SignupView = ({ onSwitch, showPassword, setShowPassword, onSubmit, authError }: ViewProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur'
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.4 }}
      className="w-full flex flex-col text-[#1E293B]"
    >
      <div className="mb-8 text-left">
        <h2 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">Create an Account</h2>
        <p className="text-[#64748B] text-[15px] font-medium">Provision Institutional Access</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4 text-left">
        {authError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-bold text-center">
            {authError}
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-bold text-[#334155] mb-2">First Name</label>
            <input 
              {...register('firstName')} 
              placeholder="First Name" 
              className={`w-full px-5 py-3.5 bg-[#F1F5F9] border rounded-xl text-[14px] font-semibold transition-all outline-none text-[#0F172A] placeholder-[#94A3B8] focus:bg-white ${
                 errors.firstName 
                   ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                   : 'border-transparent hover:border-[#CBD5E1] focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10'
              }`} 
            />
            {errors.firstName && <span className="text-[12px] font-bold text-red-500 mt-1 block">{errors.firstName.message}</span>}
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#334155] mb-2">Last Name</label>
            <input 
              {...register('lastName')} 
              placeholder="Last Name" 
              className={`w-full px-5 py-3.5 bg-[#F1F5F9] border rounded-xl text-[14px] font-semibold transition-all outline-none text-[#0F172A] placeholder-[#94A3B8] focus:bg-white ${
                 errors.lastName 
                   ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                   : 'border-transparent hover:border-[#CBD5E1] focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10'
              }`} 
            />
            {errors.lastName && <span className="text-[12px] font-bold text-red-500 mt-1 block">{errors.lastName.message}</span>}
          </div>
        </div>

        <div>
           <label className="block text-[13px] font-bold text-[#334155] mb-2">Institutional Email</label>
          <input 
            {...register('email')} 
            placeholder="student@my.sliit.lk" 
            className={`w-full px-5 py-3.5 bg-[#F1F5F9] border rounded-xl text-[14px] font-semibold transition-all outline-none text-[#0F172A] placeholder-[#94A3B8] focus:bg-white ${
               errors.email 
                 ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                 : 'border-transparent hover:border-[#CBD5E1] focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10'
            }`} 
          />
          {errors.email && <span className="text-[12px] font-bold text-red-500 mt-1 block">{errors.email.message}</span>}
        </div>

        <div className="relative">
          <label className="block text-[13px] font-bold text-[#334155] mb-2">Access Password</label>
          <div className="relative">
             <input 
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`w-full pl-5 pr-12 py-3.5 bg-[#F1F5F9] border rounded-xl text-[14px] font-semibold transition-all outline-none text-[#0F172A] placeholder-[#94A3B8] focus:bg-white ${
                 errors.password 
                   ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                   : 'border-transparent hover:border-[#CBD5E1] focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10'
              }`}
            />
            <button 
              type="button"
              onClick={() => setShowPassword && setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="text-[12px] font-bold text-red-500 mt-1 block">{errors.password.message}</span>}
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#334155] mb-2">Confirm Password</label>
          <input 
            {...register('confirmPassword')}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className={`w-full px-5 py-3.5 bg-[#F1F5F9] border rounded-xl text-[14px] font-semibold transition-all outline-none text-[#0F172A] placeholder-[#94A3B8] focus:bg-white ${
               errors.confirmPassword 
                 ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                 : 'border-transparent hover:border-[#CBD5E1] focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10'
            }`}
          />
          {errors.confirmPassword && <span className="text-[12px] font-bold text-red-500 mt-1 block">{errors.confirmPassword.message}</span>}
        </div>

        <button 
          disabled={isSubmitting}
          type="submit" 
          className="w-full h-[52px] mt-6 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(249,115,22,0.25)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.4)] disabled:opacity-70 group"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
            <>
              Create an Account
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-10">
        <span className="text-[14px] font-medium text-[#64748B]">
          Already member?{' '}
          <button onClick={onSwitch} className="text-[#0ea5e9] font-bold hover:underline">
            Login to Nexar
          </button>
        </span>
      </div>
    </motion.div>
  );
};

/* --- Verification Sent View --- */
const VerificationSentView = ({ onBack }: { onBack: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="w-full flex flex-col items-center text-center p-6"
  >
    <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 text-blue-600">
      <MailCheck size={40} />
    </div>
    <h2 className="text-3xl font-black text-[#0F172A] tracking-tight mb-4">Check your email</h2>
    <p className="text-[#64748B] text-[16px] font-medium leading-relaxed mb-10 max-w-[320px]">
      We've dispatched a verification link to your institutional inbox. Please authenticate to complete your enrollment.
    </p>
    <button 
      onClick={onBack}
      className="w-full h-[52px] bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-lg"
    >
      Return to Login
    </button>
  </motion.div>
);

/* --- Forgot Password View (Email Step) --- */
const ForgotPasswordView = ({ onBack, onSubmit, authError }: ViewProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onBlur'
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full flex flex-col text-[#1E293B]"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors mb-8 text-[13px] font-bold"
      >
        <ArrowLeft size={16} />
        Back to Login
      </button>
      <div className="mb-8 text-left">
        <h2 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">Reset Password</h2>
        <p className="text-[#64748B] text-[15px] font-medium">Enter your SLIIT email to receive an OTP</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
        {authError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-bold text-center">
            {authError}
          </div>
        )}
        <div>
          <label className="block text-[13px] font-bold text-[#334155] mb-2">Institutional Email</label>
          <div className="relative">
             <input 
              {...register('email')}
              placeholder="student@my.sliit.lk"
              className={`w-full px-5 py-3.5 bg-[#F1F5F9] border rounded-xl text-[14px] font-semibold transition-all outline-none text-[#0F172A] placeholder-[#94A3B8] focus:bg-white ${
                 errors.email ? 'border-red-500' : 'border-transparent focus:border-[#F97316]'
              }`}
            />
          </div>
          {errors.email && <span className="text-[12px] font-bold text-red-500 mt-2 block">{errors.email.message}</span>}
        </div>

        <button 
          disabled={isSubmitting}
          type="submit" 
          className="w-full h-[52px] bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Code'}
        </button>
      </form>
    </motion.div>
  );
};

/* --- OTP Verification View --- */
const OTPVerificationView = ({ onBack, onSubmit, authError, email }: ViewProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<OTPInput>({
    resolver: zodResolver(otpSchema),
    mode: 'onBlur'
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full flex flex-col text-[#1E293B]"
    >
      <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-8 text-[#F97316]">
        <ShieldCheck size={32} />
      </div>
      <div className="mb-8 text-left">
        <h2 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">Verify OTP</h2>
        <p className="text-[#64748B] text-[15px] font-medium leading-relaxed">
          We've sent a 6-digit authentication code to <span className="text-[#0F172A] font-bold">{email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
        {authError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-bold text-center">
            {authError}
          </div>
        )}
        <div>
          <label className="block text-[13px] font-bold text-[#334155] mb-2 text-center uppercase tracking-wider">Authentication Code</label>
          <input 
            {...register('otp')}
            placeholder="000000"
            maxLength={6}
            className={`w-full px-5 py-4 bg-[#F1F5F9] border rounded-xl text-[24px] tracking-[12px] text-center font-black transition-all outline-none text-[#0F172A] placeholder-[#94A3B8] focus:bg-white ${
               errors.otp ? 'border-red-500' : 'border-transparent focus:border-[#F97316]'
            }`}
          />
          {errors.otp && <span className="text-[12px] font-bold text-red-500 mt-2 block text-center">{errors.otp.message}</span>}
        </div>

        <button 
          disabled={isSubmitting}
          type="submit" 
          className="w-full h-[52px] bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Verify and Proceed'}
        </button>

        <div className="text-center">
          <button 
            type="button" 
            onClick={onBack}
            className="text-[13px] font-bold text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            Didn't receive the code? Resend
          </button>
        </div>
      </form>
    </motion.div>
  );
};

/* --- Reset Password View (Final Step) --- */
const ResetPasswordView = ({ showPassword, setShowPassword, onSubmit, authError }: ViewProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur'
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full flex flex-col text-[#1E293B]"
    >
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 text-blue-600">
        <KeyRound size={32} />
      </div>
      <div className="mb-8 text-left">
        <h2 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">New Master Key</h2>
        <p className="text-[#64748B] text-[15px] font-medium">Please set a secure password for your identity</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
        {authError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[13px] font-bold text-center">
            {authError}
          </div>
        )}
        <div className="relative">
          <label className="block text-[13px] font-bold text-[#334155] mb-2">New Password</label>
          <div className="relative">
            <input 
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`w-full pl-5 pr-12 py-3.5 bg-[#F1F5F9] border rounded-xl text-[14px] font-semibold transition-all outline-none text-[#0F172A] placeholder-[#94A3B8] focus:bg-white ${
                 errors.password ? 'border-red-500' : 'border-transparent focus:border-[#F97316]'
              }`}
            />
            <button 
              type="button"
              onClick={() => setShowPassword && setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="text-[12px] font-bold text-red-500 mt-2 block">{errors.password.message}</span>}
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#334155] mb-2">Confirm New Password</label>
          <input 
            {...register('confirmPassword')}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className={`w-full px-5 py-3.5 bg-[#F1F5F9] border rounded-xl text-[14px] font-semibold transition-all outline-none text-[#0F172A] placeholder-[#94A3B8] focus:bg-white ${
               errors.confirmPassword ? 'border-red-500' : 'border-transparent focus:border-[#F97316]'
            }`}
          />
          {errors.confirmPassword && <span className="text-[12px] font-bold text-red-500 mt-2 block">{errors.confirmPassword.message}</span>}
        </div>

        <button 
          disabled={isSubmitting}
          type="submit" 
          className="w-full h-[52px] bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-70 group"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
            <>
              Reset Password
              <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default AuthModule;
