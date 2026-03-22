import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { loginSchema, signupSchema, type LoginInput, type SignupInput } from './authSchemas';
import { useAuth } from '../../components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AuthModuleProps {
  initialView?: 'login' | 'signup';
}

const AuthModule: React.FC<AuthModuleProps> = ({ initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'signup'>(initialView);
  const [showPassword, setShowPassword] = useState(false);

  const toggleView = () => setView(v => v === 'login' ? 'signup' : 'login');

  return (
    <div className="relative w-full overflow-hidden min-h-[640px] flex items-center justify-center py-10">
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
      initial={{ rotateY: 90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: -90, opacity: 0 }}
      transition={{ duration: 0.6, ease: "circOut" }}
      className="curated-glass w-full rounded-[2.5rem] p-10 md:p-12 text-white relative flex flex-col items-center shadow-2xl"
    >
      <div className="w-24 h-24 mb-6 flex items-center justify-center">
        <img src="/logo.png" alt="SLIIT Nexar Logo" className="w-full h-full object-contain" />
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
          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-2 ml-1 block">Access Protocol</label>
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

        <div className="flex justify-end items-center px-1">
          <a href="#" className="text-[9px] font-black uppercase text-white/30 hover:text-white transition-colors">Forgot Protocol?</a>
        </div>

        <button 
          disabled={isSubmitting}
          type="submit" 
          className="btn-gradient-blue w-full h-14 flex items-center justify-center gap-3 mt-4"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
            <>
              Login to Nexar
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <button 
        onClick={onSwitch}
        className="mt-10 text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors tracking-widest"
      >
        New System Member? <span className="text-white border-b border-white/20 pb-0.5 ml-1">Establish Identity</span>
      </button>
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
      initial={{ rotateY: -90, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      exit={{ rotateY: 90, opacity: 0 }}
      transition={{ duration: 0.6, ease: "circOut" }}
      className="curated-glass w-full rounded-[2.5rem] p-10 md:p-12 text-white relative shadow-2xl"
    >
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 mb-4">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-[0.2em] mb-2 text-center">Establish ID</h2>
        <p className="text-white/50 text-[10px] font-black uppercase tracking-widest text-center">Provision Institutional Access</p>
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
          className="btn-gradient-blue w-full h-14 flex items-center justify-center gap-3 mt-6"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
            <>
              Establish Identity
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="text-center mt-8">
        <button 
          onClick={onSwitch}
          className="text-[10px] font-black uppercase text-white/40 hover:text-white transition-colors tracking-widest"
        >
          Already member? <span className="text-white border-b border-white/20 pb-0.5 ml-1">Authenticate</span>
        </button>
      </div>
    </motion.div>
  );
};

export default AuthModule;
