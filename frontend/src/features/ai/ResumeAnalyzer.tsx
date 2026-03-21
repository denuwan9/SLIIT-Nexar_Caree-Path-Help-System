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
  FileText, Loader2, Zap, AlertCircle, CheckCircle, 
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
    const label = score >= 85 ? 'Optimized' : score >= 70 ? 'Strong' : score >= 50 ? 'Developing' : 'Critical Fixes Needed';

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
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Match Accuracy</span>
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

// ── Score Bar ─────────────────────────────────────────────────────────────
const ScoreBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div className="group">
        <div className="flex justify-between mb-1.5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{label}</p>
            <p className="text-xs font-black text-slate-700">{value}%</p>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 shadow-sm"
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
            toast.success('Resume text extracted successfully!');
        } catch (err: any) {
            setError('Failed to extract text from PDF. You can still paste it manually.');
            toast.error('Extraction failed.');
        } finally {
            setIsExtracting(false);
        }
    };

    const handleAnalyze = async () => {
        if (!resumeText.trim() || !targetRole.trim() || isLoading) {
            toast.error('Please provide both a target role and resume content.');
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setResult(null);
        
        try {
            const data = await analyzeResume(resumeText.trim(), targetRole.trim());
            setResult(data);
            toast.success('Analysis complete!');
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
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 mb-2"
                >
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Enterprise-Grade Analysis</span>
                </motion.div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Nexar Resume Intelligence</h1>
                <p className="text-slate-500 text-sm max-w-xl mx-auto">
                    Optimize your visibility. Our AI simulates elite ATS parsers to ensure your profile reaches the hiring manager's desk.
                </p>
            </div>

            {/* Input Grid */}
            <div className="grid gap-6 md:grid-cols-12">
                {/* Configuration Card */}
                <div className="md:col-span-5 space-y-6">
                    <div className="card h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl">
                                <Target size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900">Optimization Goal</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Targeted Analysis</p>
                            </div>
                        </div>

                        <div className="space-y-4 flex-grow">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black text-slate-500 uppercase ml-1">Target Job Role</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input 
                                        type="text"
                                        value={targetRole}
                                        onChange={e => setTargetRole(e.target.value)}
                                        placeholder="e.g. Senior Software Engineer"
                                        className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-sm font-bold placeholder-slate-400"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-[11px] font-black text-slate-500 uppercase mb-3 ml-1">Resume Source</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isExtracting}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group"
                                    >
                                        {isExtracting ? (
                                            <Loader2 size={24} className="text-blue-500 animate-spin" />
                                        ) : (
                                            <Upload size={24} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                                        )}
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                                            {isExtracting ? 'Extracting...' : 'Upload PDF'}
                                        </span>
                                    </button>
                                    <button 
                                        onClick={() => setResumeText('')}
                                        className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 border-slate-200 hover:border-slate-800 hover:bg-slate-50 transition-all group"
                                    >
                                        <ArrowRight size={24} className="text-slate-400 group-hover:text-slate-800 transition-colors" />
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">Paste Manually</span>
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
                            disabled={isLoading || isExtracting || resumeText.length < 100 || !targetRole}
                            className="w-full mt-6 btn-primary flex items-center justify-center gap-3 py-4 shadow-xl shadow-blue-500/20 disabled:grayscale"
                        >
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <Sparkles size={20} />
                            )}
                            <span className="font-black uppercase tracking-widest text-xs">
                                {isLoading ? 'Generating IQ Report...' : 'Analyze My Resume'}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Editor/Input Card */}
                <div className="md:col-span-7">
                    <div className="card h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <FileUp size={16} className="text-slate-400" />
                                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Resume Content</span>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${resumeText.length > 100 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                                {resumeText.length} characters
                            </span>
                        </div>
                        <textarea
                            value={resumeText}
                            onChange={e => setResumeText(e.target.value)}
                            placeholder="Paste your resume content here or upload a PDF above..."
                            className="flex-grow w-full p-4 rounded-2xl bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-blue-200 transition-all outline-none text-sm text-slate-700 font-mono leading-relaxed resize-none scrollbar-hide"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3 items-start p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm shadow-sm"
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
                        className="card flex flex-col items-center justify-center py-20 gap-4"
                    >
                        <div className="relative">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Zap className="text-blue-600 animate-pulse" size={24} />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-black text-slate-900 tracking-tight">Crunching Industry Data</p>
                            <p className="text-sm text-slate-400 font-medium italic">Benchmarking against elite standards for "{targetRole}"</p>
                        </div>
                    </motion.div>
                )}

                {result && !isLoading && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid gap-6 md:grid-cols-3"
                    >
                        {/* Summary Column */}
                        <div className="space-y-6">
                            <div className="card text-center flex flex-col items-center gap-6 overflow-hidden relative group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                                <AtsGauge score={result.atsScore} />
                                
                                <div className="w-full space-y-4 pt-2 border-t border-slate-100">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analysis Breakdown</p>
                                    <div className="space-y-4 px-2">
                                        <ScoreBar label="Semantic Match" value={result.scoreBreakdown.keywordDensity} />
                                        <ScoreBar label="ATS Flow" value={result.scoreBreakdown.formatting} />
                                        <ScoreBar label="Data Impact" value={result.scoreBreakdown.quantifiedAchievements} />
                                        <ScoreBar label="Leadership Voice" value={result.scoreBreakdown.actionVerbs} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Report Column */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Verdict */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="card bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-3 opacity-20 transform translate-x-2 -translate-y-2">
                                    <Sparkles size={80} />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                                        AI Strategy Overview
                                    </p>
                                    <p className="text-base font-medium leading-relaxed italic text-white/90">
                                        "{result.overallFeedback}"
                                    </p>
                                </div>
                            </motion.div>

                            {/* Keywords */}
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="card"
                            >
                                <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                                    <Hash size={16} /> Targeted Keywords for "{targetRole}"
                                </p>
                                <div className="flex flex-wrap gap-2.5">
                                    {result.keywordsToAdd.map((kw, i) => (
                                        <motion.span 
                                            key={i}
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.3 + (i * 0.05) }}
                                            className="text-xs font-bold px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1.5"
                                        >
                                            <span className="text-blue-400">+</span> {kw}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Strengths & Improvements */}
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Success */}
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="card border-emerald-100 bg-emerald-50/20"
                                >
                                    <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
                                        <CheckCircle size={16} /> High Impact Areas
                                    </p>
                                    <ul className="space-y-3">
                                        {result.strengths.map((s, i) => (
                                            <li key={i} className="text-[13px] font-medium text-slate-700 flex gap-2.5 items-start">
                                                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <CheckCircle size={10} className="text-emerald-600" />
                                                </div>
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
                                    className="card border-amber-100 bg-amber-50/20"
                                >
                                    <p className="text-xs font-black uppercase tracking-widest text-amber-600 mb-4 flex items-center gap-2">
                                        <TrendingUp size={16} /> Optimization Gaps
                                    </p>
                                    <div className="space-y-4">
                                        {result.improvements.map((imp, i) => (
                                            <div key={i} className="space-y-1.5 p-3 rounded-xl bg-white/60 border border-amber-200">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">{imp.section}</span>
                                                    <AlertCircle size={12} className="text-amber-400" />
                                                </div>
                                                <p className="text-[13px] font-bold text-slate-800 leading-tight">{imp.fix}</p>
                                                <p className="text-[11px] text-slate-500 leading-relaxed italic">{imp.issue}</p>
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
