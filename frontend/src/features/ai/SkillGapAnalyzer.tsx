/**
 * SkillGapAnalyzer.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Redesigned Context-Aware Skill Gap Analyzer.
 * Features: Target role selection, profile skill fetching (backend),
 * and hyper-personalized AI analysis with Framer Motion animations.
 * ─────────────────────────────────────────────────────────────────────────
 */
import React, { useState } from 'react';
import { 
  Target, AlertTriangle, CheckCircle, ExternalLink, Zap, 
  Loader2, AlertCircle, TrendingUp, Sparkles, BookOpen, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { SkillGapResult } from '../../types/ai';
import { analyzeSkillGap } from '../../services/aiService';
import { toast } from 'react-hot-toast';

// ── Readiness Score Gauge (Recharts RadialBar) ────────────────────────────
const ReadinessGauge: React.FC<{ score: number }> = ({ score }) => {
    const color = score >= 85 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
    const label = score >= 85 ? 'Highly Ready' : score >= 60 ? 'Developing' : 'Major Gaps';

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-48 h-48">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        cx="50%" cy="50%"
                        innerRadius="80%"
                        outerRadius="100%"
                        startAngle={225}
                        endAngle={-45}
                        data={[{ value: score, fill: color }]}
                    >
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar background={{ fill: '#f1f5f9' }} dataKey="value" cornerRadius={12} />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-4xl font-black text-slate-800"
                    >
                        {score}
                    </motion.span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Readiness</span>
                </div>
            </div>
            <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-2"
            >
                <span
                    className="text-[11px] font-black px-4 py-1.5 rounded-full shadow-sm border"
                    style={{ backgroundColor: `${color}10`, color, borderColor: `${color}30` }}
                >
                    {label}
                </span>
            </motion.div>
        </div>
    );
};

