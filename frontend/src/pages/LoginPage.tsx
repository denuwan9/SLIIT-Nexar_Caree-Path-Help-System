import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFields } from '../features/auth/authSchemas';
import { useAuth } from '../components/auth/AuthProvider';
import api from '../api/axios';
import { Lock, Mail, ArrowRight, Loader2, Cpu } from 'lucide-react';
import { AuthLayout } from '../features/auth/AuthLayout';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFields) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', data);
      const { token, user } = response.data.data;
      login(token, user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
        mode="login" 
        title="Access Core" 
        subtitle="Initialize Secure Neural Link"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Email Field with Floating Label */}
        <div className="relative group">
          <input
            {...register('email')}
            type="email"
            id="email"
            placeholder=" "
            className="peer w-full bg-white/5 border-b-2 border-white/10 pt-6 pb-2 px-0 text-white outline-none transition-all duration-300 focus:border-cobalt-electric group-hover:border-white/20"
          />
          <label 
            htmlFor="email"
            className="absolute left-0 top-6 text-slate-500 transition-all duration-300 pointer-events-none uppercase text-[10px] font-black tracking-widest peer-focus:top-0 peer-focus:text-cobalt-electric peer-[:not(:placeholder-shown)]:top-0"
          >
            Academic Identifier
          </label>
          <Mail className="absolute right-0 top-6 text-slate-600 group-focus-within:text-cobalt-electric transition-colors" size={16} />
          {errors.email && <p className="text-[10px] text-rose-500 font-mono mt-2 tracking-tighter">{errors.email.message}</p>}
        </div>

        {/* Password Field with Floating Label */}
        <div className="relative group">
          <input
            {...register('password')}
            type="password"
            id="password"
            placeholder=" "
            className="peer w-full bg-white/5 border-b-2 border-white/10 pt-6 pb-2 px-0 text-white outline-none transition-all duration-300 focus:border-cobalt-electric group-hover:border-white/20"
          />
          <label 
            htmlFor="password"
            className="absolute left-0 top-6 text-slate-500 transition-all duration-300 pointer-events-none uppercase text-[10px] font-black tracking-widest peer-focus:top-0 peer-focus:text-cobalt-electric peer-[:not(:placeholder-shown)]:top-0"
          >
            Secure Key / Token
          </label>
          <Lock className="absolute right-0 top-6 text-slate-600 group-focus-within:text-cobalt-electric transition-colors" size={16} />
          {errors.password && <p className="text-[10px] text-rose-500 font-mono mt-2 tracking-tighter">{errors.password.message}</p>}
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <p className="text-[11px] font-mono tracking-tighter uppercase">{error}</p>
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
                <Cpu size={18} className="rotate-0 group-hover/btn:rotate-90 transition-transform duration-500" />
                <span>Sync Account</span>
                <ArrowRight size={18} className="translate-x-0 group-hover/btn:translate-x-2 transition-transform duration-500" />
              </>
            )}
          </div>
        </button>

        <div className="flex flex-col gap-4 text-center">
          <Link 
            to="/signup" 
            className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-[0.2em]"
          >
            Request System Credentials [Register]
          </Link>
          <a 
            href="#" 
            className="text-[9px] font-mono text-slate-700 hover:text-slate-500 transition-colors uppercase tracking-widest"
          >
            Recover Encrypted Key?
          </a>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
