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
          />
        ) : (
          <SignupView 
            key="signup" 
            onSwitch={toggleView} 
            showPassword={showPassword} 
            setShowPassword={setShowPassword}
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
}

const LoginView = ({ onSwitch, showPassword, setShowPassword }: ViewProps) => {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur'
  });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFormSubmit = async (data: LoginInput) => {
    try {
      const user = await login(data.email, data.password);
      toast.success('Authentication successful');
      if (user?.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Authentication failed';
      if (err.response?.status === 422) {
        toast.error(
          <div>
            <strong className="block mb-1">Validation Error</strong>
            {errorMessage.split(';').map((msg: string, i: number) => <span key={i} className="block text-xs">{msg.trim()}</span>)}
          </div>
        );
      } else if (err.response?.status === 401) {
        setError('email', { type: 'manual', message: 'Invalid email or password' });
        setError('password', { type: 'manual', message: 'Invalid email or password' });
        toast.error('Invalid email or password');
      } else {
        toast.error(errorMessage);
      }
    }
  };

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

      <h2 className="text-2xl font-black uppercase tracking-[0.2em] mb-2">SLIIT <span className="font-black">Nexar</span></h2>
      <p className="text-white/50 text-[10px] font-black uppercase tracking-widest mb-10">Access SLIIT Nexar System</p>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="w-full space-y-7">
        <div className="relative">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 ml-1 block">Official ID</label>
          <div className="relative">
            <input 
              {...register('email')}
              placeholder="name@sliit.lk"
              className="input-curated-dark"
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          </div>
          <div className="min-h-[20px] mt-1 ml-1 flex items-start">
            {errors.email && <span className="text-[8px] font-black text-rose-400 uppercase tracking-tighter">{errors.email.message}</span>}
          </div>
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
          <div className="min-h-[20px] mt-1 ml-1 flex items-start">
            {errors.password && <span className="text-[8px] font-black text-rose-400 uppercase tracking-tighter">{errors.password.message}</span>}
          </div>
        </div>

        <div className="flex justify-end items-center px-1">
          <a href="#" className="text-[9px] font-black uppercase text-white/30 hover:text-white transition-colors">Forgot Protocol?</a>
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
const SignupView = ({ onSwitch, showPassword, setShowPassword }: ViewProps) => {
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur'
  });
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleFormSubmit = async (data: SignupInput) => {
    try {
      const user = await signup(data);
      toast.success('Identity established successfully');
      if (user?.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      if (err.response?.status === 422) {
        toast.error(
          <div>
            <strong className="block mb-1">Validation Error</strong>
            {errorMessage.split(';').map((msg: string, i: number) => <span key={i} className="block text-xs">{msg.trim()}</span>)}
          </div>
        );
      } else if (err.response?.status === 409) {
        setError('email', { type: 'manual', message: 'An account with this email already exists' });
        toast.error('An account with this email already exists');
      } else {
        toast.error(errorMessage);
      }
    }
  };

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

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 ml-1 block">First Name</label>
            <input {...register('firstName')} placeholder="John" className="input-curated-dark" />
            <div className="min-h-[20px] mt-1 ml-1 flex items-start">
              {errors.firstName && <span className="text-[8px] font-black text-rose-400 uppercase tracking-tighter">{errors.firstName.message}</span>}
            </div>
          </div>
          <div className="relative">
            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 ml-1 block">Last Name</label>
            <input {...register('lastName')} placeholder="Doe" className="input-curated-dark" />
            <div className="min-h-[20px] mt-1 ml-1 flex items-start">
              {errors.lastName && <span className="text-[8px] font-black text-rose-400 uppercase tracking-tighter">{errors.lastName.message}</span>}
            </div>
          </div>
        </div>

        <div className="relative">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 ml-1 block">Institutional Alias</label>
          <div className="relative">
            <input {...register('email')} placeholder="name@sliit.lk" className="input-curated-dark" />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          </div>
          <div className="min-h-[20px] mt-1 ml-1 flex items-start">
            {errors.email && <span className="text-[8px] font-black text-rose-400 uppercase tracking-tighter">{errors.email.message}</span>}
          </div>
        </div>

        <div className="relative">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 ml-1 block">Master Key</label>
          <div className="relative">
            <input 
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="input-curated-dark"
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="min-h-[20px] mt-1 ml-1 flex items-start">
            {errors.password && <span className="text-[8px] font-black text-rose-400 uppercase tracking-tighter">{errors.password.message}</span>}
          </div>
        </div>

        <div className="relative">
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 ml-1 block">Verify Key</label>
          <div className="relative">
            <input 
              {...register('confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              className="input-curated-dark"
              placeholder="••••••••"
            />
            <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500/50" size={16} />
          </div>
          <div className="min-h-[20px] mt-1 ml-1 flex items-start">
            {errors.confirmPassword && <span className="text-[8px] font-black text-rose-400 uppercase tracking-tighter">{errors.confirmPassword.message}</span>}
          </div>
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
