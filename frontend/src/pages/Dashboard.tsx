import React from 'react';
import { 
    Zap, 
    Bell, 
    TrendingUp, 
    Target, 
    Activity, 
    BookOpen,
    Cpu,
    Shield,
    Terminal,
    ArrowRight
} from 'lucide-react';
import { useSystemInit } from '../hooks/useSystemInit';
import { SystemLoader } from '../components/ui/SystemLoader';
import { motion } from 'framer-motion';

// Cyber-minimalist Bento Card
const BentoCard: React.FC<{
    children: React.ReactNode,
    className?: string,
    title?: React.ReactNode,
    subtitle?: string,
    headerRight?: React.ReactNode,
    noPadding?: boolean
}> = ({ children, className = "", title, subtitle, headerRight, noPadding = false }) => (
    <div className={`glass-dark rounded-[24px] border-white/5 flex flex-col overflow-hidden transition-all hover:border-white/10 group ${className}`}>
        {(title || subtitle || headerRight) && (
            <div className="flex justify-between items-start p-4 shrink-0 border-b border-white/5">
                <div className="min-w-0">
                    {title && <h3 className="text-white font-black text-sm uppercase italic tracking-tight truncate">{title}</h3>}
                    {subtitle && <p className="text-cobalt-electric text-[9px] font-black uppercase tracking-[0.2em] mt-0.5">{subtitle}</p>}
                </div>
                {headerRight && <div className="ml-2">{headerRight}</div>}
            </div>
        )}
        <div className={`flex-1 w-full overflow-y-auto scrollbar-hide flex flex-col ${noPadding ? '' : 'p-4'}`}>
            {children}
        </div>
    </div>
);

