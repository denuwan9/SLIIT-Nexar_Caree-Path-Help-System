import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, UserCircle2, ArrowRight } from 'lucide-react';
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from './authSchemas';
import { useAuth } from '../../components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import nexarLogo from '../../assets/sliit-nexar-logo.png';

interface AuthModuleProps {
  initialView?: 'login' | 'signup';
}

const AuthModule: React.FC<AuthModuleProps> = ({ initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'signup'>(initialView);
  const [showPassword, setShowPassword] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const toggleView = () => setView(v => v === 'login' ? 'signup' : 'login');

  return (
    <div className="w-full flex-1">
      <div className="flex items-center justify-between mb-16 w-full">
         <img src={nexarLogo} alt="SLIIT Nexar Logo" className="h-[36px] w-auto object-contain" />
         <button 
           onClick={toggleView}
           className="flex items-center gap-2 text-[#4B5563] hover:text-[#111827] font-semibold text-[14px] transition-colors"
         >
           <UserCircle2 size={18} />
           {view === 'login' ? 'Establish Identity' : 'Authenticate'}
         </button>
      </div>

      <AnimatePresence mode="wait">
        {view === 'login' ? (
          <LoginView 
            key="login" 
            onSwitch={toggleView} 
            showPassword={showPassword} 
            setShowPassword={setShowPassword}
            onSubmit={async (data) => {
              try {
                const user = await login(data.email, data.password);
                toast.success('Authentication successful');
                if (user?.role === 'admin') {
                  navigate('/admin');
                } else {
                  navigate('/dashboard');
                }
              } catch (err: any) {
                toast.error(err.response?.data?.message || 'Authentication failed');
              }
            }}
          />
        ) : (
          <SignupView 
            key="signup" 
            onSwitch={toggleView} 
            showPassword={showPassword} 
            setShowPassword={setShowPassword}
            onSubmit={async (data) => {
              try {
                const user = await signup(data);
                toast.success('Identity established successfully');
                if (user?.role === 'admin') {
                  navigate('/admin');
                } else {
                  navigate('/dashboard');
                }
              } catch (err: any) {
                toast.error(err.response?.data?.message || 'Registration failed');
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* --- Authenticate (Login) View --- */
interface ViewProps {
  onSwitch: () => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
}

const LoginView = ({ onSwitch, showPassword, setShowPassword, onSubmit }: ViewProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="w-full flex md:block flex-col items-center text-center md:text-left"
    >
      <div className="w-full mb-10">
        <h2 className="text-[32px] font-bold text-[#1F2937] mb-2 tracking-tight">Welcome to SLIIT Nexar</h2>
        <p className="text-[#9CA3AF] text-[14px] font-medium">Please login to your system account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5 text-left">
        <div>
          <label className="block text-[13px] font-semibold text-[#4B5563] mb-2">Official ID</label>
          <input 
            {...register('email')}
            placeholder="student@sliit.lk"
            className="w-full px-5 py-3.5 bg-[#F9FAFB] border border-gray-200 hover:border-gray-300 rounded-xl text-[14px] font-medium focus:bg-white focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/10 transition-all outline-none text-gray-900 placeholder-[#9CA3AF]"
          />
          {errors.email && <span className="text-[12px] font-bold text-red-500 mt-2 block">{errors.email.message}</span>}
        </div>

        <div className="relative">
          <label className="block text-[13px] font-semibold text-[#4B5563] mb-2">Access Protocol</label>
          <input 
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="w-full pl-5 pr-12 py-3.5 bg-[#F9FAFB] border border-gray-200 hover:border-gray-300 rounded-xl text-[14px] font-medium focus:bg-white focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/10 transition-all outline-none text-gray-900 placeholder-[#9CA3AF]"
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-[38px] text-[#9CA3AF] hover:text-gray-700 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          
          <div className="w-full flex justify-end mt-3">
            <button type="button" className="text-[13px] font-medium text-[#4B5563] hover:text-[#F59E0B] transition-colors">
              Forgot Protocol?
            </button>
          </div>
          {errors.password && <span className="text-[12px] font-bold text-red-500 mt-1 block">{errors.password.message}</span>}
        </div>

        <button 
          disabled={isSubmitting}
          type="submit" 
          className="w-full py-3.5 mt-4 rounded-xl text-white font-bold text-[15px] bg-[#F39121] hover:bg-[#E27D15] transition-all shadow-[0_4px_14px_0_rgba(245,158,11,0.25)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.35)] disabled:opacity-70 flex justify-center items-center h-[54px] gap-2"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
             <>Login to Nexar <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <div className="w-full text-center mt-10 text-[14px] font-medium text-[#6B7280]">
        Are you new?{' '}
        <button onClick={onSwitch} className="text-[#10B981] font-bold hover:underline">
          Establish Identity
        </button>
      </div>
    </motion.div>
  );
};

/* --- Register (Signup) View --- */
const SignupView = ({ onSwitch, showPassword, setShowPassword, onSubmit }: ViewProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur'
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="w-full flex md:block flex-col items-center text-center md:text-left"
    >
      <div className="w-full mb-8">
        <h2 className="text-[32px] font-bold text-[#1F2937] mb-2 tracking-tight">Create Account</h2>
        <p className="text-[#9CA3AF] text-[14px] font-medium">Provision Institutional Access</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4 text-left">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-semibold text-[#4B5563] mb-2">First Name</label>
            <input 
              {...register('firstName')} 
              placeholder="Student" 
              className="w-full px-5 py-3.5 bg-[#F9FAFB] border border-gray-200 hover:border-gray-300 rounded-xl text-[14px] font-medium focus:bg-white focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/10 transition-all outline-none text-gray-900 placeholder-[#9CA3AF]" 
            />
            {errors.firstName && <span className="text-[12px] font-bold text-red-500 mt-1 block">{errors.firstName.message}</span>}
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-[#4B5563] mb-2">Last Name</label>
            <input 
              {...register('lastName')} 
              placeholder="Demo" 
              className="w-full px-5 py-3.5 bg-[#F9FAFB] border border-gray-200 hover:border-gray-300 rounded-xl text-[14px] font-medium focus:bg-white focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/10 transition-all outline-none text-gray-900 placeholder-[#9CA3AF]" 
            />
            {errors.lastName && <span className="text-[12px] font-bold text-red-500 mt-1 block">{errors.lastName.message}</span>}
          </div>
        </div>

        <div>
           <label className="block text-[13px] font-semibold text-[#4B5563] mb-2">Institutional Alias (Email)</label>
          <input 
            {...register('email')} 
            placeholder="student@sliit.lk" 
            className="w-full px-5 py-3.5 bg-[#F9FAFB] border border-gray-200 hover:border-gray-300 rounded-xl text-[14px] font-medium focus:bg-white focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/10 transition-all outline-none text-gray-900 placeholder-[#9CA3AF]" 
          />
          {errors.email && <span className="text-[12px] font-bold text-red-500 mt-1 block">{errors.email.message}</span>}
        </div>

        <div className="relative">
          <label className="block text-[13px] font-semibold text-[#4B5563] mb-2">Master Key (Password)</label>
          <input 
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="w-full px-5 pr-12 py-3.5 bg-[#F9FAFB] border border-gray-200 hover:border-gray-300 rounded-xl text-[14px] font-medium focus:bg-white focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/10 transition-all outline-none text-gray-900 placeholder-[#9CA3AF]"
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-5 top-[38px] text-[#9CA3AF] hover:text-gray-700 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          {errors.password && <span className="text-[12px] font-bold text-red-500 mt-1 block">Protocol Violation</span>}
        </div>

        <div>
          <label className="block text-[13px] font-semibold text-[#4B5563] mb-2">Verify Key</label>
          <input 
            {...register('confirmPassword')}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="w-full px-5 py-3.5 bg-[#F9FAFB] border border-gray-200 hover:border-gray-300 rounded-xl text-[14px] font-medium focus:bg-white focus:border-[#F59E0B] focus:ring-4 focus:ring-[#F59E0B]/10 transition-all outline-none text-gray-900 placeholder-[#9CA3AF]"
          />
          {errors.confirmPassword && <span className="text-[12px] font-bold text-red-500 mt-1 block">{errors.confirmPassword.message}</span>}
        </div>

        <button 
          disabled={isSubmitting}
          type="submit" 
          className="w-full py-3.5 mt-6 rounded-xl text-white font-bold text-[15px] bg-[#F39121] hover:bg-[#E27D15] transition-all shadow-[0_4px_14px_0_rgba(245,158,11,0.25)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.35)] disabled:opacity-70 flex justify-center items-center h-[54px] gap-2"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
              <>Establish Identity <ArrowRight size={18} /></>
          )}
        </button>
      </form>

      <div className="w-full text-center mt-8 text-[14px] font-medium text-[#6B7280]">
        Already member?{' '}
        <button onClick={onSwitch} className="text-[#10B981] font-bold hover:underline">
          Authenticate
        </button>
      </div>
    </motion.div>
  );
};

export default AuthModule;
