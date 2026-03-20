/**
 * CareerSimulator.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Sends a target role to the AI and renders a 3-phase career roadmap.
 * Each phase card is colour-coded: Short (green), Mid (blue), Long (purple).
 * ─────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect } from 'react';
import { Rocket, ChevronRight, Clock, Star, BookOpen, Loader2, AlertCircle, Zap } from 'lucide-react';
import type { CareerRoadmap, CareerPhase } from '../../types/ai';
import { simulateCareer } from '../../services/aiService';
import profileService from '../../services/profileService';

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
    const [step, setStep] = useState<1 | 2>(1);
    const [targetRole, setTargetRole] = useState('');
    const [currentLevel, setCurrentLevel] = useState('Student');
    const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activePhase, setActivePhase] = useState<number>(0);
    const [localProfile, setLocalProfile] = useState<any>(null);

    // Fetch profile on mount for skill context
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsProfileLoading(true);
                const p = await profileService.getMe();
                setLocalProfile(p);
            } catch (err) {
                console.error('Failed to fetch profile for simulator context', err);
            } finally {
                setIsProfileLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSimulate = async () => {
        if (!targetRole.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        // We don't clear roadmap immediately so we can show it while loading if needed,
        // but for a clean "Step 2" feel, we might want to stay on Step 1 until done or show a loader.
        try {
            const result = await simulateCareer(targetRole.trim(), currentLevel);
            if (result) {
                setRoadmap(result);
                setActivePhase(0); // Always reset to first phase on new result
                setStep(2);
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Simulation failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const readinessColor = roadmap
        ? roadmap.readinessScore >= 70 ? 'text-emerald-600' : roadmap.readinessScore >= 40 ? 'text-amber-600' : 'text-red-600'
        : 'text-slate-400';

    const LEVELS = ['Student', 'Entry-Level', 'Junior', 'Mid-Level', 'Senior'];

    return (
        <div className="space-y-6">
            {step === 1 ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    {/* Setup Card */}
                    <div className="card border-purple-100 shadow-xl shadow-purple-50">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg">
                                <Rocket size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900">Career Path Simulator</h3>
                                <p className="text-xs text-slate-500">Define your starting point to generate a personalized roadmap</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left: Inputs */}
                            <div className="space-y-5">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">1. Target Career Role</label>
                                    <input
                                        type="text"
                                        value={targetRole}
                                        onChange={e => setTargetRole(e.target.value)}
                                        placeholder='e.g. "Cloud Architect" or "Frontend Dev"'
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-50 outline-none text-sm text-slate-800 placeholder-slate-400 transition-all font-medium"
                                    />
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {['Software Engineer', 'Data Scientist', 'UI/UX'].map(role => (
                                            <button
                                                key={role}
                                                onClick={() => setTargetRole(role)}
                                                className="text-[9px] px-2 py-0.5 rounded-lg bg-white border border-slate-100 hover:border-purple-200 hover:bg-purple-50 text-slate-400 hover:text-purple-600 font-bold transition-all"
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">2. Current Experience Level</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {LEVELS.map(lvl => (
                                            <button
                                                key={lvl}
                                                onClick={() => setCurrentLevel(lvl)}
                                                className={`px-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border
                                                    ${currentLevel === lvl
                                                        ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                    }`}
                                            >
                                                {lvl}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Skills Context */}
                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-dashed border-slate-200">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block flex items-center gap-1.5">
                                    <Zap size={10} className="text-amber-500" /> 3. Detected Skills from Profile
                                </label>
                                
                                {isProfileLoading ? (
                                    <div className="animate-pulse space-y-2">
                                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                    </div>
                                ) : localProfile?.technicalSkills?.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {localProfile.technicalSkills.map((s: any) => (
                                            <span key={s.name} className="px-2 py-1 rounded bg-white border border-slate-100 text-[10px] font-bold text-slate-600 shadow-sm">
                                                {s.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-[10px] text-slate-400 italic">No technical skills detected in your profile yet.</p>
                                )}
                                <p className="text-[9px] text-slate-400 mt-4 leading-relaxed font-medium">
                                    Nexar AI will analyze these skills along with your <b>{currentLevel}</b> status to plot your journey to <b>{targetRole || 'your goal'}</b>.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={handleSimulate}
                                disabled={isLoading || !targetRole.trim()}
                                className="btn-primary group relative overflow-hidden flex items-center gap-3 px-8 py-3.5 rounded-xl text-sm font-black transition-all hover:scale-[1.02] disabled:opacity-40"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Analysing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Generate Career Path</span>
                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                                
                                {isLoading && (
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="flex gap-3 items-start p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-in fade-in zoom-in-95 duration-500 space-y-6">
                    {/* Back Button */}
                    <button 
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-purple-600 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Setup
                    </button>

                    {roadmap && (
                        <>
                            {/* Overview Banner */}
                            <div className="card bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-700 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                                    <Rocket size={120} />
                                </div>
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase tracking-widest border border-purple-500/30">
                                                {currentLevel} Strategy
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black mb-2">{roadmap.targetRole}</h3>
                                        <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">{roadmap.overallStrategy}</p>
                                    </div>
                                    <div className="flex-shrink-0 bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 text-center min-w-[140px]">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Readiness Score</p>
                                        <p className={`text-5xl font-black ${readinessColor}`}>{roadmap.readinessScore}<span className="text-2xl text-slate-500">%</span></p>
                                        <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${roadmap.readinessScore >= 70 ? 'bg-emerald-500' : roadmap.readinessScore >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                style={{ width: `${roadmap.readinessScore}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Phase tabs */}
                            <div className="flex gap-2 bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-sm overflow-x-auto scrollbar-hide">
                                {PHASE_CONFIG.map((cfg, i) => {
                                    const phase = roadmap[cfg.key] as CareerPhase;
                                    const isActive = activePhase === i;
                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setActivePhase(i)}
                                            className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${isActive
                                                ? `bg-gradient-to-br ${cfg.gradient} text-white shadow-lg scale-[1.02]`
                                                : 'text-slate-500 hover:bg-white border border-transparent hover:border-slate-100'
                                                }`}
                                        >
                                            <span className={isActive ? 'scale-110 rotate-12 transition-transform' : ''}>{cfg.icon}</span>
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

                            {/* Info */}
                            <div className="flex items-center gap-2 justify-center text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                                <Clock size={12} /> Timeline estimates based on {currentLevel} baseline
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default CareerSimulator;