// ── Priority Badge ────────────────────────────────────────────────────────
const PriorityBadge: React.FC<{ priority: 'critical' | 'important' | 'nice-to-have' }> = ({ priority }) => {
    const styles = {
        'critical': 'bg-red-100 text-red-700 border-red-200',
        'important': 'bg-amber-100 text-amber-700 border-amber-200',
        'nice-to-have': 'bg-slate-100 text-slate-600 border-slate-200',
    };
    const labels = { 'critical': '🔴 Critical', 'important': '🟡 Important', 'nice-to-have': '🔵 Nice to Have' };
    return (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${styles[priority] || styles['nice-to-have']} uppercase tracking-wider`}>
            {labels[priority] || '🔵 Nice to Have'}
        </span>
    );
};

// ── Main Component ────────────────────────────────────────────────────────
const SkillGapAnalyzer: React.FC = () => {
    const [targetRole, setTargetRole] = useState('');
    const [result, setResult] = useState<SkillGapResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!targetRole.trim() || isLoading) {
            toast.error('Please enter a target role.');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setResult(null);
        
        try {
            const data = await analyzeSkillGap(targetRole.trim());
            setResult(data);
            toast.success('Gap analysis complete!');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
            setError(msg);
            toast.error('AI Analysis failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Header Section */}
            <div className="text-center space-y-2">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 mb-2"
                >
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Profile-Agnostic Intelligence</span>
                </motion.div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nexar Skill Gap Matrix</h1>
                <p className="text-slate-500 text-sm max-w-xl mx-auto">
                    Compare your current academic and project profile directly against your dream job role to identify critical learning paths.
                </p>
            </div>

            {/* Input Configuration Card */}
            <div className="card max-w-2xl mx-auto shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                        <Target size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900">Career Trajectory Input</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Targeted Gap Analysis</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-slate-500 uppercase ml-1">Desired Job Role</label>
                        <input 
                            type="text"
                            value={targetRole}
                            onChange={e => setTargetRole(e.target.value)}
                            placeholder="e.g. Machine Learning Engineer"
                            className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-500/10 transition-all outline-none text-sm font-bold placeholder-slate-400"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAnalyze();
                            }}
                        />
                    </div>
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || targetRole.trim().length < 2}
                        className="w-full !mt-6 btn-primary flex items-center justify-center gap-3 py-4 shadow-xl shadow-amber-500/20 disabled:grayscale hover:bg-slate-800 transition-all"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Zap size={20} />
                        )}
                        <span className="font-black uppercase tracking-widest text-xs">
                            {isLoading ? 'Executing Matrix...' : 'Identify Skill Gaps'}
                        </span>
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-2 font-medium italic">
                        The AI will automatically fetch your profile datasets (Skills, Projects, Education) for comparison.
                    </p>
                </div>

                {/* Suggested Roles Chips */}
                {!result && !isLoading && (
                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-700 delay-200">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Quick Select:</span>
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
                                onClick={() => setTargetRole(sug)}
                                className={`text-[10px] font-black px-3 py-1.5 rounded-xl border transition-all duration-300 hover:scale-105 ${
                                    targetRole === sug 
                                    ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-200' 
                                    : 'bg-white text-slate-600 border-slate-100 hover:border-amber-200 hover:text-amber-600'
                                }`}
                            >
                                {sug}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 items-start p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm shadow-sm max-w-2xl mx-auto"
                >
                    <AlertCircle size={18} className="flex-shrink-0" />
                    <p className="font-bold">{error}</p>
                </motion.div>
            )}

            {/* Results Section */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="card max-w-2xl mx-auto flex flex-col items-center justify-center py-20 gap-4"
                    >
                        <div className="relative">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="w-16 h-16 rounded-full border-4 border-amber-100 border-t-amber-500"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Zap className="text-amber-500 animate-pulse" size={24} />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-black text-slate-900 tracking-tight">Cross-Referencing Profile</p>
                            <p className="text-sm text-slate-400 font-medium italic">Mapping existing competencies against "{targetRole}"</p>
                        </div>
                    </motion.div>
                )}

                {result && !isLoading && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid gap-6 md:grid-cols-12"
                    >
                        {/* Overall Readiness Column */}
                        <div className="md:col-span-4 space-y-6">
                            <div className="card text-center flex flex-col items-center gap-6 overflow-hidden relative group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
                                <ReadinessGauge score={result.readinessScore} />
                            </div>

                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="card bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-20 transform translate-x-2 -translate-y-2">
                                    <Sparkles size={80} />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                        Strategic Summary
                                    </p>
                                    <p className="text-sm font-medium leading-relaxed italic text-white/90">
                                        "{result.summary}"
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Detailed Analysis Column */}
                        <div className="md:col-span-8 space-y-6">
                            
                            {/* Strong & Need Improvement Grid */}
                            <div className="grid sm:grid-cols-2 gap-6">
                                {/* Strong Skills */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="card border-emerald-100 bg-emerald-50/20"
                                >
                                    <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
                                        <CheckCircle size={16} /> Verified Strengths
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {result.strongSkills.length > 0 ? result.strongSkills.map((s, i) => (
                                            <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                {s}
                                            </span>
                                        )) : (
                                            <p className="text-xs text-slate-400 italic">No strong matches found yet.</p>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Needs Improvement */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="card border-amber-100 bg-amber-50/20"
                                >
                                    <p className="text-xs font-black uppercase tracking-widest text-amber-600 mb-4 flex items-center gap-2">
                                        <TrendingUp size={16} /> Needs Improvement
                                    </p>
                                    <div className="space-y-3">
                                        {result.needsImprovement.length > 0 ? result.needsImprovement.map((imp, i) => (
                                            <div key={i} className="space-y-1 p-2.5 rounded-xl bg-white/60 border border-amber-200">
                                                <span className="text-[11px] font-black text-slate-800">{imp.skill}</span>
                                                <p className="text-[10px] text-slate-500 leading-tight italic">{imp.reason}</p>
                                            </div>
                                        )) : (
                                            <p className="text-xs text-slate-400 italic">Core skills look solid.</p>
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                            {/* Missing Skills */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="card border-red-100 bg-red-50/20"
                            >
                                <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-2">
                                    <AlertTriangle size={16} /> Missing Critical Competencies
                                </p>
                                <div className="space-y-3">
                                    {result.missingSkills.length > 0 ? result.missingSkills.map((skill, i) => (
                                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/50 border border-white/60 shadow-sm">
                                            <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5 shadow-inner">
                                                {i + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                    <span className="text-sm font-black text-slate-800">{skill.skill}</span>
                                                    <PriorityBadge priority={skill.priority} />
                                                </div>
                                                <p className="text-xs text-slate-600 leading-relaxed">{skill.reason}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-xs text-slate-400 italic">No missing core competencies detected.</p>
                                    )}
                                </div>
                            </motion.div>

                            {/* Learning Recommendations */}
                            {result.learningRecommendations.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="card border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/50"
                                >
                                    <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                                        <BookOpen size={16} /> Learning Map
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {result.learningRecommendations.map((r, i) => (
                                            <div key={i} className="flex flex-col p-4 rounded-xl bg-white shadow-sm border border-blue-50 group hover:border-blue-200 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.skill}</p>
                                                    {r.estimatedHours && (
                                                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                                                            ~{r.estimatedHours}h
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="flex-grow">
                                                    {r.url ? (
                                                        <a href={r.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors flex items-center gap-1.5 line-clamp-2">
                                                            {r.resource} <ExternalLink size={12} className="text-slate-400 group-hover:text-blue-500" />
                                                        </a>
                                                    ) : (
                                                        <p className="text-sm font-bold text-slate-800 line-clamp-2">{r.resource}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SkillGapAnalyzer;
