/**
 * ResumeAnalyzer.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * ATS Resume Analyzer. User pastes resume text; AI returns an ATS score,
 * score breakdown, missing keywords, and actionable improvements.
 * ─────────────────────────────────────────────────────────────────────────
 */
import React, { useState } from 'react';
import { FileText, Loader2, Zap, AlertCircle, CheckCircle, TrendingUp, Hash } from 'lucide-react';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { ResumeAnalysisResult } from '../../types/ai';
import { analyzeResume } from '../../services/aiService';

// ── ATS Score Gauge (Recharts RadialBar) ──────────────────────────────────
const AtsGauge: React.FC<{ score: number }> = ({ score }) => {
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
    const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Needs Work' : 'Poor';

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                        cx="50%" cy="50%"
                        innerRadius="75%"
                        outerRadius="100%"
                        startAngle={225}
                        endAngle={-45}
                        data={[{ value: score, fill: color }]}
                    >
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar background={{ fill: '#e2e8f0' }} dataKey="value" cornerRadius={10} />
                    </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-800">{score}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ATS Score</span>
                </div>
            </div>
            <span
                className="mt-2 text-xs font-black px-3 py-1 rounded-full"
                style={{ backgroundColor: `${color}20`, color }}
            >
                {label}
            </span>
        </div>
    );
};

// ── Score Bar ─────────────────────────────────────────────────────────────
const ScoreBar: React.FC<{ label: string; value: number }> = ({ label, value }) => (
    <div>
        <div className="flex justify-between mb-1">
            <p className="text-xs font-bold text-slate-600">{label}</p>
            <p className="text-xs font-black text-slate-700">{value}%</p>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500"
                style={{ width: `${value}%`, transition: 'width 0.8s ease-out' }}
            />
        </div>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────
const ResumeAnalyzer: React.FC = () => {
    const [resumeText, setResumeText] = useState('');
    const [result, setResult] = useState<ResumeAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!resumeText.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const data = await analyzeResume(resumeText.trim());
            setResult(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Input */}
            <div className="card">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <FileText size={18} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900">Resume ATS Analyzer</h3>
                        <p className="text-xs text-slate-400">Paste your resume text to get an ATS score and improvement tips</p>
                    </div>
                </div>
                <textarea
                    value={resumeText}
                    onChange={e => setResumeText(e.target.value)}
                    placeholder="Paste your resume text here (copy-paste from your Word doc, PDF, or Google Doc)…&#10;&#10;Include all sections: Summary, Education, Experience, Skills, Projects, etc."
                    rows={9}
                    className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none text-sm text-slate-800 placeholder-slate-400 resize-none font-mono"
                />
                <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-slate-400">
                        {resumeText.length} chars {resumeText.length < 100 && resumeText.length > 0 && '— too short (need ≥ 100)'}
                    </p>
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || resumeText.trim().length < 100}
                        className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5 disabled:opacity-40"
                    >
                        {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                        {isLoading ? 'Analysing…' : 'Analyse Resume'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex gap-3 items-start p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /> {error}
                </div>
            )}

            {isLoading && (
                <div className="card flex flex-col items-center justify-center py-14 gap-3">
                    <Loader2 size={28} className="text-cyan-500 animate-spin" />
                    <p className="font-bold text-slate-600">Running ATS simulation…</p>
                    <p className="text-xs text-slate-400">Cross-referencing against industry keywords</p>
                </div>
            )}

            {result && (
                <div className="grid gap-5 md:grid-cols-3">
                    {/* Score + Breakdown */}
                    <div className="card flex flex-col items-center gap-5">
                        <AtsGauge score={result.atsScore} />
                        <div className="w-full space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Score Breakdown</p>
                            <ScoreBar label="Keyword Density" value={result.scoreBreakdown.keywordDensity} />
                            <ScoreBar label="Formatting" value={result.scoreBreakdown.formatting} />
                            <ScoreBar label="Quantified Achievements" value={result.scoreBreakdown.quantifiedAchievements} />
                            <ScoreBar label="Action Verbs" value={result.scoreBreakdown.actionVerbs} />
                        </div>
                    </div>

                    {/* Main content — 2 col */}
                    <div className="md:col-span-2 space-y-5">
                        {/* Overall feedback */}
                        <div className="card bg-gradient-to-br from-slate-800 to-slate-900 text-white border-slate-700">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Mentor Verdict</p>
                            <p className="text-sm leading-relaxed">{result.overallFeedback}</p>
                        </div>

                        {/* Keywords to add */}
                        <div className="card">
                            <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3 flex items-center gap-1.5">
                                <Hash size={12} /> Keywords to Add
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {result.keywordsToAdd.map((kw, i) => (
                                    <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                        + {kw}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Strengths */}
                        {result.strengths.length > 0 && (
                            <div className="card">
                                <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3 flex items-center gap-1.5">
                                    <CheckCircle size={12} /> What's Working
                                </p>
                                <ul className="space-y-1.5">
                                    {result.strengths.map((s, i) => (
                                        <li key={i} className="text-sm text-slate-700 flex gap-2 items-start">
                                            <span className="text-emerald-500 mt-0.5">✓</span> {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Improvements */}
                        {result.improvements.length > 0 && (
                            <div className="card">
                                <p className="text-xs font-black uppercase tracking-widest text-amber-600 mb-3 flex items-center gap-1.5">
                                    <TrendingUp size={12} /> Improvements
                                </p>
                                <div className="space-y-3">
                                    {result.improvements.map((imp, i) => (
                                        <div key={i} className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                                            <p className="text-xs font-black text-amber-700 mb-1">{imp.section}</p>
                                            <p className="text-xs text-slate-600 mb-1">⚠️ {imp.issue}</p>
                                            <p className="text-xs text-slate-700 font-bold">💡 {imp.fix}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeAnalyzer;
