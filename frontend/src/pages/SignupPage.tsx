import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFields } from '../features/auth/authSchemas';
import api from '../api/axios';
import { useAuth } from '../components/auth/AuthProvider';
import { User, Mail, Lock, ArrowRight, Loader2, Database, Sparkles } from 'lucide-react';
import { AuthLayout } from '../features/auth/AuthLayout';
import { PasswordStrengthMeter } from '../features/auth/PasswordStrengthMeter';
import { motion } from 'framer-motion';

const SignupPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupFields>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  });

  const password = watch('password', '');

  const onSubmit = async (data: SignupFields) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
        mode="signup" 
        title="Construct Identity" 
        subtitle="Provision Institutional Access"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative group">
            <input
              {...register('firstName')}
              type="text"
              id="firstName"
              placeholder=" "
              className="peer w-full bg-white/5 border-b-2 border-white/10 pt-6 pb-2 px-0 text-white outline-none transition-all duration-300 focus:border-cobalt-electric group-hover:border-white/20 text-sm"
            />
            <label 
              htmlFor="firstName"
              className="absolute left-0 top-6 text-slate-500 transition-all duration-300 pointer-events-none uppercase text-[9px] font-black tracking-widest peer-focus:top-0 peer-focus:text-cobalt-electric peer-[:not(:placeholder-shown)]:top-0"
            >
              First Name
            </label>
            <User className="absolute right-0 top-6 text-slate-600 group-focus-within:text-cobalt-electric transition-colors" size={14} />
            {errors.firstName && <p className="text-[9px] text-rose-500 font-mono mt-1 tracking-tighter">{errors.firstName.message}</p>}
          </div>

          <div className="relative group">
            <input
              {...register('lastName')}
              type="text"
              id="lastName"
              placeholder=" "
              className="peer w-full bg-white/5 border-b-2 border-white/10 pt-6 pb-2 px-0 text-white outline-none transition-all duration-300 focus:border-cobalt-electric group-hover:border-white/20 text-sm"
            />
            <label 
              htmlFor="lastName"
              className="absolute left-0 top-6 text-slate-500 transition-all duration-300 pointer-events-none uppercase text-[9px] font-black tracking-widest peer-focus:top-0 peer-focus:text-cobalt-electric peer-[:not(:placeholder-shown)]:top-0"
            >
              Last Name
            </label>
            <User className="absolute right-0 top-6 text-slate-600 group-focus-within:text-cobalt-electric transition-colors" size={14} />
            {errors.lastName && <p className="text-[9px] text-rose-500 font-mono mt-1 tracking-tighter">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="relative group">
          <input
            {...register('email')}
            type="email"
            id="email"
            placeholder=" "
            className="peer w-full bg-white/5 border-b-2 border-white/10 pt-6 pb-2 px-0 text-white outline-none transition-all duration-300 focus:border-cobalt-electric group-hover:border-white/20 text-sm"
          />
          <label 
            htmlFor="email"
            className="absolute left-0 top-6 text-slate-500 transition-all duration-300 pointer-events-none uppercase text-[9px] font-black tracking-widest peer-focus:top-0 peer-focus:text-cobalt-electric peer-[:not(:placeholder-shown)]:top-0"
          >
            SLIIT Institutional Identifier
          </label>
          <Mail className="absolute right-0 top-6 text-slate-600 group-focus-within:text-cobalt-electric transition-colors" size={14} />
          {errors.email && <p className="text-[9px] text-rose-500 font-mono mt-1 tracking-tighter">{errors.email.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4 items-start">
          <div className="relative group">
            <input
              {...register('password')}
              type="password"
              id="password"
              placeholder=" "
              className="peer w-full bg-white/5 border-b-2 border-white/10 pt-6 pb-2 px-0 text-white outline-none transition-all duration-300 focus:border-cobalt-electric group-hover:border-white/20 text-sm"
            />
            <label 
              htmlFor="password"
              className="absolute left-0 top-6 text-slate-500 transition-all duration-300 pointer-events-none uppercase text-[9px] font-black tracking-widest peer-focus:top-0 peer-focus:text-cobalt-electric peer-[:not(:placeholder-shown)]:top-0"
            >
              Master Key
            </label>
            <Lock className="absolute right-0 top-6 text-slate-600 group-focus-within:text-cobalt-electric transition-colors" size={14} />
          </div>

          <div className="relative group">
            <input
              {...register('confirmPassword')}
              type="password"
              id="confirmPassword"
              placeholder=" "
              className="peer w-full bg-white/5 border-b-2 border-white/10 pt-6 pb-2 px-0 text-white outline-none transition-all duration-300 focus:border-cobalt-electric group-hover:border-white/20 text-sm"
            />
            <label 
              htmlFor="confirmPassword"
              className="absolute left-0 top-6 text-slate-500 transition-all duration-300 pointer-events-none uppercase text-[9px] font-black tracking-widest peer-focus:top-0 peer-focus:text-cobalt-electric peer-[:not(:placeholder-shown)]:top-0"
            >
              Verify Key
            </label>
            <Lock className="absolute right-0 top-6 text-slate-600 group-focus-within:text-cobalt-electric transition-colors" size={14} />
          </div>
        </div>

        {/* Dynamic Entropy Analyzer */}
        <PasswordStrengthMeter password={password} />
        {errors.password && <p className="text-[9px] text-rose-500 font-mono mt-1 tracking-tighter">{errors.password.message}</p>}
        {errors.confirmPassword && <p className="text-[9px] text-rose-500 font-mono mt-1 tracking-tighter">{errors.confirmPassword.message}</p>}

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center gap-3"
          >
            <Sparkles size={16} />
            <p className="text-[10px] font-mono tracking-tighter uppercase">{error}</p>
          </motion.div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full group/btn relative h-14 bg-white text-black font-black uppercase text-xs tracking-[0.2em] rounded-2xl overflow-hidden active:scale-[0.98] transition-all disabled:opacity-50"
        >
          <div className="absolute inset-0 bg-cobalt-electric translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
          <div className="relative flex items-center justify-center gap-3 group-hover/btn:text-white transition-colors">
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Database size={18} className="rotate-0 group-hover/btn:rotate-180 transition-transform duration-500" />
                <span>Initialize Core Profile</span>
                <ArrowRight size={18} className="translate-x-0 group-hover/btn:translate-x-2 transition-transform duration-500" />
              </>
            )}
          </div>
        </button>

        <div className="text-center">
          <Link 
            to="/login" 
            className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em]"
          >
            Existing Credentials Detected? Login
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignupPage;
