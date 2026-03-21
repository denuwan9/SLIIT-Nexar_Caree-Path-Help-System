import React, { useEffect } from 'react';
import { useSystemBoot } from '../hooks/useSystemBoot';
import { useAuth } from '../components/auth/AuthProvider';
import { DashboardSkeleton } from '../components/ui/DashboardSkeleton';
import { 
    LayoutDashboard, 
    User, 
    Settings, 
    Bell, 
    ShieldCheck, 
    ArrowUpRight,
    Search,
    UserCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const { boot, bootData, isLoading, error } = useSystemBoot();
    const navigate = useNavigate();

    useEffect(() => {
        boot();
    }, [boot]);

    if (isLoading || !bootData) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-silver-ultra font-main">
                <div className="soft-glass p-8 text-center max-w-md">
                    <h2 className="text-xl font-black text-rose-500 uppercase tracking-widest mb-4">Boot Error</h2>
                    <p className="text-slate-soft text-sm mb-6">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-cobalt-sliit text-white rounded-lg font-bold text-xs uppercase"
                    >
                        Re-initialize System
                    </button>
                </div>
            </div>
        );
    }

    const { UserPermissions, DashboardState, ProfileData } = bootData;

    return (
        <div className="min-h-screen bg-silver-ultra font-main text-slate-800 p-8">
            {/* Top Navigation Bar */}
            <header className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-cobalt-sliit uppercase tracking-[0.3em]">Institutional Node</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-success animate-pulse" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
                            Nexar <span className="text-cobalt-sliit">Command</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="relative group hidden md:block">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            placeholder="SEARCH CORE..." 
                            className="bg-white border border-slate-200 rounded-full pl-10 pr-4 py-2 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-cobalt-sliit transition-all w-64"
                        />
                    </div>
                    {/* Settings icon — shows user avatar */}
                    <button
                        onClick={() => navigate('/settings')}
                        title="Account Settings"
                        className="relative w-11 h-11 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 hover:border-cobalt-sliit hover:shadow-lg transition-all group"
                    >
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Settings" className="w-full h-full object-cover" />
                        ) : (
                            <Settings size={20} className="absolute inset-0 m-auto text-slate-400 group-hover:text-cobalt-sliit transition-colors" />
                        )}
                    </button>
                    <div className="flex items-center gap-3 soft-glass p-1 pr-4 rounded-full border border-slate-200 bg-white">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                            {user?.avatarUrl ? <img src={user.avatarUrl} alt="Avatar" /> : <User size={20} className="text-slate-400" />}
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] font-black uppercase text-slate-900 leading-none">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <span className="text-[8px] font-bold text-cobalt-sliit uppercase tracking-tighter">
                                {UserPermissions.role}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Bento Grid Command Center */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                {/* Profile Snapshot */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="md:col-span-2 bg-white border border-slate-100 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500"
                >
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-12">
                            <div className="p-3 bg-cobalt-sliit/5 rounded-2xl text-cobalt-sliit">
                                <LayoutDashboard size={24} />
                            </div>
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-emerald-success/10 text-emerald-success text-[10px] font-black uppercase rounded-full">Active Path</span>
                                <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase rounded-full border border-slate-100">V2.5</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight">Career Architecture</h2>
                        <p className="text-slate-soft text-sm mb-8 font-medium max-w-xs italic">
                            Currently optimized for <span className="text-cobalt-sliit font-bold">{ProfileData?.targetRole || 'Not Set'}</span> path discovery.
                        </p>
                        <button className="flex items-center gap-2 text-cobalt-sliit text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                            Configure Stream <ArrowUpRight size={14} />
                        </button>
                    </div>
                    {/* Background Graphic */}
                    <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-cobalt-sliit/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-cobalt-sliit/10 transition-colors" />
                </motion.div>

                {/* Notifications Module */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500"
                >
                    <div className="flex justify-between items-center mb-8">
                        <div className="p-3 bg-rose-500/5 rounded-2xl text-rose-500">
                            <Bell size={24} />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-rose-500 animate-ping rounded-full opacity-20" />
                            <span className="relative w-6 h-6 flex items-center justify-center bg-rose-500 text-white text-[10px] font-black rounded-full">
                                {DashboardState.unreadNotifications}
                            </span>
                        </div>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Protocol Alerts</h3>
                    <p className="text-slate-soft text-[11px] font-medium leading-relaxed mb-6">
                        Latest system updates and institutional requests pending your review.
                    </p>
                    <div className="space-y-2">
                        {[1, 2].map(i => (
                            <div key={i} className="h-2 bg-slate-50 rounded-full w-full" />
                        ))}
                        <div className="h-2 bg-slate-50 rounded-full w-3/4" />
                    </div>
                </motion.div>

                {/* System Permissions */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500"
                >
                    <div className="p-3 bg-emerald-success/5 rounded-2xl text-emerald-success inline-block mb-8">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Security Level</h3>
                    <div className="flex items-end gap-2 mb-6">
                        <span className="text-4xl font-black text-slate-900 leading-none">{UserPermissions.accessLevel}</span>
                        <span className="text-[10px] font-black text-slate-300 uppercase mb-1">Clearance</span>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-success" />
                            <span className="text-[9px] font-black uppercase text-slate-500">Neural Sync</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-success" />
                            <span className="text-[9px] font-black uppercase text-slate-500">Data Crypt</span>
                        </div>
                    </div>
                </motion.div>

                {/* System Settings & Configuration (Wide) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="md:col-span-3 bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl transition-all duration-500"
                >
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-100 rounded-2xl text-slate-500">
                                <Settings size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Configuration</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Global Session Parameters</p>
                            </div>
                        </div>
                        <div className="h-px bg-slate-100 flex-grow mx-8" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">v2.5.0-STABLE</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Sync Node</p>
                            <p className="text-sm font-bold text-slate-800">SLIIT-EAST-01</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Last Boot</p>
                            <p className="text-sm font-bold text-slate-800">{new Date(DashboardState.lastSync).toLocaleTimeString()}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Auth Mode</p>
                            <p className="text-sm font-bold text-slate-800">MULTI-LINK</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Environment</p>
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-success text-sm font-black italic">PROD</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ─── Profile Completeness Card ─────────────────────── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 group"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-3 bg-cobalt-sliit/5 rounded-2xl text-cobalt-sliit">
                            <UserCircle2 size={24} />
                        </div>
                        <span
                            className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${
                                (ProfileData?.profileCompleteness ?? 0) >= 80
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : (ProfileData?.profileCompleteness ?? 0) >= 50
                                    ? 'bg-amber-500/10 text-amber-600'
                                    : 'bg-rose-500/10 text-rose-500'
                            }`}
                        >
                            {
                                (ProfileData?.profileCompleteness ?? 0) >= 80
                                    ? 'Strong'
                                    : (ProfileData?.profileCompleteness ?? 0) >= 50
                                    ? 'Building'
                                    : 'Needs Work'
                            }
                        </span>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-1">Profile Strength</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-5">Identity Completeness Score</p>

                    {/* Percentage Number */}
                    <div className="flex items-end gap-1 mb-4">
                        <span className="text-5xl font-black text-slate-900 leading-none">
                            {ProfileData?.profileCompleteness ?? 0}
                        </span>
                        <span className="text-xl font-black text-slate-300 mb-1">%</span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-6">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${ProfileData?.profileCompleteness ?? 0}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                            className={`h-full rounded-full ${
                                (ProfileData?.profileCompleteness ?? 0) >= 80
                                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                                    : (ProfileData?.profileCompleteness ?? 0) >= 50
                                    ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                                    : 'bg-gradient-to-r from-rose-400 to-rose-600'
                            }`}
                        />
                    </div>

                    {/* CTA */}
                    <button
                        onClick={() => navigate('/profile?tab=edit')}
                        className="flex items-center gap-2 text-cobalt-sliit text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all"
                    >
                        Complete Profile <ArrowUpRight size={14} />
                    </button>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-cobalt-sliit rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-2xl shadow-cobalt-sliit/40 group relative overflow-hidden"
                >
                    <div className="relative z-10">
                        <div className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <ArrowUpRight className="text-white" size={32} />
                        </div>
                        <button className="text-[11px] font-black text-white uppercase tracking-[0.3em] hover:tracking-[0.4em] transition-all">
                            Initialize<br/>Link Discovery
                        </button>
                    </div>
                    {/* Ring animation */}
                    <div className="absolute inset-0 border-[20px] border-white/5 rounded-full scale-150 animate-float" />
                </motion.div>
            </div>

            {/* Support links */}
            <footer className="mt-16 flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                <div className="flex gap-8">
                    <a href="#" className="hover:text-cobalt-sliit transition-colors">Documentation</a>
                    <a href="#" className="hover:text-cobalt-sliit transition-colors">Privacy Protocol</a>
                </div>
                <div>© 2026 SLIIT NEXAR DIGITAL SYSTEMS</div>
            </footer>
        </div>
    );
};

export default Dashboard;
