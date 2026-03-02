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
            <div className="mb-6 w-full">
                {title && <h3 className="text-slate-900 font-extrabold tracking-tight text-xl md:text-2xl">{title}</h3>}
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
        <div className="flex flex-col gap-8 md:gap-10 lg:gap-12">

            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Career Path Simulator</p>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter leading-none">
                        Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">{user?.name?.split(' ')[0] ?? 'Student'}!</span>
                    </h2>
                </div>

                {/* Bell + Avatar */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white/40 p-1.5 rounded-2xl border border-white">
                        <button className="p-2.5 text-slate-500 hover:text-purple-600 transition-colors rounded-xl hover:bg-white/60">
                            <Bell size={20} />
                        </button>
                        <div className="w-px h-5 bg-slate-200 mx-0.5"></div>
                        <div className="flex items-center gap-2.5 pl-1.5 pr-3">
                            <div className="w-9 h-9 rounded-xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                                <img src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} alt={user?.name} className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-5 md:gap-7 lg:gap-10">

                {/* Profile Readiness */}
                <BentoCard
                    className="sm:col-span-2 lg:col-span-7 !p-6 md:!p-10 lg:!p-12"
                    title="Profile Readiness"
                >
                    <div className="flex flex-col sm:flex-row items-center gap-8 lg:gap-16">
                        <div className="relative w-44 h-44 sm:w-56 sm:h-56 lg:w-72 lg:h-72 flex-shrink-0 flex items-center justify-center">
                            <div className="absolute inset-0 bg-purple-500/10 blur-[60px] rounded-full"></div>
                            <svg className="w-full h-full transform -rotate-90 relative z-10">
                                <circle cx="50%" cy="50%" r="45%" className="stroke-slate-200 fill-none" strokeWidth="10" />
                                <circle cx="50%" cy="50%" r="45%" className="stroke-purple-500 fill-none transition-all duration-1000 ease-out" strokeWidth="14" strokeDasharray="283" strokeDashoffset="51" strokeLinecap="round" />
                            </svg>
                            <div className="absolute flex flex-col items-center z-20">
                                <span className="text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-none tracking-tighter">82%</span>
                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1.5">Readiness</span>
                            </div>
                        </div>

                        <div className="flex-1 w-full space-y-5 md:space-y-8">
                            {[
                                { label: 'Skills', val: '90%', w: 'w-[90%]' },
                                { label: 'Experience', val: '65%', w: 'w-[65%]' },
                                { label: 'Portfolio', val: '75%', w: 'w-[75%]' }
                            ].map((stat, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                        <span className="text-sm font-black text-slate-900">{stat.val}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full bg-gradient-to-r from-blue-400 to-purple-500 ${stat.w} rounded-full shadow-[0_0_15px_rgba(157,80,255,0.3)]`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </BentoCard>

                {/* Interview Slots */}
                <div className="sm:col-span-2 lg:col-span-5 grid grid-cols-1 gap-5 md:gap-7 lg:gap-10">
                    <BentoCard title="Interview Slots" subtitle="Upcoming">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-5 border border-white shadow-sm hover:shadow-md transition-all">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Readiness</p>
                                <span className="text-3xl font-black text-slate-900 italic tracking-tighter">82%</span>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full mt-3">
                                    <div className="h-full bg-blue-500 w-[82%] rounded-full"></div>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-5 border border-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                                <div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Upcoming</p>
                                    <span className="text-3xl font-black text-slate-900 tracking-tighter">2 <span className="text-base text-slate-400">Slots</span></span>
                                </div>
                                <div className="flex gap-1.5 mt-3">
                                    <div className="h-1.5 flex-1 bg-emerald-500 rounded-full"></div>
                                    <div className="h-1.5 flex-1 bg-emerald-500 rounded-full"></div>
                                </div>
                            </div>

                            <div className="col-span-2 bg-slate-50 rounded-2xl p-4 md:p-5 border border-white flex items-center justify-between group cursor-pointer hover:bg-slate-100 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                                        <Zap className="text-purple-500" size={16} />
                                    </div>
                                    <div>
                                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Upcoming</p>
                                        <span className="text-slate-900 font-bold text-sm">1 Interview Slot</span>
                                    </div>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform flex-shrink-0" size={18} />
                            </div>

                            <div className="col-span-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-4 md:p-5 border border-purple-100 flex items-center justify-between group cursor-pointer hover:bg-purple-50 transition-all">
                                <div>
                                    <p className="text-purple-500 text-[10px] font-black uppercase tracking-widest">Next Exam</p>
                                    <span className="text-slate-900 font-bold text-sm block mt-0.5">Dynamic Entity</span>
                                </div>
                                <div className="w-9 h-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform flex-shrink-0">
                                    <Zap size={16} fill="currentColor" />
                                </div>
                            </div>
                        </div>
                    </BentoCard>
                </div>

                {/* Next Exam Task */}
                <BentoCard
                    className="sm:col-span-1 lg:col-span-4"
                    title="Next Exam Task"
                    subtitle="Software Engineering"
                >
                    <div className="mt-2 flex flex-col justify-between h-full">
                        <h4 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 mb-6 lg:mb-10 tracking-tighter leading-tight">Database<br />Normalization</h4>
                        <button className="btn-primary w-full h-12 md:h-14 uppercase tracking-widest text-xs font-black">
                            Launch Practice
                        </button>
                    </div>
                </BentoCard>

                {/* AI Mentor */}
                <BentoCard className="sm:col-span-2 lg:col-span-8 bg-slate-900 !p-6 md:!p-8 lg:!p-10">
                    <div className="flex items-center justify-between mb-6 pb-5 border-b border-white/10 w-full">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border border-white/20 shadow-lg flex-shrink-0">
                                <MessageSquare className="text-white" size={22} />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-lg tracking-tight">AI Mentor</h4>
                                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Personalized Help</span>
                            </div>
                        </div>
                        <button className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all">
                            <Users size={16} />
                        </button>
                    </div>

                    <div className="flex gap-4 mb-7">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-slate-700 shadow-lg flex-shrink-0">
                            <img src="https://ui-avatars.com/api/?name=AI+Mentor&background=4f46e5&color=fff" alt="AI Mentor" className="w-full h-full object-cover" />
                        </div>
                        <div className="bg-slate-800 rounded-3xl rounded-tl-none p-5 text-slate-200 border border-slate-700 shadow-xl max-w-[85%] leading-relaxed font-medium text-sm md:text-base">
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1.5">AI Mentor</p>
                            How can I help you today?
                        </div>
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Send a message..."
                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-5 pr-16 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all font-medium text-sm md:text-base"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all">
                            <Zap size={20} fill="currentColor" />
                        </button>
                    </div>
                </BentoCard>

            </div>
        </div>
    );
};

export default Dashboard;
