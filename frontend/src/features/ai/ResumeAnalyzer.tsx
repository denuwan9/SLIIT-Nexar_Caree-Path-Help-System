import React, { useState, useRef, useEffect } from 'react';
import { 
    FileText, 
    Upload, 
    Zap, 
    AlertCircle, 
    CheckCircle, 
    Loader2, 
    ArrowRight, 
    Search,
    Brain,
    Trophy,
    Target,
    Layout,
    Type,
    AlertTriangle,
    X,
    UserCircle
} from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { ResumeAnalysisResult, ActionableTip } from '../../types/ai';
import { analyzeResume } from '../../services/aiService';
import { useSystemBoot } from '../../hooks/useSystemBoot';
import { motion, AnimatePresence } from 'framer-motion';

// ── Components ─────────────────────────────────────────────────────────────

// 1. Radial Progress Ring
const MetricRing: React.FC<{ 
    value: number; 
    label: string; 
    size?: number; 
    strokeWidth?: number;
    color?: string;
    fontSize?: string;
}> = ({ value, label, size = 120, strokeWidth = 10, color = "#6366f1", fontSize = "text-xl" }) => (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
                cx="50%" cy="50%"
                innerRadius="80%"
                outerRadius="100%"
                barSize={strokeWidth}
                startAngle={90}
                endAngle={90 - (3.6 * value)}
                data={[{ value: 100, fill: '#f1f5f9' }, { value, fill: color }]}
            >
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={strokeWidth / 2} />
            </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`${fontSize} font-black text-slate-800`}>{value}%</span>
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">{label}</span>
        </div>
    </div>
);

