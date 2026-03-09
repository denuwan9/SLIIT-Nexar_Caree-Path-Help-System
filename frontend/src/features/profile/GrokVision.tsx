/**
 * GrokVision.tsx
 */
import React, { useState, useMemo } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Copy, Check, Eye, EyeOff } from 'lucide-react';
import type { StudentProfile } from '../../types/profile';

interface Props { profile: StudentProfile; }

const buildGrokContext = (profile: StudentProfile) => {
    return {
        name: `${profile.firstName} ${profile.lastName}`,
        headline: profile.headline || null,
        university: profile.university || null,
        major: profile.major || null,
        yearOfStudy: profile.yearOfStudy || null,
        gpa: profile.gpa || null,
        bio: profile.bio || null,
        targetRoles: profile.careerGoals?.targetRoles || [],
        careerObjective: profile.careerGoals?.careerObjective || null,
        location: profile.location?.city
            ? `${profile.location.city}, ${profile.location.country || 'Sri Lanka'}`
            : null,
        technicalSkills: (profile.technicalSkills || []).map(s => ({
            name: s.name, level: s.level
        })),
        softSkills: (profile.softSkills || []).map(s => s.name),
        education: (profile.education || []).map(e => ({
            degree: e.degree, field: e.field, institution: e.institution, gpa: e.gpa ?? null,
        })),
        experience: (profile.experience || []).map(e => ({
            title: e.title, company: e.company, current: e.isCurrent, type: e.type,
        })),
        projects: (profile.projects || []).map(p => ({
            title: p.title, techStack: p.techStack || [], githubUrl: p.githubUrl || null,
        })),
        isActivelyLooking: profile.isActivelyLooking,
        profileCompleteness: profile.profileCompleteness,
    };
};

const HighlightedJSON: React.FC<{ json: string }> = ({ json }) => {
    const highlighted = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
        let cls = 'text-amber-600';
        if (/^"/.test(match)) cls = match.endsWith(':') ? 'text-blue-600 font-bold' : 'text-emerald-600';
        else if (/true|false/.test(match)) cls = 'text-purple-600';
        else if (/null/.test(match)) cls = 'text-slate-400';
        return `<span class="${cls}">${match}</span>`;
    });
    return <pre className="text-xs leading-5 text-slate-700 whitespace-pre-wrap break-words font-mono" dangerouslySetInnerHTML={{ __html: highlighted }} />;
};

const SectionPill: React.FC<{ label: string; count: number; color: string }> = ({ label, count, color }) => (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${color}`}>
        <span>{count}</span><span>{label}</span>
    </div>
);

const GrokVision: React.FC<Props> = ({ profile }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showRaw, setShowRaw] = useState(false);

    const context = useMemo(() => buildGrokContext(profile), [profile]);
    const jsonString = useMemo(() => JSON.stringify(context, null, 2), [context]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(jsonString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { /* ignore */ }
    };

    const completeness = profile.profileCompleteness ?? 0;
    const isComplete = completeness >= 80;

    return (
        <div className="rounded-3xl bg-gradient-to-br from-purple-900/5 to-cyan-900/5 border border-purple-200/50 overflow-hidden">
            <button onClick={() => setIsOpen(v => !v)} className="w-full flex items-center justify-between px-6 py-4 hover:bg-purple-50/40 transition-colors group">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shadow-md">
                        <Sparkles size={14} className="text-white" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-black text-slate-900">Grok Vision</p>
                        <p className="text-[10px] text-slate-400 font-bold">What the AI reads about you</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex gap-2">
                        <SectionPill label="Skills" count={(profile.technicalSkills || []).length} color="bg-purple-100 text-purple-700" />
                        <SectionPill label="Projects" count={(profile.projects || []).length} color="bg-cyan-100 text-cyan-700" />
                        <SectionPill label="Complete" count={completeness} color={`bg-slate-100 ${isComplete ? 'text-emerald-600' : 'text-amber-600'}`} />
                    </div>
                    <div className={`p-2 rounded-xl border transition-all duration-300 ${isOpen ? 'bg-purple-100 border-purple-200 text-purple-600' : 'bg-white border-slate-200 text-slate-400 group-hover:text-slate-600'}`}>
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                </div>
            </button>

            {isOpen && (
                <div className="border-t border-purple-100/50 px-6 pb-6 pt-4 space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-cyan-50 border border-purple-100">
                        <Sparkles size={16} className="text-purple-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-slate-600 leading-relaxed">
                            <span className="font-black text-slate-800">This is your AI context payload.</span> Every time NEXAR gives you career advice, skill gap analysis, or a career roadmap, it reads exactly this data. A more complete profile = more personalised advice.
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: 'Technical Skills', value: context.technicalSkills.length, gradient: 'from-purple-500 to-indigo-500' },
                            { label: 'Soft Skills', value: context.softSkills.length, gradient: 'from-cyan-500 to-blue-500' },
                            { label: 'Projects', value: context.projects.length, gradient: 'from-emerald-500 to-teal-500' },
                            { label: 'Context Tokens', value: `~${Math.round(jsonString.length / 4)}`, gradient: 'from-amber-500 to-orange-500' },
                        ].map(stat => (
                            <div key={stat.label} className="card py-3 text-center">
                                <p className={`text-xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>{stat.value}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 bg-white/60 rounded-xl border border-slate-200 p-0.5">
                            <button onClick={() => setShowRaw(false)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${!showRaw ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Sparkles size={11} /> Highlighted</button>
                            <button onClick={() => setShowRaw(true)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${showRaw ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Eye size={11} /> Raw JSON</button>
                        </div>
                        <button onClick={handleCopy} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black border transition-all ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-500 hover:border-purple-300 hover:text-purple-600'}`}>
                            {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy JSON</>}
                        </button>
                    </div>

                    <div className="relative rounded-2xl bg-slate-900/95 border border-slate-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-700/50 bg-slate-800/50">
                            <div className="flex gap-1.5">{['bg-red-500', 'bg-amber-500', 'bg-emerald-500'].map((c, i) => <div key={i} className={`w-3 h-3 rounded-full ${c} opacity-70`} />)}</div>
                            <span className="text-[10px] text-slate-400 font-mono font-bold ml-2">nexar-ai-context.json</span>
                            <div className="ml-auto flex items-center gap-1 text-[10px] text-slate-500"><EyeOff size={10} /><span>Private to you</span></div>
                        </div>
                        <div className="overflow-auto max-h-80 p-4 scrollbar-thin scrollbar-thumb-slate-600">
                            {showRaw ? <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap break-words">{jsonString}</pre> : <HighlightedJSON json={jsonString} />}
                        </div>
                        {completeness < 50 && (
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900 to-transparent flex items-end justify-center pb-3">
                                <p className="text-[10px] text-amber-400 font-black uppercase tracking-widest">⚠ Fill your profile to give the AI more to work with</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
export default GrokVision;
