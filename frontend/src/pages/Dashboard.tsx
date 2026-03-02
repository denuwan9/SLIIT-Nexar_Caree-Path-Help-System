import React from 'react';
import { useAuth } from '../components/auth/AuthProvider';
import {
    MessageSquare,
    Zap,
    Users,
    Bell,
    TrendingUp,
    Target,
    Activity,
    BookOpen
} from 'lucide-react';
import profileService from '../services/profileService';
import type { StudentProfile } from '../types/profile';

// Premium White Glass-morphism Bento card - High Density
const BentoCard: React.FC<{
    children: React.ReactNode,
    className?: string,
    title?: React.ReactNode,
    subtitle?: string,
    headerRight?: React.ReactNode,
    noPadding?: boolean
}> = ({ children, className = "", title, subtitle, headerRight, noPadding = false }) => (
    <div className={`bg-white/90 backdrop-blur-xl border border-slate-200/60 shadow-sm rounded-2xl flex flex-col overflow-hidden transition-all hover:bg-white hover:border-slate-300 group ${className}`}>
        {(title || subtitle || headerRight) && (
            <div className="flex justify-between items-start p-3 shrink-0 bg-slate-50/50 border-b border-slate-100">
                <div className="min-w-0">
                    {title && <h3 className="text-slate-900 font-black text-sm md:text-base leading-tight tracking-tight truncate">{title}</h3>}
                    {subtitle && <p className="text-purple-600 text-[8px] font-black uppercase tracking-[0.2em] mt-0.5">{subtitle}</p>}
                </div>
                {headerRight && <div className="ml-2">{headerRight}</div>}
            </div>
        )}
        <div className={`flex-1 w-full overflow-y-auto scrollbar-hide flex flex-col ${noPadding ? '' : 'p-3 md:p-3.5'}`}>
            {children}
        </div>
    </div>
);