// 2. Section Score Pill
const SectionScore: React.FC<{ label: string; score: number }> = ({ label, score }) => (
    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{label}</span>
        <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    className={`h-full rounded-full ${score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                />
            </div>
            <span className="text-[10px] font-black text-slate-700">{score}%</span>
        </div>
    </div>
);

// 3. Tip Card
const TipCard: React.FC<{ tip: ActionableTip }> = ({ tip }) => {
    const icons = {
        Formatting: <Layout size={14} />,
        Content: <Type size={14} />,
        Impact: <Trophy size={14} />
    };
    
    const colors = {
        high: 'bg-rose-50 text-rose-600 border-rose-100',
        medium: 'bg-amber-50 text-amber-600 border-amber-100',
        low: 'bg-blue-50 text-blue-600 border-blue-100'
    };

    return (
        <div className={`p-4 rounded-2xl border ${colors[tip.priority]} flex gap-3 transition-all hover:shadow-md`}>
            <div className="mt-1 opacity-80">{icons[tip.category]}</div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-70">{tip.category}</span>
                    <span className={`text-[7px] font-black py-0.5 px-1.5 rounded-full uppercase ${tip.priority === 'high' ? 'bg-rose-500 text-white' : 'bg-white/50'}`}>
                        {tip.priority} priority
                    </span>
                </div>
                <p className="text-xs font-bold leading-relaxed">{tip.tip}</p>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────
const ResumeAnalyzer: React.FC = () => {
    const [inputMode, setInputMode] = useState<'upload' | 'text'>('upload');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { boot, bootData } = useSystemBoot();

    const profileTargetRoles: string[] = bootData?.ProfileData?.careerGoals?.targetRoles || [];

    useEffect(() => {
        boot();
    }, [boot]);

    // Pre-fill target role from profile if available
    useEffect(() => {
        if (bootData?.ProfileData?.careerGoals?.targetRoles?.[0]) {
            setTargetRole(bootData.ProfileData.careerGoals.targetRoles[0]);
        }
    }, [bootData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'application/pdf') {
            setResumeFile(file);
            setError(null);
        } else {
            setError('Please upload a valid PDF file.');
        }
    };

    const handleAnalyze = async () => {
        const input = inputMode === 'upload' ? resumeFile : resumeText;
        if (!input || isLoading) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const data = await analyzeResume(input, jobDescription, targetRole);
            setResult(data);
            // Scroll to results
            window.scrollTo({ top: 400, behavior: 'smooth' });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Analysis failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setResumeFile(null);
        setResumeText('');
        setTargetRole(bootData?.ProfileData?.careerGoals?.targetRoles?.[0] || '');
        setJobDescription('');
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* 1. INPUT SECTION */}
            <AnimatePresence mode="wait">
                {!result ? (
                    <motion.div 
                        key="input"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-6"
                    >
                        {/* Hero Header */}
                        <div className="text-center space-y-3 mb-12">
                            <div className="inline-flex p-3 bg-cobalt-sliit/5 rounded-3xl text-cobalt-sliit mb-4">
                                <Brain size={32} />
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tight">ATS <span className="text-cobalt-sliit">Architect</span></h2>
                            <p className="text-slate-400 max-w-lg mx-auto text-sm font-medium">
                                Upload your resume and let our AI simulate an institutional-grade ATS audit. 
                                Cross-reference with a job description for maximum precision.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-5 gap-8">
                            <div className="lg:col-span-3 space-y-6">
                                {/* Resume Input Card */}
                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-cobalt-sliit text-white rounded-2xl">
                                                <FileText size={20} />
                                            </div>
                                            <div>
                                                <h3 className="font-black text-slate-900 uppercase tracking-tight">Source Material</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Input Method</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                                            <button 
                                                onClick={() => setInputMode('upload')}
                                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${inputMode === 'upload' ? 'bg-white text-cobalt-sliit shadow-sm' : 'text-slate-400'}`}
                                            >
                                                PDF Upload
                                            </button>
                                            <button 
                                                onClick={() => setInputMode('text')}
                                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${inputMode === 'text' ? 'bg-white text-cobalt-sliit shadow-sm' : 'text-slate-400'}`}
                                            >
                                                Plain Text
                                            </button>
                                        </div>
                                    </div>

                                    {inputMode === 'upload' ? (
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`
                                                relative w-full h-64 rounded-3xl border-2 border-dashed transition-all cursor-pointer group
                                                flex flex-col items-center justify-center gap-4
                                                ${resumeFile ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 hover:border-cobalt-sliit hover:bg-slate-50'}
                                            `}
                                        >
                                            <input 
                                                type="file" 
                                                accept=".pdf" 
                                                className="hidden" 
                                                ref={fileInputRef} 
                                                onChange={handleFileChange}
                                            />
                                            {resumeFile ? (
                                                <>
                                                    <div className="p-4 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/20">
                                                        <CheckCircle size={32} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-black text-slate-800 uppercase tracking-tight">{resumeFile.name}</p>
                                                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">File Locked & Ready</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="p-4 bg-slate-100 text-slate-400 rounded-full group-hover:bg-cobalt-sliit/10 group-hover:text-cobalt-sliit transition-colors">
                                                        <Upload size={32} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="font-black text-slate-800 uppercase tracking-tight">Drop Resume PDF</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">Max size: 5MB — SLIIT Institutional Format Recommended</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <textarea 
                                            value={resumeText}
                                            onChange={(e) => setResumeText(e.target.value)}
                                            placeholder="PASTE YOUR RESUME RAW TEXT HERE..."
                                            className="w-full h-64 rounded-3xl bg-slate-50 border border-slate-100 p-6 text-sm font-mono text-slate-600 focus:outline-none focus:ring-4 focus:ring-cobalt-sliit/5 focus:bg-white focus:border-cobalt-sliit transition-all resize-none"
                                        />
                                    )}
                                </div>

                                {/* NEW: Target Role Card Inside Source Material or Adjacent? Let's put it as a new section */}
                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-3 bg-cobalt-sliit/5 text-cobalt-sliit rounded-2xl">
                                            <UserCircle size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 uppercase tracking-tight">Mission Target</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Desired Job Role</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <input 
                                            type="text"
                                            value={targetRole}
                                            onChange={(e) => setTargetRole(e.target.value)}
                                            placeholder="E.G. FULL STACK DEVELOPER, UI/UX DESIGNER..."
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-4 focus:ring-cobalt-sliit/5 focus:bg-white focus:border-cobalt-sliit transition-all"
                                        />
                                        
                                        {profileTargetRoles.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mr-2 py-1">Quick Select:</span>
                                                {profileTargetRoles.map((role: string, i: number) => (
                                                    <button 
                                                        key={i}
                                                        onClick={() => setTargetRole(role)}
                                                        className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${targetRole === role ? 'bg-cobalt-sliit text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                                                    >
                                                        {role}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-6">
                                {/* Optional JD Card */}
                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="p-3 bg-rose-500/5 text-rose-500 rounded-2xl">
                                            <Target size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 uppercase tracking-tight">Target Mission</h3>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optional JD Comparison</p>
                                        </div>
                                    </div>
                                    
                                    <textarea 
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="PASTE THE TARGET JOB DESCRIPTION HERE FOR PRECISE KEYWORD MATCHING..."
                                        className="w-full h-64 rounded-3xl bg-slate-50 border border-slate-100 p-6 text-[11px] font-bold uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:bg-white focus:border-rose-500 transition-all resize-none placeholder:opacity-50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Error Handling */}
                        {error && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest">
                                <AlertTriangle size={14} /> {error}
                            </motion.div>
                        )}

                        {/* Analysis Trigger */}
                        <div className="flex justify-center pt-8">
                            <button 
                                onClick={handleAnalyze}
                                disabled={isLoading || (inputMode === 'upload' ? !resumeFile : !resumeText.trim())}
                                className={`
                                    group relative px-12 py-5 rounded-full overflow-hidden transition-all duration-500
                                    ${isLoading ? 'bg-slate-100 cursor-not-allowed' : 'bg-cobalt-sliit hover:scale-105 shadow-2xl shadow-cobalt-sliit/30'}
                                `}
                            >
                                <div className="relative z-10 flex items-center gap-3">
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin text-cobalt-sliit" />
                                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Processing Core...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={18} className="text-white fill-white" />
                                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Initialize Analysis</span>
                                            <ArrowRight size={18} className="text-white group-hover:translate-x-2 transition-transform" />
                                        </>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    /* 2. RESULTS DASHBOARD */
                    <motion.div 
                        key="results"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                    >
                        {/* Summary Header */}
                        <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                            {/* Main Score Card */}
                            <div className="lg:w-1/3 bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl flex flex-col items-center justify-center text-center">
                                <div className="mb-4">
                                    <MetricRing 
                                        value={result.atsScore} 
                                        label="ATS MATCH" 
                                        size={220} 
                                        strokeWidth={16} 
                                        fontSize="text-6xl" 
                                        color={result.atsScore >= 75 ? "#10b981" : result.atsScore >= 50 ? "#6366f1" : "#f43f5e"}
                                    />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 uppercase mb-4 tracking-tighter">Institutional Verdict</h3>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">
                                    {result.atsScore >= 80 
                                        ? 'OPTIMIZED: READY FOR PRODUCTION SYSTEMS' 
                                        : result.atsScore >= 60 
                                        ? 'STABLE: MINOR OPTIMIZATION REQUIRED' 
                                        : 'CRITICAL: ARCHITECTURE NEEDS REFACTOR'}
                                </p>
                            </div>

                            {/* Verdict & Context Card */}
                            <div className="lg:w-2/3 bg-slate-900 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl flex flex-col justify-between">
                                <div className="relative z-10 flex flex-col gap-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/10 rounded-xl text-white">
                                                <Brain size={20} />
                                            </div>
                                            <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">Nexar Core Assessment</span>
                                        </div>
                                        <button onClick={reset} className="p-2 hover:bg-white/10 rounded-full text-white/40 transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <h2 className="text-3xl font-black text-white uppercase tracking-tight leading-none italic pr-12">
                                        " {result.overallFeedback} "
                                    </h2>
                                </div>
                                
                                <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                                    <div className="space-y-4">
                                        <MetricRing value={result.scoreBreakdown.keywordDensity} label="KEYWORD" size={90} strokeWidth={6} fontSize="text-lg" color="#6366f1" />
                                    </div>
                                    <div className="space-y-4">
                                        <MetricRing value={result.scoreBreakdown.formatting} label="FORMAT" size={90} strokeWidth={6} fontSize="text-lg" color="#8b5cf6" />
                                    </div>
                                    <div className="space-y-4">
                                        <MetricRing value={result.scoreBreakdown.quantifiedAchievements} label="IMPACT" size={90} strokeWidth={6} fontSize="text-lg" color="#ec4899" />
                                    </div>
                                    <div className="space-y-4">
                                        <MetricRing value={result.scoreBreakdown.actionVerbs} label="VERBS" size={90} strokeWidth={6} fontSize="text-lg" color="#06b6d4" />
                                    </div>
                                </div>

                                {/* Abstract Background Rings */}
                                <div className="absolute top-[-20%] right-[-10%] w-[400px] h-[400px] bg-cobalt-sliit/20 rounded-full blur-[100px] pointer-events-none" />
                            </div>
                        </div>

                        {/* Detailed Modules Grid */}
                        <div className="grid lg:grid-cols-3 gap-8">
                            
                            {/* Tips & Actions */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                                    <h4 className="flex items-center gap-3 text-sm font-black text-slate-900 uppercase tracking-widest mb-8">
                                        <AlertCircle size={18} className="text-cobalt-sliit" /> Optimization Protocol
                                    </h4>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {result.actionableTips.map((tip, i) => (
                                            <TipCard key={i} tip={tip} />
                                        ))}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Strengths */}
                                    <div className="bg-emerald-50/20 border border-emerald-100 rounded-[2.5rem] p-8">
                                        <h5 className="flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest mb-6">
                                            <CheckCircle size={16} /> Data Integrity (Strengths)
                                        </h5>
                                        <ul className="space-y-4">
                                            {result.strengths.map((s, i) => (
                                                <li key={i} className="flex gap-3 text-[11px] font-bold text-slate-700 leading-relaxed group">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0 group-hover:scale-150 transition-transform" />
                                                    {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    {/* Weaknesses */}
                                    <div className="bg-rose-50/20 border border-rose-100 rounded-[2.5rem] p-8">
                                        <h5 className="flex items-center gap-2 text-xs font-black text-rose-600 uppercase tracking-widest mb-6">
                                            <AlertTriangle size={16} /> System Vulnerabilities
                                        </h5>
                                        <ul className="space-y-4">
                                            {result.weaknesses.map((w, i) => (
                                                <li key={i} className="flex gap-3 text-[11px] font-bold text-slate-700 leading-relaxed group">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 flex-shrink-0 group-hover:scale-150 transition-transform" />
                                                    {w}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Lateral Data Column */}
                            <div className="space-y-6">
                                {/* Section Scores Card */}
                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Architecture Scores</h4>
                                    <div className="space-y-3">
                                        <SectionScore label="Contact Info" score={result.scoreBreakdown.sectionScores.contact} />
                                        <SectionScore label="Work Experience" score={result.scoreBreakdown.sectionScores.experience} />
                                        <SectionScore label="Academic History" score={result.scoreBreakdown.sectionScores.education} />
                                        <SectionScore label="Technical Skills" score={result.scoreBreakdown.sectionScores.skills} />
                                    </div>
                                </div>

                                {/* Missing Keywords Tag Cloud */}
                                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Keyword Discovery</h4>
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <Search size={14} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 leading-relaxed">
                                        Missing High-Density Terms:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {result.keywordsToAdd.map((kw, i) => (
                                            <motion.span 
                                                key={i} 
                                                whileHover={{ scale: 1.05 }}
                                                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase text-slate-600 tracking-wider hover:border-cobalt-sliit hover:text-cobalt-sliit transition-all cursor-default"
                                            >
                                                + {kw}
                                            </motion.span>
                                        ))}
                                    </div>
                                </div>

                                {/* Re-test CTA */}
                                <button 
                                    onClick={reset}
                                    className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl border-2 border-slate-100 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                                >
                                    <Search size={14} /> New Analysis Link
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ResumeAnalyzer;