// Cyber Metric Widget
const MetricWidget: React.FC<{ title: string, value: string, icon: React.ElementType, change?: string, status?: 'stable' | 'alert' | 'high' }> = ({ title, value, icon: Icon, change, status = 'stable' }) => (
    <div className="glass-dark border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-cobalt-electric/20 transition-all cursor-default relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-cobalt-electric/5 blur-2xl" />
        <div className="flex items-center gap-3.5 relative">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all group-hover:scale-110 ${
                status === 'high' ? 'bg-cobalt-electric/20 border-cobalt-electric/30 text-cobalt-electric' : 
                status === 'alert' ? 'bg-rose-500/20 border-rose-500/30 text-rose-500' :
                'bg-white/5 border-white/10 text-silver-base'
            }`}>
                <Icon size={16} />
            </div>
            <div>
                <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">{title}</p>
                <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-white font-black text-lg tracking-tighter leading-none">{value}</span>
                    {change && (
                        <span className="text-[9px] font-mono text-cobalt-electric/80 uppercase">
                            [{change}]
                        </span>
                    )}
                </div>
            </div>
        </div>
    </div>
);

const Dashboard: React.FC = () => {
    const { data: systemData, isLoading } = useSystemInit();

    if (isLoading) return <SystemLoader />;

    const user = systemData?.user;
    const profile = systemData?.profile;
    const completeness = profile?.profileCompleteness || 0;

    return (
        <div className="h-full flex flex-col pb-4 gap-6 overflow-hidden bg-charcoal-deep text-white p-6">
            
            {/* Header - Cyber Theme */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-4">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Terminal size={12} className="text-cobalt-electric" />
                        <span className="text-slate-500 text-[10px] font-mono uppercase tracking-[0.4em]">Nexar_Kernel.V4.0</span>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tighter italic uppercase leading-none">
                        Welcome, <span className="text-cobalt-electric">{user?.firstName ?? 'Operator'}</span>
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative p-3 glass-dark border-white/5 rounded-xl hover:border-white/20 transition-all group">
                        <Bell size={20} className="text-slate-400 group-hover:text-cobalt-electric transition-colors" />
                        <span className="absolute top-3 right-3 w-2 h-2 bg-cobalt-electric rounded-full shadow-[0_0_10px_rgba(46,91,255,0.8)]"></span>
                    </button>
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-[20px] p-1.5 pr-5 shadow-inner hover:border-white/20 transition-all cursor-pointer group">
                        <div className="w-10 h-10 rounded-2xl overflow-hidden border border-white/10 shrink-0 relative">
                            <img src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.fullName}&background=2e5bff&color=fff`} alt={user?.fullName} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-cobalt-electric/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-white leading-none mb-1 uppercase italic">{user?.fullName}</span>
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">Verified Protocol</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Core Metrics Bento Section */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                <MetricWidget title="Neural integrity" value={`${completeness}%`} icon={Target} change="Synced" status="high" />
                <MetricWidget title="Simulated Nodes" value={profile?.technicalSkills?.length || '0'} icon={Activity} change="+2 Today" />
                <MetricWidget title="Target Vector" value={profile?.careerGoals?.targetRoles?.[0] || 'Unset'} icon={TrendingUp} status={profile?.careerGoals?.targetRoles?.[0] ? 'stable' : 'alert'} />
                <MetricWidget title="Network status" value="Encrypted" icon={Shield} change="Live" />
            </div>

            {/* Analytical Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
                
                {/* Visual Intelligence Section */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                    <BentoCard title="Matrix Synthesis" subtitle="System Health Monitor">
                        <div className="flex flex-col gap-6 py-2">
                            <div className="flex items-center justify-between">
                                <div className="relative w-24 h-24 flex items-center justify-center">
                                    <svg className="w-full h-full rotate-[-90deg]">
                                        <circle cx="50%" cy="50%" r="42%" className="stroke-white/5 fill-none" strokeWidth="4" />
                                        <motion.circle 
                                            cx="50%" cy="50%" r="42%" 
                                            className="stroke-cobalt-electric fill-none" 
                                            strokeWidth="6" 
                                            strokeLinecap="round"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: completeness / 100 }}
                                            transition={{ duration: 2, ease: "easeOut" }}
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-xl font-black text-white leading-none italic">{completeness}</span>
                                        <span className="text-[8px] font-mono text-slate-500 uppercase">Index</span>
                                    </div>
                                </div>
                                <div className="flex-1 pl-6 space-y-4">
                                    {[
                                        { l: 'Logic', v: '88', c: 'bg-cobalt-electric' },
                                        { l: 'Synthesis', v: '92', c: 'bg-white/20' },
                                        { l: 'Output', v: '74', c: 'bg-silver-base' }
                                    ].map((s, i) => (
                                        <div key={i} className="space-y-1.5">
                                            <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                                                <span className="text-slate-500">{s.l}</span>
                                                <span className="text-white">{s.v}%</span>
                                            </div>
                                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${s.v}%` }}
                                                    transition={{ duration: 1, delay: i * 0.2 }}
                                                    className={`h-full ${s.c} rounded-full`}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </BentoCard>

                    <BentoCard title="Protocol Stream" className="flex-1 min-h-0">
                        <div className="space-y-3 overflow-y-auto scrollbar-hide pr-2">
                            {systemData?.notifications?.map((notif: any, i: number) => (
                                <motion.div 
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={i} 
                                    className="p-4 bg-white/5 border border-white/5 rounded-2xl hover:border-cobalt-electric/30 transition-all cursor-pointer group flex items-start gap-4"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-cobalt-electric/10 flex items-center justify-center shrink-0 border border-cobalt-electric/20">
                                        <Cpu className="text-cobalt-electric" size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-bold text-xs uppercase italic tracking-tight mb-1">{notif.title}</h4>
                                        <p className="text-slate-500 text-[10px] leading-relaxed line-clamp-2 mb-2">{notif.message}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[8px] font-mono text-cobalt-electric/60 uppercase">Received: {new Date(notif.createdAt).toLocaleTimeString()}</span>
                                            <span className="text-[8px] font-black text-white uppercase group-hover:text-cobalt-electric transition-colors">Acknowledge</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </BentoCard>
                </div>

                {/* Central Simulation Hub */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                        <BentoCard title="Career Projection Matrix" className="h-full">
                            <div className="flex-1 flex flex-col gap-4">
                                <div className="h-48 bg-white/5 rounded-[24px] border border-white/5 relative overflow-hidden flex items-center justify-center group">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(46,91,255,0.1),transparent)] group-hover:opacity-100 opacity-50 transition-opacity" />
                                    <svg className="w-full h-full p-6 text-cobalt-electric/20" viewBox="0 0 400 200">
                                        <path d="M0 100 Q100 50 200 100 T400 100" className="fill-none stroke-current" strokeWidth="1" strokeDasharray="5,5" />
                                        <motion.path 
                                            d="M0 100 Q100 80 200 120 T400 90" 
                                            className="fill-none stroke-cobalt-electric" 
                                            strokeWidth="2"
                                            animate={{ strokeDashoffset: [0, -20] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                            strokeDasharray="10,10"
                                        />
                                    </svg>
                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between bg-charcoal-deep/80 backdrop-blur-md p-3 rounded-xl border border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black text-slate-500 uppercase">Projection Mode</span>
                                            <span className="text-[10px] font-mono text-white">Neural Optimizer</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[9px] font-black uppercase">Active</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { t: 'Market demand', v: 'High', i: TrendingUp },
                                        { t: 'Skill gap', v: '2 Nodes', i: BookOpen }
                                    ].map((it, idx) => (
                                        <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3">
                                            <it.i size={14} className="text-cobalt-electric" />
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-black text-slate-500 uppercase">{it.t}</span>
                                                <span className="text-xs font-black text-white italic">{it.v}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </BentoCard>

                        <BentoCard title="AI Intelligence Hub" noPadding>
                            <div className="flex flex-col h-full bg-white/[0.02]">
                                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-cobalt-electric" />
                                        <span className="text-[10px] font-black uppercase tracking-widest italic">Core Mind.V1</span>
                                    </div>
                                    <Zap size={14} className="text-cobalt-electric animate-pulse" />
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide font-mono">
                                    <div className="flex gap-3">
                                        <div className="bg-white/5 border border-white/5 p-3 rounded-2xl rounded-tl-none text-[10px] text-silver-base leading-relaxed tracking-tight">
                                            &gt; Neural analysis complete. System suggests focusing on Vector Database architecture for next simulation node.
                                        </div>
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <div className="bg-cobalt-electric/10 border border-cobalt-electric/20 p-3 rounded-2xl rounded-tr-none text-[10px] text-white leading-relaxed tracking-tight">
                                            &gt; Execute optimization protocol.
                                        </div>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            placeholder="CMD_PROMPT"
                                            className="w-full bg-charcoal-deep border border-white/10 text-[10px] text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-cobalt-electric transition-all placeholder:text-slate-700 font-mono"
                                        />
                                        <button className="absolute right-2 top-2 bottom-2 w-8 rounded-lg bg-cobalt-electric flex items-center justify-center shadow-[0_0_15px_rgba(46,91,255,0.4)] active:scale-90 transition-all">
                                            <ArrowRight size={14} className="text-white" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </BentoCard>
                    </div>

                    <div className="h-24 glass-dark border-white/5 rounded-[24px] flex items-center justify-between px-8 relative overflow-hidden group">
                        <div className="absolute inset-y-0 left-0 w-1 bg-cobalt-electric" />
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Simulation status</span>
                                <span className="text-xl font-black text-white italic uppercase italic">Operational</span>
                            </div>
                            <div className="h-10 w-px bg-white/10" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol Version</span>
                                <span className="text-sm font-mono text-cobalt-electric">2026.SLIIT.NX</span>
                            </div>
                        </div>
                        <button className="bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-xl hover:bg-cobalt-electric hover:text-white transition-all shadow-lg">
                            Initiate Deep Scan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