// Top metric pill widget - High Contrast
const MetricWidget: React.FC<{ title: string, value: string, icon: React.ElementType, change?: string, positive?: boolean }> = ({ title, value, icon: Icon, change, positive = true }) => (
    <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-sm rounded-xl p-3 flex items-center justify-between group hover:bg-white hover:border-slate-300 transition-all cursor-default">
        <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-md transition-transform group-hover:scale-105 ${positive ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-indigo-700'}`}>
                <Icon className="text-white" size={12} />
            </div>
            <div>
                <p className="text-slate-500 text-[8px] font-black uppercase tracking-widest">{title}</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-slate-900 font-black text-base leading-none">{value}</span>
                    {change && (
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${positive ? 'text-cyan-700 bg-cyan-100/50' : 'text-purple-700 bg-purple-100/50'}`}>
                            {change}
                        </span>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = React.useState<StudentProfile | null>(null);

    React.useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await profileService.getMe();
                setProfile(data);
            } catch (err) {
                console.error('Failed to fetch profile for dashboard', err);
            }
        };
        fetchProfile();
    }, []);

    const completeness = profile?.profileCompleteness || 0;
    const technicalSkillsCount = profile?.technicalSkills?.length || 0;

    return (
        <div className="h-full flex flex-col pb-2 gap-4 lg:gap-5 overflow-hidden">

            {/* Header - White Theme */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-3">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]"></div>
                        <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">Nexar Intelligence</span>
                    </div>
                    <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tighter leading-none">
                        Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-cyan-500">{user?.name?.split(' ')[0] ?? 'Student'}!</span>
                    </h2>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto self-end sm:self-center">
                    <button className="relative p-2 text-slate-400 hover:text-slate-900 transition-all bg-white border border-slate-200 shadow-sm rounded-xl hover:bg-slate-50">
                        <Bell size={18} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                    </button>
                    <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-2xl p-1 pr-4 shadow-sm hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-100 shadow-sm shrink-0 transition-transform group-hover:scale-95">
                            <img src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}&background=8b5cf6&color=fff`} alt={user?.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-black text-slate-900 leading-none mb-0.5">{user?.name}</span>
                            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Pro Developer</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
                <MetricWidget title="Profile Strength" value={`${completeness}%`} icon={Target} change="Live" />
                <MetricWidget title="Skills Listed" value={technicalSkillsCount.toString()} icon={Activity} change="Updated" positive={true} />
                <MetricWidget title="Career Path" value={profile?.careerField ? 'Set' : 'Generic'} icon={TrendingUp} change={profile?.careerField || 'Not Set'} />
                <MetricWidget title="Profile Mode" value={profile?.isPublic ? 'Public' : 'Private'} icon={Users} change={profile?.isPublic ? 'Visible' : 'Hidden'} />
            </div>

            {/* Main Analytical Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">

                {/* Left Section */}
                <div className="lg:col-span-3 flex flex-col gap-4 h-full">
                    <BentoCard title="Profile Integrity" className="shrink-0">
                        <div className="flex items-center lg:flex-col xl:flex-row justify-between gap-3 py-1">
                            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="50%" cy="50%" r="42%" className="stroke-slate-100 fill-none" strokeWidth="5" />
                                    <circle cx="50%" cy="50%" r="42%" className="stroke-purple-500 fill-none" strokeWidth="7" strokeDasharray="264" strokeDashoffset={264 - (264 * completeness) / 100} strokeLinecap="round" />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-base font-black text-slate-900 leading-none">{completeness}%</span>
                                </div>
                            </div>
                            <div className="flex-1 w-full space-y-2">
                                {[
                                    { l: 'Skills', v: '90%', c: 'bg-cyan-400' },
                                    { l: 'Exp', v: '65%', c: 'bg-purple-500' },
                                    { l: 'Portf', v: '75%', c: 'bg-indigo-500' }
                                ].map((s, i) => (
                                    <div key={i} className="flex flex-col gap-1">
                                        <div className="flex justify-between items-center px-0.5">
                                            <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">{s.l}</span>
                                            <span className="text-[8px] font-black text-slate-900">{s.v}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${s.c} rounded-full`} style={{ width: s.v }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard title="Focus Areas" className="flex-1 min-h-0">
                        <div className="space-y-2.5 overflow-y-auto scrollbar-hide pr-1">
                            {[
                                { title: 'Database Normalization', type: 'Study', time: '45m', color: 'cyan' },
                                { title: 'Portfolio Update', type: 'Profile', time: 'Required', color: 'purple' },
                                { title: 'Mock Tech Interview', type: 'Prep', time: 'Tomorrow', color: 'indigo' },
                                { title: 'API Documentation', type: 'Doc', time: 'Today', color: 'emerald' }
                            ].map((task, i) => (
                                <div key={i} className="p-3 bg-white/40 border border-slate-100 rounded-xl hover:bg-white transition-all cursor-pointer group/task flex items-center gap-3 shadow-xs">
                                    <div className={`w-8 h-8 rounded-lg bg-${task.color}-50 border border-${task.color}-100 flex items-center justify-center shrink-0`}>
                                        <BookOpen className={`text-${task.color}-500`} size={14} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-slate-900 font-bold text-xs truncate leading-tight">{task.title}</h4>
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{task.type}</span>
                                            <span className="text-[9px] font-black text-purple-600">{task.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </BentoCard>
                </div>

                {/* Middle Column */}
                <BentoCard
                    className="lg:col-span-5 h-full"
                    title="Skill Acquisition"
                    headerRight={
                        <select className="bg-slate-50 border border-slate-200 text-slate-500 text-[8px] font-black uppercase tracking-widest rounded-lg px-2 py-1 outline-none focus:border-purple-300">
                            <option>30D</option>
                            <option>YTD</option>
                        </select>
                    }
                >
                    <div className="flex-1 flex flex-col pt-1">
                        <div className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-100 relative overflow-hidden flex items-center justify-center">
                            <svg className="w-full h-full p-2" viewBox="0 0 400 200" preserveAspectRatio="none">
                                <path
                                    d="M0,180 Q50,165 100,110 T200,90 T300,130 T400,40"
                                    className="fill-none stroke-purple-400/40"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />
                                <circle cx="100" cy="110" r="4" className="fill-white stroke-cyan-500" strokeWidth="2" />
                                <circle cx="200" cy="90" r="4" className="fill-white stroke-purple-500" strokeWidth="2" />
                            </svg>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-4 shrink-0">
                            {[
                                { l: 'Backend', v: '+12%', c: 'text-cyan-600' },
                                { l: 'Frontend', v: '+8%', c: 'text-purple-600' },
                                { l: 'DevOps', v: '+3%', c: 'text-blue-600' }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/40 border border-slate-100 p-2.5 rounded-xl text-center shadow-xs">
                                    <span className="text-[8px] uppercase font-black tracking-widest text-slate-500 block mb-0.5">{stat.l}</span>
                                    <span className={`text-sm font-black ${stat.c}`}>{stat.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </BentoCard>

                {/* Right Column */}
                <BentoCard
                    className="lg:col-span-4 h-full"
                    title="AI Career Copilot"
                    noPadding
                >
                    <div className="flex flex-col h-full bg-slate-50/30">
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                                    <MessageSquare size={14} className="text-white" />
                                </div>
                                <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none text-[11px] text-slate-600 leading-relaxed shadow-sm max-w-[85%]">
                                    Readiness Score is up! Mock interview?
                                </div>
                            </div>
                            <div className="flex gap-3 flex-row-reverse">
                                <div className="bg-purple-600 text-white p-3 rounded-2xl rounded-tr-none text-[11px] shadow-sm max-w-[85%]">
                                    Let's do Architecture tradeoffs.
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border-t border-slate-100 bg-white/60">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Type answer..."
                                    className="w-full bg-slate-50 border border-slate-200 text-[11px] text-slate-900 rounded-xl py-2.5 pl-4 pr-12 focus:outline-none focus:border-purple-300"
                                />
                                <button className="absolute right-1 top-1 bottom-1 w-9 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-sm">
                                    <Zap size={14} className="text-white" fill="currentColor" />
                                </button>
                            </div>
                        </div>
                    </div>
                </BentoCard>
            </div>
        </div>
    );
};

export default Dashboard;
