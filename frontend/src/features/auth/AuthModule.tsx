import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowRight, Loader2, UserCircle2 } from 'lucide-react';
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from './authSchemas';
import { useAuth } from '../../components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
// Use the paths the user specified as imports if possible, otherwise rely on relative string paths
import logo from '../../assets/logo.png';
interface AuthModuleProps {
  initialView?: 'login' | 'signup';
}

const AuthModule: React.FC<AuthModuleProps> = ({ initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'signup'>(initialView);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

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
          {view === 'login' ? 'Establish Identity' : 'Authenticate'}
        </button>
      </div>

      <div className="flex-1 w-full flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {view === 'login' ? (
            <LoginView 
              key="login" 
              onSwitch={toggleView} 
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
          ) : (
            <SignupView 
              key="signup" 
              onSwitch={toggleView} 
              showPassword={showPassword} 
              setShowPassword={setShowPassword}
              authError={authError}
              onSubmit={async (data) => {
                setAuthError(null);
                try {
                  const user = await signup(data);
                  toast.success('Identity established successfully');
                  if (user?.role === 'admin') navigate('/admin');
                  else navigate('/dashboard');
                } catch (err: any) {
                  const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
                  setAuthError(msg);
                  toast.error(msg);
                }
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* --- Authenticate (Login) View --- */
interface ViewProps {
  onSwitch: () => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  authError?: string | null;
}

const LoginView = ({ onSwitch, showPassword, setShowPassword, onSubmit, authError }: ViewProps) => {
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
          <label className="block text-[13px] font-bold text-[#334155] mb-2">Official ID</label>
          <input 
            {...register('email')}
            placeholder="student@sliit.lk"
            className={`w-full px-5 py-3.5 bg-[#F1F5F9] border rounded-xl text-[14px] font-semibold transition-all outline-none text-[#0F172A] placeholder-[#94A3B8] focus:bg-white ${
               errors.email 
                 ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                 : 'border-transparent hover:border-[#CBD5E1] focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10'
            }`}
          />
          {errors.email && <span className="text-[12px] font-bold text-red-500 mt-2 block">Institutional email is required</span>}
        </div>

        <div className="relative">
          <label className="block text-[13px] font-bold text-[#334155] mb-2">Access Protocol</label>
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
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="text-[12px] font-bold text-red-500 mt-2 block">Password is required</span>}
        </div>

        <div className="w-full flex justify-end mt-2 mb-6">
          <button type="button" className="text-[13px] font-bold text-[#64748B] hover:text-[#0F172A] transition-colors">
            Forgot Protocol?
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
            Establish Identity
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
        <h2 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">Establish ID</h2>
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
              placeholder="Student" 
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
              placeholder="Demo" 
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
           <label className="block text-[13px] font-bold text-[#334155] mb-2">Institutional Alias (Email)</label>
          <input 
            {...register('email')} 
            placeholder="student@sliit.lk" 
            className={`w-full px-5 py-3.5 bg-[#F1F5F9] border rounded-xl text-[14px] font-semibold transition-all outline-none text-[#0F172A] placeholder-[#94A3B8] focus:bg-white ${
               errors.email 
                 ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                 : 'border-transparent hover:border-[#CBD5E1] focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10'
            }`} 
          />
          {errors.email && <span className="text-[12px] font-bold text-red-500 mt-1 block">{errors.email.message}</span>}
        </div>

        <div className="relative">
          <label className="block text-[13px] font-bold text-[#334155] mb-2">Master Key (Password)</label>
          <div className="relative">
             <input 
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className={`w-full pl-5 pr-12 py-3.5 bg-[#F1F5F9] border rounded-xl text-[14px] font-semibold transition-all outline-none text-[#0F172A] placeholder-[#94A3B8] focus:bg-white ${
                 errors.password 
                   ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10' 
                   : 'border-transparent hover:border-[#CBD5E1] focus:border-[#F97316] focus:ring-4 focus:ring-[#F97316]/10'
              }`}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <span className="text-[12px] font-bold text-red-500 mt-1 block">{errors.password.message}</span>}
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#334155] mb-2">Verify Key</label>
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
              Establish Identity
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-10">
        <span className="text-[14px] font-medium text-[#64748B]">
          Already member?{' '}
          <button onClick={onSwitch} className="text-[#0ea5e9] font-bold hover:underline">
            Authenticate
          </button>
        </span>
      </div>
    </motion.div>
  );
};

export default AuthModule;
