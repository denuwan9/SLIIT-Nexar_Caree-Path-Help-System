/**
 * ResumeAnalyzer.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Redesigned ATS Resume Analyzer. 
 * Features: Target role selection, PDF file upload, text extraction,
 * and hyper-personalized AI analysis with Framer Motion animations.
 * ─────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useRef } from 'react';
import { 
  Loader2, Zap, AlertCircle, CheckCircle, 
  TrendingUp, Hash, Upload, Target, FileUp, Sparkles,
  ArrowRight, ShieldCheck, Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { ResumeAnalysisResult } from '../../types/ai';
import { analyzeResume, extractTextFromFile } from '../../services/aiService';
import { toast } from 'react-hot-toast';

// ── ATS Score Gauge (Recharts RadialBar) ──────────────────────────────────
const AtsGauge: React.FC<{ score: number }> = ({ score }) => {
    const color = score >= 85 ? '#10b981' : score >= 70 ? '#3b82f6' : score >= 50 ? '#f59e0b' : '#ef4444';
    const label = score >= 85 ? 'System Optimized' : score >= 70 ? 'High Competency' : score >= 50 ? 'Developing' : 'Critical Gaps';

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-56 h-56">
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
                        <RadialBar background={{ fill: 'rgba(15, 23, 42, 0.03)' }} dataKey="value" cornerRadius={12} />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="flex items-baseline gap-0.5">
                        <motion.span 
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-6xl font-black text-[#0F172A] tracking-tighter"
                        >
                            {score}
                        </motion.span>
                        <span className="text-xl font-black text-slate-400">%</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Match Index</span>
                </div>
            </div>
            <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-4"
            >
                <span
                    className="text-[11px] font-black px-6 py-2.5 rounded-2xl shadow-sm border uppercase tracking-widest"
                    style={{ backgroundColor: `${color}10`, color, borderColor: `${color}30` }}
                >
                    {label}
                </span>
            </motion.div>
        </div>
    );
};

// ── Score Bar ─────────────────────────────────────────────────────────────
const ScoreBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="group">
        <div className="flex justify-between mb-2">
            <p className="text-[10px] font-black text-[#64748B] uppercase tracking-[0.15em]">{label}</p>
            <p className="text-xs font-black text-[#0F172A]">{value}%</p>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50 shadow-inner">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="h-full rounded-full bg-gradient-to-r from-[#0F172A] via-blue-600 to-indigo-500 shadow-sm"
            />
        </div>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────
const ResumeAnalyzer: React.FC = () => {
    const [targetRole, setTargetRole] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file.');
            return;
        }

        setIsExtracting(true);
        setError(null);
        try {
            const text = await extractTextFromFile(file);
            setResumeText(text);
            toast.success('Resume intelligence extracted.');
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Failed to extract text from PDF.';
            setError(`${msg} Manual input required.`);
            toast.error('Extraction failure.');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleAnalyze = async () => {
        if (!resumeText.trim() || !targetRole.trim() || isLoading) {
            toast.error('Parameters missing: Target Role & Resume content required.');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setResult(null);
        
        try {
            const data = await analyzeResume(resumeText.trim(), targetRole.trim());
            setResult(data);
            toast.success('Simulation complete.');
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Analysis failed. Intelligence sync lost.';
            setError(msg);
            toast.error('AI Processing error.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-12 animate-in fade-in duration-1000">
            {/* ─── Trajectory Header ─── */}
            <div className="text-center space-y-4">
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-50 text-[#0F172A] border border-slate-100 shadow-sm"
                >
                    <ShieldCheck size={16} className="text-blue-500" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">ATS Intelligence Matrix</span>
                </motion.div>
                <h1 className="text-4xl font-black text-[#0F172A] tracking-tighter">Nexar Resume Intelligence</h1>
                <p className="text-[#64748B] text-sm max-w-2xl mx-auto font-bold leading-relaxed">
                    Benchmark your professional profile against enterprise-grade ATS simulation. 
                    Optimise for semantic alignment and high-tier market entry.
                </p>
            </div>

            {/* ─── Input Control Grid ─── */}
            <div className="grid gap-8 lg:grid-cols-12">
                {/* Configuration Card */}
                <div className="lg:col-span-5 space-y-8">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50 flex flex-col h-full hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-700">
                        <div className="flex items-center gap-5 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-[#0F172A] flex items-center justify-center shadow-xl shadow-slate-200">
                                <Target size={24} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-[13px] font-black text-[#0F172A] tracking-[0.2em] uppercase">Target Parameter</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Optimization Alignment</p>
                            </div>
                        </div>

                        <div className="space-y-6 flex-grow">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest ml-1">Target Job Role</label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#0F172A] transition-colors" size={18} />
                                    <input 
                                        type="text"
                                        value={targetRole}
                                        onChange={e => setTargetRole(e.target.value)}
                                        placeholder="e.g. Principal Cloud Architect"
                                        className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-[#0F172A] focus:ring-4 focus:ring-slate-100 transition-all outline-none text-sm font-black text-[#0F172A] placeholder-[#94A3B8]"
                                    />
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-50">
                                <p className="text-[11px] font-black text-[#64748B] uppercase tracking-widest mb-4 ml-1">Profile Extraction Source</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isExtracting}
                                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border-2 border-dashed border-slate-100 hover:border-[#0F172A] hover:bg-slate-50 transition-all group"
                                    >
                                        {isExtracting ? (
                                            <Loader2 size={28} className="text-blue-500 animate-spin" />
                                        ) : (
                                            <Upload size={28} className="text-[#94A3B8] group-hover:text-[#0F172A] transition-colors" />
                                        )}
                                        <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest text-center">
                                            {isExtracting ? 'Syncing...' : 'Upload PDF'}
                                        </span>
                                    </button>
                                    <button 
                                        onClick={() => setResumeText('')}
                                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border-2 border-slate-100 hover:border-[#0F172A] hover:bg-slate-50 transition-all group"
                                    >
                                        <ArrowRight size={28} className="text-[#94A3B8] group-hover:text-[#0F172A] transition-colors" />
                                        <span className="text-[10px] font-black text-[#64748B] uppercase tracking-widest text-center">Manual Buffer</span>
                                    </button>
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    accept=".pdf"
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading || isExtracting || resumeText.length < 50 || !targetRole}
                            className="w-full mt-8 bg-[#0F172A] text-white flex items-center justify-center gap-4 py-6 rounded-2xl shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all duration-500 disabled:opacity-20 disabled:scale-100"
                        >
                            {isLoading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <Sparkles size={24} className="text-amber-400" />
                            )}
                            <span className="font-black uppercase tracking-[0.2em] text-[12px]">
                                {isLoading ? 'Generating IQ Report...' : 'Simulate ATS Alignment'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Editor/Input Card */}
                <div className="lg:col-span-7">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50 flex flex-col h-full min-h-[500px] hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-700">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                    <FileUp size={16} className="text-[#64748B]" />
                                </div>
                                <span className="text-[11px] font-black text-[#64748B] uppercase tracking-widest">Source Material Buffer</span>
                            </div>
                            <div className="px-4 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {resumeText.length} <span className="text-[#64748B] opacity-50 ml-0.5">Characters</span>
                            </div>
                        </div>
                        <textarea
                            value={resumeText}
                            onChange={e => setResumeText(e.target.value)}
                            placeholder="Input profile narrative or trigger PDF extraction above..."
                            className="flex-grow w-full p-8 rounded-3xl bg-slate-50/30 border border-slate-50 focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-slate-50 transition-all outline-none text-[15px] text-[#0F172A] font-bold leading-relaxed resize-none placeholder-slate-300"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 items-center p-6 rounded-[2rem] bg-rose-50 border border-rose-100 text-rose-600 shadow-sm"
                >
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-rose-500 shadow-sm border border-rose-100 flex-shrink-0">
                        <AlertCircle size={20} />
                    </div>
                    <div className="font-bold text-sm tracking-tight">{error}</div>
                </motion.div>
            )}

            {/* ─── Intelligence Report Section ─── */}
            <AnimatePresence>
                {isLoading && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl flex flex-col items-center justify-center py-24 gap-8"
                    >
                        <div className="relative">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-[#0F172A] shadow-inner"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Zap className="text-blue-500 animate-pulse" size={28} />
                            </div>
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-2xl font-black text-[#0F172A] tracking-tighter">Synthetically Benchmarking Intelligence</p>
                            <p className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">Executing Tier-1 Context Match for "{targetRole}"</p>
                        </div>
                    </motion.div>
                )}

                {result && !isLoading && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid gap-10 lg:grid-cols-3"
                    >
                        {/* Summary Column */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-white rounded-[3rem] p-10 text-center flex flex-col items-center gap-10 shadow-xl border border-slate-100/50 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-[#0F172A] to-indigo-600" />
                                <AtsGauge score={result.atsScore} />
                                
                                <div className="w-full space-y-6 pt-6 border-t border-slate-50">
                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Metric Breakdown</p>
                                    <div className="space-y-6 px-2 text-left">
                                        <ScoreBar label="Semantic Density" value={result.scoreBreakdown.keywordDensity} />
                                        <ScoreBar label="Structure Integrity" value={result.scoreBreakdown.formatting} />
                                        <ScoreBar label="Quantified Output" value={result.scoreBreakdown.quantifiedAchievements} />
                                        <ScoreBar label="Linguistic Impact" value={result.scoreBreakdown.actionVerbs} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Report Column */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Verdict Banner */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-[#0F172A] rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden border border-slate-800"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-5 transform translate-x-4 -translate-y-4">
                                    <Sparkles size={160} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-400">Strategic Intelligence Report</p>
                                    </div>
                                    <p className="text-xl md:text-2xl font-bold leading-relaxed italic text-white/95 tracking-tight">
                                        "{result.overallFeedback}"
                                    </p>
                                </div>
                            </motion.div>

                            {/* Keywords Matrix */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50"
                            >
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-600">
                                        <Hash size={20} />
                                    </div>
                                    <h4 className="text-[13px] font-black uppercase tracking-[0.2em] text-[#0F172A]">Target Role Keyword Matrix</h4>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {result.keywordsToAdd.map((kw, i) => (
                                        <motion.span 
                                            key={i}
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.3 + (i * 0.05) }}
                                            className="text-[12px] font-black px-5 py-2.5 rounded-2xl bg-white border border-slate-100 text-[#0F172A] shadow-sm flex items-center gap-3 hover:border-blue-400 hover:scale-105 transition-all cursor-default group"
                                        >
                                            <span className="text-blue-500 group-hover:rotate-90 transition-transform">+</span> {kw}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Impact & Gaps Matrix */}
                            <div className="grid gap-8 md:grid-cols-2">
                                {/* Strengths */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-emerald-50/20 rounded-[2.5rem] p-8 border border-emerald-100/50 shadow-sm"
                                >
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100 text-emerald-600">
                                            <CheckCircle size={20} />
                                        </div>
                                        <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-emerald-700">High-Impact Nodes</h4>
                                    </div>
                                    <ul className="space-y-4">
                                        {result.strengths.map((s, i) => (
                                            <li key={i} className="text-[14px] font-bold text-slate-700 flex gap-4 items-start bg-white/50 p-4 rounded-2xl border border-transparent hover:border-emerald-100 transition-all">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                                                <span>{s}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>

                                {/* Gaps */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-amber-50/20 rounded-[2.5rem] p-8 border border-amber-100/50 shadow-sm"
                                >
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 text-amber-600">
                                            <TrendingUp size={20} />
                                        </div>
                                        <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-amber-700">Optimization Roadmap</h4>
                                    </div>
                                    <div className="space-y-4">
                                        {result.improvements.map((imp, i) => (
                                            <div key={i} className="p-5 rounded-2xl bg-white/80 border border-amber-50 shadow-sm hover:shadow-md transition-all group">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{imp.section}</span>
                                                    <AlertCircle size={14} className="text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                                <p className="text-[14px] font-black text-[#0F172A] leading-tight mb-2">{imp.fix}</p>
                                                <p className="text-[12px] font-bold text-[#64748B] leading-relaxed italic opacity-80">{imp.issue}</p>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


export default ResumeAnalyzer;
