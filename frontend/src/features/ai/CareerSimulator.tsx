/**
 * CareerSimulator.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Sends a target role to the AI and renders a 3-phase career roadmap.
 * Each phase card is colour-coded: Short (green), Mid (blue), Long (purple).
 * ─────────────────────────────────────────────────────────────────────────
 */
import React, { useState } from 'react';
import { Rocket, ChevronRight, Clock, Star, BookOpen, Loader2, AlertCircle, Zap } from 'lucide-react';
import type { CareerRoadmap, CareerPhase } from '../../types/ai';
import { simulateCareer } from '../../services/aiService';

// ── Phase colour config ───────────────────────────────────────────────────
const PHASE_CONFIG = [
    {
        key: 'shortTerm' as keyof CareerRoadmap,
        gradient: 'from-emerald-500 to-teal-500',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badge: 'bg-emerald-100 text-emerald-700',
        glow: 'shadow-emerald-200',
        icon: '🚀',
    },
    {
        key: 'midTerm' as keyof CareerRoadmap,
        gradient: 'from-blue-500 to-indigo-500',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        badge: 'bg-blue-100 text-blue-700',
        glow: 'shadow-blue-200',
        icon: '📈',
    },
    {
        key: 'longTerm' as keyof CareerRoadmap,
        gradient: 'from-purple-500 to-violet-600',
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        badge: 'bg-purple-100 text-purple-700',
        glow: 'shadow-purple-200',
        icon: '🏆',
    },
] as const;

// ── Phase Card ────────────────────────────────────────────────────────────
const PhaseCard: React.FC<{ phase: CareerPhase; config: typeof PHASE_CONFIG[number] }> = ({ phase, config }) => (
    <div className={`card border ${config.border} ${config.glow} shadow-lg flex flex-col`}>
        {/* Phase header */}
        <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${config.border}`}>
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center text-lg shadow-md`}>
                {config.icon}
            </div>
            <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">{phase.phase}</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{phase.goal}</p>
            </div>
        </div>

        {/* Actions */}
        <div className="mb-4 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                <ChevronRight size={10} /> Action Items
            </p>
            <ul className="space-y-1.5">
                {phase.actions.map((action, i) => (
                    <li key={i} className="flex gap-2 items-start text-sm text-slate-700">
                        <span className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-black text-white bg-gradient-to-br ${config.gradient} mt-0.5 shadow-sm`}>{i + 1}</span>
                        {action}
                    </li>
                ))}
            </ul>
        </div>

        {/* Key Skills */}
        <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                <Star size={10} /> Key Skills
            </p>
            <div className="flex flex-wrap gap-1.5">
                {phase.keySkills.map((skill, i) => (
                    <span key={i} className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${config.badge}`}>
                        {skill}
                    </span>
                ))}
            </div>
        </div>

        {/* Resources */}
        {phase.resources?.length > 0 && (
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                    <BookOpen size={10} /> Resources
                </p>
                <ul className="space-y-1">
                    {phase.resources.map((r, i) => (
                        <li key={i} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
                            {r}
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────
const CareerSimulator: React.FC = () => {
    const [targetRole, setTargetRole] = useState('');
    const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activePhase, setActivePhase] = useState<number>(0);

    const handleSimulate = async () => {
        if (!targetRole.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        setRoadmap(null);
        try {
            const result = await simulateCareer(targetRole.trim());
            setRoadmap(result);
            setActivePhase(0);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Simulation failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const readinessColor = roadmap
        ? roadmap.readinessScore >= 70 ? 'text-emerald-600' : roadmap.readinessScore >= 40 ? 'text-amber-600' : 'text-red-600'
        : 'text-slate-400';

    return (
        <div className="space-y-6">
            {/* Input Card */}
            <div className="card">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg">
                        <Rocket size={18} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900">Career Path Simulator</h3>
                        <p className="text-xs text-slate-400">Get a personalised 3-phase roadmap from your current state</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <input
                        type="text"
                        value={targetRole}
                        onChange={e => setTargetRole(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSimulate()}
                        placeholder='e.g. "Senior Full Stack Developer at Google" or "Data Scientist"'
                        className="flex-1 px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm text-slate-800 placeholder-slate-400"
                    />
                    <button
                        onClick={handleSimulate}
                        disabled={isLoading || !targetRole.trim()}
                        className="btn-primary flex items-center gap-2 whitespace-nowrap text-sm py-3 px-5 disabled:opacity-40"
                    >
                        {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                        {isLoading ? 'Simulating…' : 'Simulate'}
                    </button>
                </div>

                {/* Popular roles */}
                <div className="mt-3 flex flex-wrap gap-2">
                    {['Software Engineer', 'Data Scientist', 'UI/UX Designer', 'DevOps Engineer', 'Product Manager'].map(role => (
                        <button
                            key={role}
                            onClick={() => setTargetRole(role)}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-500 font-bold transition-colors"
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="flex gap-3 items-start p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {isLoading && (
                <div className="card flex flex-col items-center justify-center py-16 gap-4">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-xl animate-pulse">
                            <Rocket size={32} className="text-white" />
                        </div>
                        <Loader2 size={20} className="absolute -top-2 -right-2 text-purple-500 animate-spin" />
                    </div>
                    <div className="text-center">
                        <p className="font-black text-slate-800">AI is analysing your profile…</p>
                        <p className="text-xs text-slate-400 mt-1">Building your personalised roadmap</p>
                    </div>
                </div>
            )}

            {roadmap && (
                <>
                    {/* Overview Banner */}
                    <div className="card bg-gradient-to-r from-slate-800 to-slate-900 text-white border-slate-700">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <div className="flex-1">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Target Role</p>
                                <h3 className="text-lg font-black">{roadmap.targetRole}</h3>
                                <p className="text-sm text-slate-300 mt-2 leading-relaxed">{roadmap.overallStrategy}</p>
                            </div>
                            <div className="flex-shrink-0 text-center">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Readiness</p>
                                <p className={`text-5xl font-black ${readinessColor}`}>{roadmap.readinessScore}<span className="text-2xl text-slate-400">%</span></p>
                                <p className="text-[10px] text-slate-400 mt-1">Current Fit Score</p>
                            </div>
                        </div>
                    </div>

                    {/* Phase tabs (mobile-friendly) */}
                    <div className="flex gap-2 bg-white/40 backdrop-blur-sm p-1 rounded-2xl border border-white/50">
                        {PHASE_CONFIG.map((cfg, i) => {
                            const phase = roadmap[cfg.key] as CareerPhase;
                            return (
                                <button
                                    key={i}
                                    onClick={() => setActivePhase(i)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activePhase === i
                                        ? `bg-gradient-to-br ${cfg.gradient} text-white shadow-lg`
                                        : 'text-slate-500 hover:bg-white/50'
                                        }`}
                                >
                                    <span>{cfg.icon}</span>
                                    <span className="hidden sm:inline">{phase.phase.split('(')[0].trim()}</span>
                                    <span className="sm:hidden">{['Short', 'Mid', 'Long'][i]}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Active Phase Card */}
                    <PhaseCard
                        phase={roadmap[PHASE_CONFIG[activePhase].key] as CareerPhase}
                        config={PHASE_CONFIG[activePhase]}
                    />

                    {/* Timeline connector */}
                    <div className="hidden md:flex items-center gap-1 justify-center text-xs text-slate-400 font-bold">
                        <Clock size={12} /> Click each phase tab to explore your full roadmap
                    </div>
                </>
            )}
        </div>
    );
};

export default CareerSimulator;
