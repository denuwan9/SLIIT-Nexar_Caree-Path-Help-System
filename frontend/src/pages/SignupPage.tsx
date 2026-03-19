import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, type SignupFields } from '../features/auth/authSchemas';
import api from '../api/axios';
import { useAuth } from '../components/auth/AuthProvider';
import { User, Mail, GraduationCap, Briefcase, Lock, ArrowRight, Loader2, Sparkles, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';

const SignupPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, touchedFields },
  } = useForm<SignupFields>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: SignupFields) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/register', data);
      const { accessToken, data: userData } = response.data;
      login(accessToken, userData.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden auth-bg"
         style={{ backgroundImage: 'url("/images/auth-bg.png")' }}>
      {/* Decorative background elements */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 blur-[130px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-600/5 blur-[150px] rounded-full animate-pulse" 
           style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-[560px] z-10 animate-fade-in translate-y-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-5 backdrop-blur-xl">
            <Sparkles className="text-emerald-400" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Create Your <span className="text-emerald-400">Path</span></h1>
          <p className="text-slate-500 font-medium">Join the next generation of academic simulators</p>
        </div>

        <div className="glass-card rounded-[40px] p-8 md:p-12 relative overflow-hidden border-white/10">
          {/* Subtle line decoration */}
          <div className="absolute top-0 right-1/2 translate-x-1/2 w-1/4 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Identity</label>
                <div className="relative">
                  <input {...register('fullName')} className={clsx("glass-input w-full pl-4 pr-10 py-3 text-sm text-white transition-all duration-500", touchedFields.fullName && !errors.fullName && "input-valid", errors.fullName && "input-invalid")} placeholder="Full Name" />
                  <User size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Institutional Mail</label>
                <div className="relative">
                  <input {...register('eduEmail')} className={clsx("glass-input w-full pl-4 pr-10 py-3 text-sm text-white transition-all duration-500", touchedFields.eduEmail && !errors.eduEmail && "input-valid", errors.eduEmail && "input-invalid")} placeholder="name@uni.edu" />
                  <Mail size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Current Focus</label>
                <div className="relative">
                  <input {...register('currentMajor')} className={clsx("glass-input w-full pl-4 pr-10 py-3 text-sm text-white transition-all duration-500", touchedFields.currentMajor && !errors.currentMajor && "input-valid", errors.currentMajor && "input-invalid")} placeholder="Major" />
                  <GraduationCap size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Target Horizon</label>
                <div className="relative">
                  <input {...register('targetRole')} className={clsx("glass-input w-full pl-4 pr-10 py-3 text-sm text-white transition-all duration-500", touchedFields.targetRole && !errors.targetRole && "input-valid", errors.targetRole && "input-invalid")} placeholder="Role" />
                  <Briefcase size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Access Credentials</label>
              <div className="relative">
                <input {...register('password')} type="password" className={clsx("glass-input w-full pl-4 pr-10 py-3 text-sm text-white transition-all duration-500", touchedFields.password && !errors.password && "input-valid", errors.password && "input-invalid")} placeholder="Password (Min. 8 chars)" />
                <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
              </div>
              {errors.password && <p className="text-rose-500 text-[10px] mt-1 ml-1 font-medium">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Security Confirmation</label>
              <div className="relative">
                <input {...register('confirmPassword')} type="password" className={clsx("glass-input w-full pl-4 pr-10 py-3 text-sm text-white transition-all duration-500", touchedFields.confirmPassword && !errors.confirmPassword && "input-valid", errors.confirmPassword && "input-invalid")} placeholder="Confirm Password" />
                <Lock size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600" />
              </div>
              {errors.confirmPassword && <p className="text-rose-500 text-[10px] mt-1 ml-1 font-medium">{errors.confirmPassword.message}</p>}
            </div>

            {error && <div className="bg-rose-500/5 border border-rose-500/10 text-rose-500 text-xs py-3 rounded-2xl text-center font-medium">{error}</div>}

            <button type="submit" disabled={loading || !isValid} className="glass-button w-full py-4 flex items-center justify-center gap-3 group/btn hover:border-emerald-500/30">
              <span className="font-bold tracking-widest text-sm">LAUNCH PROFILE</span>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight className="group-hover/btn:translate-x-1 transition-transform" size={18} />}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2">
            <ShieldCheck className="text-slate-700" size={14} />
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-wider">Secure Enrollment Protocol</p>
          </div>
        </div>

        <div className="mt-8 text-center text-slate-400 text-sm">
          Already a member? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors ml-1 underline decoration-indigo-400/20 underline-offset-4">Authenticate</Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
