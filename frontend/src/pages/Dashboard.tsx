import React from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import {
    MessageSquare,
    Zap,
    Users,
    Bell,
    ChevronRight
} from 'lucide-react';

const BentoCard: React.FC<{
    children: React.ReactNode,
    className?: string,
    title?: string,
    subtitle?: string
}> = ({ children, className = "", title, subtitle }) => (
    <div className={`card group flex flex-col items-start ${className}`}>
        {(title || subtitle) && (
            <div className="mb-8 w-full">
                {title && <h3 className="text-slate-900 font-extrabold tracking-tight text-2xl">{title}</h3>}
                {subtitle && <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{subtitle}</p>}
            </div>
        )}
        <div className="flex-1 w-full">
            {children}
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="flex flex-col gap-12">
            {/* Header Content with User Actions */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] mb-3">Dashboard A: Modern Bento Grid</p>
                    <h2 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">
                        Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">{user?.name.split(' ')[0]}!</span>
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-white/40 p-1.5 rounded-2xl border border-white scrollbar-hide overflow-hidden">
                        <button className="p-3 text-slate-500 hover:text-purple-600 transition-colors">
                            <Bell size={20} />
                        </button>
                        <div className="w-px h-6 bg-slate-200 mx-1"></div>
                        <div className="flex items-center gap-3 pl-2 pr-4">
                            <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white shadow-sm">
                                <img src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} alt={user?.name} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Bento Grid Layout - Dashboard A Style */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

                {/* Profile Readiness - Large Feature Card (White Glass) */}
                <BentoCard
                    className="md:col-span-12 lg:col-span-7 p-12"
                    title="Profile Readiness"
                >
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="relative w-72 h-72 flex items-center justify-center">
                            {/* Outer Glow */}
                            <div className="absolute inset-0 bg-purple-500/10 blur-[60px] rounded-full"></div>

                            <svg className="w-full h-full transform -rotate-90 relative z-10">
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="45%"
                                    className="stroke-slate-200 fill-none"
                                    strokeWidth="10"
                                />
                                <circle
                                    cx="50%"
                                    cy="50%"
                                    r="45%"
                                    className="stroke-purple-500 fill-none transition-all duration-1000 ease-out"
                                    strokeWidth="14"
                                    strokeDasharray="283"
                                    strokeDashoffset="51"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center z-20">
                                <span className="text-7xl font-black text-slate-900 leading-none tracking-tighter">82%</span>
                                <span className="text-slate-400 text-[11px] font-black uppercase tracking-widest mt-2">Ammunial</span>
                            </div>
                        </div>

                        <div className="flex-1 w-full space-y-8">
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Skills</span>
                                    <span className="text-sm font-black text-slate-900">90%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 w-[90%] rounded-full shadow-[0_0_15px_rgba(157,80,255,0.3)]"></div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Experience</span>
                                    <span className="text-sm font-black text-slate-900">65%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 w-[65%] rounded-full shadow-[0_0_15px_rgba(157,80,255,0.3)]"></div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Portfolio</span>
                                    <span className="text-sm font-black text-slate-900">75%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 w-[75%] rounded-full shadow-[0_0_15px_rgba(157,80,255,0.3)]"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </BentoCard>

                {/* Right Top Column: Interview Slots */}
                <div className="md:col-span-12 lg:col-span-5 grid grid-cols-1 gap-10">
                    <BentoCard
                        title="Interview Slots"
                    >
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl p-6 border border-white shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-3xl rounded-full"></div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Readiness</p>
                                <span className="text-4xl font-black text-slate-900 italic tracking-tighter">82%</span>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full mt-4">
                                    <div className="h-full bg-blue-500 w-[82%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"></div>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl p-6 border border-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden relative">
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Upcoming Interviews</p>
                                    <span className="text-4xl font-black text-slate-900 tracking-tighter">2 <span className="text-lg text-slate-400 font-bold ml-1">Slots</span></span>
                                </div>
                                <div className="flex gap-1.5 mt-4">
                                    <div className="h-1.5 flex-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                                    <div className="h-1.5 flex-1 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
                                </div>
                            </div>

                            <div className="col-span-2 bg-gradient-to-r from-slate-100 to-white rounded-3xl p-6 border border-white flex items-center justify-between group cursor-pointer hover:bg-slate-50 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                                        <Zap className="text-purple-500" size={18} />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Upcoming Slots</p>
                                        <span className="text-slate-900 font-bold">1 Interview</span>
                                    </div>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform" size={20} />
                            </div>

                            <div className="col-span-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl p-6 border border-purple-100 flex items-center justify-between group cursor-pointer hover:bg-purple-50 transition-all">
                                <div>
                                    <p className="text-purple-500 text-[10px] font-black uppercase tracking-widest">Next Exam</p>
                                    <span className="text-slate-900 font-bold block mt-1">Dynamic Entity</span>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                                    <Zap size={18} fill="currentColor" />
                                </div>
                            </div>
                        </div>
                    </BentoCard>
                </div>

                {/* Bottom Left: Next Exam Task */}
                <BentoCard
                    className="md:col-span-12 lg:col-span-4"
                    title="Next Exam Task"
                    subtitle="Software Engineering"
                >
                    <div className="mt-4 flex flex-col justify-between h-full">
                        <h4 className="text-4xl font-black text-slate-900 mb-10 tracking-tighter leading-[1.1]">Database<br />Normalization</h4>
                        <button className="btn-primary w-full shadow-lg h-14 uppercase tracking-widest text-xs font-black">
                            Launch Practice
                        </button>
                    </div>
                </BentoCard>

                {/* Bottom Right: AI Mentor (Floating Bubble Style) */}
                <BentoCard
                    className="md:col-span-12 lg:col-span-8 bg-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.2)]"
                >
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border border-white/20 shadow-lg">
                                <MessageSquare className="text-white" size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-xl tracking-tight">AI Mentor</h4>
                                <span className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">Personalized Help?</span>
                            </div>
                        </div>
                        <button className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                            <Users size={18} />
                        </button>
                    </div>

                    <div className="flex gap-5 mb-10">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-slate-700 shadow-xl flex-shrink-0">
                            <img src="https://ui-avatars.com/api/?name=AI+Mentor&background=4f46e5&color=fff" alt="AI Mentor" className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-slate-800 rounded-3xl rounded-tl-none p-6 text-slate-200 border border-slate-700 shadow-xl max-w-[80%] leading-relaxed font-medium">
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-2">AI Mentor</p>
                            How can I help you?
                        </div>
                    </div>

                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Send a message..."
                            className="w-full h-18 bg-white/5 border border-white/10 rounded-2xl pl-8 pr-20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-medium text-lg"
                        />
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all">
                            <Zap size={24} fill="currentColor" />
                        </button>
                    </div>
                </BentoCard>

            </div>
        </div>
    );
};

export default Dashboard;
