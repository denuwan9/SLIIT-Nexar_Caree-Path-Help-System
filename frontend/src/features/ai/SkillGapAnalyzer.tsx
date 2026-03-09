/**
 * SkillGapAnalyzer.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Compares the student's profile skills vs any job description.
 * Shows: match score, missing skills with priority badges, recommended
 * resources with estimated hours, and a urgency score progress bar.
 * ─────────────────────────────────────────────────────────────────────────
 */
import React, { useState } from 'react';
import { Target, AlertTriangle, CheckCircle, ExternalLink, Zap, Loader2, AlertCircle } from 'lucide-react';
import type { SkillGapResult } from '../../types/ai';
import { analyzeSkillGap } from '../../services/aiService';

// ── Priority Badge ────────────────────────────────────────────────────────
const PriorityBadge: React.FC<{ priority: 'critical' | 'important' | 'nice-to-have' }> = ({ priority }) => {
    const styles = {
        'critical': 'bg-red-100 text-red-700 border-red-200',
        'important': 'bg-amber-100 text-amber-700 border-amber-200',
        'nice-to-have': 'bg-slate-100 text-slate-600 border-slate-200',
    };
    const labels = { 'critical': '🔴 Critical', 'important': '🟡 Important', 'nice-to-have': '🔵 Nice to Have' };
    return (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${styles[priority]} uppercase tracking-wider`}>
            {labels[priority]}
        </span>
    );
};

// ── Urgency Meter ─────────────────────────────────────────────────────────
const UrgencyMeter: React.FC<{ score: number }> = ({ score }) => {
    const color = score >= 8 ? 'from-red-500 to-red-600' : score >= 5 ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-teal-500';
    const label = score >= 8 ? '🚨 Urgent' : score >= 5 ? '⚠️ Moderate' : '✅ Low';
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Urgency Score</p>
                <span className="text-lg font-black text-slate-800">{score}<span className="text-slate-400 text-sm">/10</span></span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
                    style={{ width: `${(score / 10) * 100}%` }}
                />
            </div>
            <p className="text-xs text-slate-500 mt-1.5 font-bold">{label} — upskill needed</p>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────
const SkillGapAnalyzer: React.FC = () => {
    const [jobDescription, setJobDescription] = useState('');
    const [result, setResult] = useState<SkillGapResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!jobDescription.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const data = await analyzeSkillGap(jobDescription.trim());
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
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                        <Target size={18} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900">Skill Gap Analyzer</h3>
                        <p className="text-xs text-slate-400">Paste a job description to find your gaps vs. your profile</p>
                    </div>
                </div>
                <textarea
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here…&#10;&#10;e.g. We are looking for a Senior Software Engineer with 3+ years of experience in React, Node.js, AWS…"
                    rows={7}
                    className="w-full px-4 py-3 rounded-xl bg-white/70 border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm text-slate-800 placeholder-slate-400 resize-none"
                />
                <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-slate-400">{jobDescription.length} / 5000 characters</p>
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || jobDescription.trim().length < 50}
                        className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5 disabled:opacity-40"
                    >
                        {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
                        {isLoading ? 'Analysing…' : 'Analyse Gap'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="flex gap-3 items-start p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" /> {error}
                </div>
            )}

            {isLoading && (
                <div className="card flex items-center justify-center py-14 gap-3">
                    <Loader2 size={28} className="text-amber-500 animate-spin" />
                    <p className="font-bold text-slate-600">Comparing your skills against the role…</p>
                </div>
            )}

            {result && (
                <div className="grid gap-5 md:grid-cols-2">
                    {/* Match Score + Urgency */}
                    <div className="card space-y-5">
                        {/* Match gauge */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Match Score</p>
                                <span className="text-2xl font-black text-slate-800">
                                    {result.matchScore}<span className="text-slate-400 text-base">%</span>
                                </span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${result.matchScore >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : result.matchScore >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 'bg-gradient-to-r from-red-500 to-rose-500'}`}
                                    style={{ width: `${result.matchScore}%` }}
                                />
                            </div>
                        </div>
                        <UrgencyMeter score={result.urgencyScore} />
                        {/* Summary */}
                        <p className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-amber-300 pl-3">
                            "{result.summary}"
                        </p>
                    </div>

                    {/* Strengths */}
                    <div className="card">
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-3 flex items-center gap-1.5">
                            <CheckCircle size={12} /> Your Strengths
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {result.strengths.map((s, i) => (
                                <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700">
                                    ✓ {s}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Missing Skills — full width */}
                    <div className="card md:col-span-2">
                        <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-4 flex items-center gap-1.5">
                            <AlertTriangle size={12} /> Missing Skills
                        </p>
                        <div className="space-y-2.5">
                            {result.missingSkills.map((skill, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/50 border border-white/60">
                                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className="text-sm font-black text-slate-800">{skill.skill}</span>
                                            <PriorityBadge priority={skill.priority} />
                                        </div>
                                        <p className="text-xs text-slate-500">{skill.reason}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommended Resources — full width */}
                    {result.recommendedResources.length > 0 && (
                        <div className="card md:col-span-2">
                            <p className="text-xs font-black uppercase tracking-widest text-purple-600 mb-4 flex items-center gap-1.5">
                                <ExternalLink size={12} /> Recommended Resources
                            </p>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {result.recommendedResources.map((r, i) => (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 border border-purple-100">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm">📚</span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-slate-500 mb-0.5">{r.skill}</p>
                                            {r.url ? (
                                                <a href={r.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-purple-700 hover:underline truncate block">
                                                    {r.resource} ↗
                                                </a>
                                            ) : (
                                                <p className="text-sm font-bold text-slate-700">{r.resource}</p>
                                            )}
                                            {r.estimatedHours && (
                                                <p className="text-[10px] text-slate-400 mt-0.5">~{r.estimatedHours} hours</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SkillGapAnalyzer;
