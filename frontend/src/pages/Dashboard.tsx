import React, { useEffect } from 'react';
import { useSystemBoot } from '../hooks/useSystemBoot';
import { useAuth } from '../components/auth/AuthProvider';
import { DashboardSkeleton } from '../components/ui/DashboardSkeleton';
import { 
    LayoutDashboard, 
    User, 
    Settings, 
    ArrowUpRight,
    Search,
    UserCircle2,
    Calendar,
    BookOpen
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



                {/* Interview Bookings Snapshot */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    onClick={() => navigate('/interviews')}
                    className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group"
                >
                    <div className="flex justify-between items-start mb-8">
                        <div className="p-3 bg-indigo-500/5 rounded-2xl text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                            <Calendar size={24} />
                        </div>
                        <ArrowUpRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">
                        {UserPermissions.isAdmin ? 'System Bookings' : 'My Interviews'}
                    </h3>
                    <div className="flex items-end gap-2 mb-4">
                        <span className="text-4xl font-black text-slate-900 leading-none">
                            {DashboardState.interviewBookings || 0}
                        </span>
                        <span className="text-[10px] font-black text-slate-300 uppercase mb-1">Active</span>
                    </div>
                    <p className="text-slate-soft text-[10px] font-bold uppercase tracking-widest">
                        {UserPermissions.isAdmin ? 'Total scheduled slots' : 'Upcoming sessions'}
                    </p>
                </motion.div>

                {/* Active Study Plan (Wide) */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="md:col-span-3 bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl transition-all duration-500"
                >
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Active Study Plan</h3>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{ProfileData?.targetRole || 'Software Engineering'} Track</p>
                            </div>
                        </div>
                        <div className="h-px bg-slate-100 flex-grow mx-8" />
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase tracking-widest">In Progress</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Current Module</p>
                            <p className="text-sm font-bold text-slate-800 line-clamp-1">Advanced Algorithms</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Next Milestone</p>
                            <p className="text-sm font-bold text-slate-800 line-clamp-1">System Design Mock</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Est. Completion</p>
                            <p className="text-sm font-bold text-slate-800">4 Weeks</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Overall Progress</p>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: '65%' }}
                                        transition={{ duration: 1, delay: 0.5 }}
                                        className="h-full bg-indigo-500 rounded-full" 
                                    />
                                </div>
                                <span className="text-indigo-600 text-sm font-black">65%</span>
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
