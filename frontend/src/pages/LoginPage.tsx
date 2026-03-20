import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFields } from '../features/auth/authSchemas';
import { useAuth } from '../components/auth/AuthProvider';
import api from '../api/axios';
import { Lock, Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { clsx } from 'clsx';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: LoginFields) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', data);
      const { accessToken, data: userData } = response.data;
      login(accessToken, userData.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative auth-bg"
         style={{ backgroundImage: 'url("/images/auth-bg.png")' }}>
      {/* Decorative background elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/10 blur-[150px] rounded-full animate-pulse" 
           style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-[440px] z-10 animate-fade-in">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 backdrop-blur-xl">
            <Sparkles className="text-indigo-400" size={32} />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
            Nexar <span className="text-indigo-400">Simulator</span>
          </h1>
          <p className="text-slate-400 font-medium">Precision Mapping for Professional Paths</p>
        </div>

        <div className="glass-card rounded-[32px] p-8 md:p-10 relative group">
          {/* Subtle line decoration */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Academic Identifier</label>
              <div className="relative group">
                <input
                  {...register('email')}
                  className={clsx(
                    "glass-input w-full pl-5 pr-12 py-4 text-white placeholder:text-slate-600 transition-all duration-500",
                    touchedFields.email && !errors.email && "input-valid",
                    errors.email && "input-invalid"
                  )}
                  placeholder="name@university.edu"
                />
                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
              </div>
              {errors.email && <p className="text-rose-500 text-[11px] mt-1 ml-1 font-medium">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Secure Credentials</label>
              </div>
              <div className="relative group">
                <input
                  {...register('password')}
                  type="password"
                  className={clsx(
                    "glass-input w-full pl-5 pr-12 py-4 text-white placeholder:text-slate-600 transition-all duration-500",
                    touchedFields.password && !errors.password && "input-valid",
                    errors.password && "input-invalid"
                  )}
                  placeholder="••••••••"
                />
                <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
              </div>
              {errors.password && <p className="text-rose-500 text-[11px] mt-1 ml-1 font-medium">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="bg-rose-500/5 border border-rose-500/10 text-rose-500 text-xs py-3 px-4 rounded-xl text-center font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isValid}
              className="glass-button w-full py-4 relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 transition-transform duration-500 translate-y-full group-hover/btn:translate-y-0" />
              <div className="relative flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                  <>
                    <span className="font-bold tracking-wide">INITIALIZE SESSION</span>
                    <ArrowRight className="group-hover/btn:translate-x-1 transition-transform" size={20} />
                  </>
                )}
              </div>
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-500 text-sm">
              Incomplete Profile? <Link to="/signup" className="text-white hover:text-indigo-400 font-bold transition-colors ml-1 underline decoration-white/20 underline-offset-4">Register Now</Link>
            </p>
          </div>
        </div>
        
        {/* Footer info */}
        <p className="text-center text-slate-600 text-[10px] mt-8 uppercase tracking-[0.2em]">
          Secured by SLIIT Nexar Protocol
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
