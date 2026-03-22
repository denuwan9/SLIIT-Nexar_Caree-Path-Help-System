/**
 * CareerSimulator.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Sends a target role to the AI and renders a professional trajectory roadmap.
 * ─────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useCallback } from 'react';
import { 
    Target, 
    Search, 
    Play, 
    Loader2, 
    AlertCircle, 
    Sparkles, 
    TrendingUp, 
    Calendar, 
    Compass 
} from 'lucide-react';
import type { CareerRoadmap } from '../../types/ai';
import { simulateCareer } from '../../services/aiService';

const CareerSimulator: React.FC = () => {
    const [role, setRole] = useState('');
    const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSimulate = useCallback(async () => {
        if (!role.trim()) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await simulateCareer(role.trim(), 'Student');
            setRoadmap(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Simulation failed. Intelligence sync interrupted.');
        } finally {
            setIsLoading(false);
        }
    }, [role]);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* ─── Trajectory Input Matrix ─── */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50 relative overflow-hidden group">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600 shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <Target size={24} />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-black text-[#0F172A] tracking-[0.2em] uppercase">Trajectory Objective</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest leading-none">Initialise Professional Simulation</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative group/input">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within/input:text-[#0F172A] transition-colors" size={18} />
                        <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="Target Executive Role (e.g. Senior Machine Learning Engineer)"
                            className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#0F172A] focus:ring-4 focus:ring-slate-100 outline-none text-[#0F172A] font-bold placeholder-[#94A3B8] transition-all duration-400"
                            onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
                        />
                    </div>
                    <button
                        onClick={handleSimulate}
                        disabled={isLoading || !role.trim()}
                        className="px-8 py-5 rounded-2xl bg-[#0F172A] text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-slate-200 hover:shadow-slate-300 hover:scale-[1.02] active:scale-95 transition-all duration-500 disabled:opacity-20 flex items-center justify-center gap-3 whitespace-nowrap min-w-[220px]"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />}
                        Simulate Trajectory
                    </button>
                </div>

                {/* Suggested Roles Chips */}
                {!roadmap && !isLoading && (
                    <div className="mt-8 pt-6 border-t border-slate-50 flex flex-wrap items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-700 delay-300">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Top Industry Targets:</span>
                        {[
                            "Full Stack Developer",
                            "Data Scientist",
                            "Cloud Architect",
                            "Cybersecurity Analyst",
                            "UI/UX Designer",
                            "AI Engineer"
                        ].map((sug) => (
                            <button
                                key={sug}
                                onClick={() => setRole(sug)}
                                className={`text-[11px] font-black px-4 py-2 rounded-xl border transition-all duration-300 hover:scale-105 ${
                                    role === sug 
                                    ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-lg shadow-slate-200' 
                                    : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-200 hover:text-indigo-600'
                                }`}
                            >
                                {sug}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-6 rounded-[2rem] text-sm font-bold flex items-center gap-4 animate-in shake duration-500 shadow-sm shadow-rose-100">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm border border-rose-100">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <p className="uppercase text-[10px] tracking-widest text-rose-400 mb-0.5 font-black">Strategic Exception</p>
                        <p>{error}</p>
                    </div>
                </div>
            )}

            {roadmap && !error && (
                <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-1000">
                    {/* ─── High-Tier Simulation Dashboard ─── */}
                    <div className="bg-[#0F172A] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border border-slate-800">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] -z-0"></div>
                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                                        <TrendingUp size={20} className="text-blue-400" />
                                    </div>
                                    <p className="text-slate-400 font-black uppercase tracking-[.3em] text-[10px]">Tier-1 Professional Trajectory</p>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-tight max-w-2xl">
                                    {roadmap.targetRole}
                                </h2>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-300">
                                        <Sparkles size={12} className="text-amber-400" /> Executive Standard
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-300">
                                        <Compass size={12} className="text-blue-400" /> 3-Stage Roadmap
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 flex flex-col md:flex-row items-center gap-10 shadow-2xl min-w-[320px]">
                                <div className="relative">
                                    <svg className="w-24 h-24 -rotate-90">
                                        <circle cx="48" cy="48" r="44" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="10" />
                                        <circle cx="48" cy="48" r="44" fill="transparent" stroke="currentColor" strokeWidth="10"
                                            strokeDasharray={276}
                                            strokeDashoffset={276 - (2.76 * roadmap.readinessScore)}
                                            className="text-blue-500 transition-all duration-[1.5s] ease-out shadow-blue-500/50"
                                            strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="font-black text-2xl leading-none">{roadmap.readinessScore}</span>
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter ml-0.5">%</span>
                                    </div>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Competitive Index</p>
                                    <p className="font-black text-2xl text-blue-400 mb-1">STRATEGIC {roadmap.readinessScore >= 80 ? 'A+' : roadmap.readinessScore >= 60 ? 'B' : 'C'}</p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Market Alignment Level</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ─── Trajectory Phases Matrix ─── */}
                    <div className="relative pt-4">
                        <div className="absolute left-[39px] top-6 bottom-10 w-1 bg-gradient-to-b from-blue-500/40 via-slate-100 to-transparent"></div>
                        
                        <div className="space-y-16 relative">
                            {[
                                { key: 'shortTerm', icon: Calendar, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-emerald-500' },
                                { key: 'midTerm', icon: Target, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', dot: 'bg-blue-500' },
                                { key: 'longTerm', icon: Compass, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', dot: 'bg-indigo-500' },
                            ].map((cfg, i) => {
                                const phase = roadmap[cfg.key as keyof CareerRoadmap] as any;
                                if (!phase) return null;
                                return (
                                    <div key={i} className="flex gap-12 group animate-in slide-in-from-left-4 duration-700" style={{ animationDelay: `${i * 200}ms` }}>
                                        <div className="relative z-10 flex-shrink-0">
                                            <div className={`w-20 h-20 rounded-[2rem] bg-white border-4 border-slate-50 flex items-center justify-center shadow-xl shadow-slate-100 group-hover:scale-110 group-hover:bg-[#0F172A] group-hover:text-white transition-all duration-500 group-hover:shadow-blue-200/50`}>
                                                <cfg.icon size={28} />
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100/50 hover:shadow-2xl hover:shadow-slate-200 transition-all duration-700 hover:-translate-y-1">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-50">
                                                <div>
                                                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${cfg.color}`}>PHASE {i + 1} — INTEGRATION</p>
                                                    <h4 className="text-2xl font-black text-[#0F172A] tracking-tight">{phase.phase || phase.title}</h4>
                                                </div>
                                                <div className="px-6 py-3 rounded-2xl bg-slate-50 text-[11px] font-black uppercase tracking-widest text-[#64748B] border border-slate-100 shadow-inner flex items-center gap-2">
                                                    <Calendar size={12} /> {phase.duration || 'Variable Duration'}
                                                </div>
                                            </div>
                                            
                                            <div className="grid md:grid-cols-2 gap-12">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                                                            <Sparkles size={14} className={cfg.color} />
                                                        </div>
                                                        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0F172A]">Core Competency Sync</span>
                                                    </div>
                                                    <ul className="space-y-4">
                                                        {(phase.skills || phase.keySkills || []).map((s: string, j: number) => (
                                                            <li key={j} className="flex items-start gap-4 text-[13px] font-bold text-[#475569] bg-slate-50/40 p-4 rounded-2xl border border-transparent hover:bg-white hover:border-slate-100 transition-all duration-300">
                                                                <div className={`w-2 h-2 rounded-full ${cfg.dot} mt-2 flex-shrink-0 animate-pulse`} />
                                                                {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center shadow-sm`}>
                                                            <Target size={14} className={cfg.color} />
                                                        </div>
                                                        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-[#0F172A]">Strategic Milestones</span>
                                                    </div>
                                                    <ul className="space-y-4">
                                                        {(phase.milestones || phase.actions || []).map((m: string, j: number) => (
                                                            <li key={j} className="flex items-start gap-4 text-[13px] font-bold text-[#475569] bg-blue-50/20 p-4 rounded-2xl border border-transparent hover:bg-white hover:border-blue-100 transition-all duration-300 group/item">
                                                                <div className={`w-2 h-2 rounded-full ${cfg.dot} mt-2 flex-shrink-0 group-hover/item:scale-150 transition-transform`} />
                                                                {m}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {!roadmap && !isLoading && (
                <div className="bg-white rounded-[2.5rem] flex flex-col items-center justify-center py-28 gap-6 text-center border border-slate-100 shadow-sm animate-in zoom-in-95 duration-700">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center shadow-inner group relative">
                        <TrendingUp size={40} className="text-indigo-400 group-hover:scale-110 transition-transform duration-500 group-hover:rotate-12" />
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full border-4 border-white animate-bounce flex items-center justify-center">
                            <Sparkles size={10} className="text-white" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Predictive Trajectory Sync</h3>
                        <p className="text-sm text-[#64748B] mt-3 max-w-sm font-bold leading-relaxed">
                            Define your enterprise-level objective above. Our AI will synthesize a professional trajectory roadmap based on global market benchmarks and your profile context.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CareerSimulator;
