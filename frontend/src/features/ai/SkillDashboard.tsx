/**
 * SkillDashboard.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Visualises the student's technical and soft skills using Recharts.
 *   - RadarChart/BarChart: skill category distribution (technical)
 *   - BarChart: top technical skills by proficiency
 *   - Soft skills listed as pill badges
 * ─────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Loader2, Activity, Brain, BarChart2, Sparkles } from 'lucide-react';
import profileService from '../../services/profileService';
import type { TechnicalSkill, SoftSkill } from '../../types/profile.ts';

// Level → numeric score
const LEVEL_SCORE: Record<string, number> = {
    beginner: 30,
    intermediate: 50,
    proficient: 75,
    advanced: 90,
    expert: 100,
};

// Category display labels - expanded for better mapping
const CATEGORY_LABELS: Record<string, string> = {
    'frontend': 'Frontend',
    'backend': 'Backend',
    'cloud': 'Cloud / DevOps',
    'database': 'Databases',
    'mobile': 'Mobile Apps',
    'data-science': 'Data Science',
    'security': 'Security',
    'testing': 'Testing/QA',
    'ux-ui': 'UX/UI Design',
    'tools': 'Tooling',
    'management': 'Management',
    'other': 'Other Assets',
};

// ── Main Component ────────────────────────────────────────────────────────
const SkillDashboard: React.FC = () => {
    const [techSkills, setTechSkills] = useState<TechnicalSkill[]>([]);
    const [softSkills, setSoftSkills] = useState<SoftSkill[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        profileService.getMe()
            .then(profile => {
                setTechSkills(profile.technicalSkills ?? []);
                setSoftSkills(profile.softSkills ?? []);
            })
            .catch(() => setError('Failed to load profile intelligence.'))
            .finally(() => setIsLoading(false));
    }, []);

    const radarData = useMemo(() => {
        const groups: Record<string, number[]> = {};
        techSkills.forEach(skill => {
            // Use manual mapping or auto-capitalize the raw category
            const rawCat = skill.category?.toLowerCase() || 'other';
            const cat = CATEGORY_LABELS[rawCat] || 
                        (rawCat.charAt(0).toUpperCase() + rawCat.slice(1));
            
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(LEVEL_SCORE[skill.level] ?? 50);
        });
        return Object.entries(groups).map(([subject, scores]) => ({
            subject,
            score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
            fullMark: 100,
        }));
    }, [techSkills]);

    const barData = useMemo(() => {
        return [...techSkills]
            .sort((a, b) => (LEVEL_SCORE[b.level] ?? 0) - (LEVEL_SCORE[a.level] ?? 0))
            .slice(0, 10)
            .map(s => ({
                name: s.name,
                proficiency: LEVEL_SCORE[s.level] ?? 50,
                level: s.level,
            }));
    }, [techSkills]);

    const softLevelColors: Record<string, string> = {
        expert: 'bg-indigo-50 text-indigo-700 border-indigo-100',
        advanced: 'bg-blue-50 text-blue-700 border-blue-100',
        proficient: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        developing: 'bg-slate-50 text-slate-600 border-slate-100',
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-[2.5rem] flex flex-col items-center justify-center py-32 gap-4 border border-slate-100 shadow-sm">
                <div className="relative">
                    <Loader2 size={32} className="text-[#0F172A] animate-spin" />
                    <Sparkles size={14} className="absolute -top-1 -right-1 text-blue-500" />
                </div>
                <p className="font-black text-[#64748B] uppercase tracking-widest text-[11px]">Syncing Skill Dataset...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-[2.5rem] text-center py-20 text-rose-500 font-bold border border-rose-100">{error}</div>
        );
    }

    if (techSkills.length === 0 && softSkills.length === 0) {
        return (
            <div className="bg-white rounded-[2.5rem] flex flex-col items-center justify-center py-24 gap-6 text-center border border-slate-100 shadow-sm animate-in fade-in zoom-in-95 duration-700">
                <div className="w-20 h-20 rounded-[2rem] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                    <BarChart2 size={32} className="text-slate-300" />
                </div>
                <div>
                    <h3 className="font-black text-[#0F172A] text-xl tracking-tight">Analytical Void Detected</h3>
                    <p className="text-sm text-[#64748B] mt-2 max-w-sm font-medium leading-relaxed">
                        Your skill matrix is currently unpopulated. Enrich your profile with technical competencies to initialise deep analysis.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* ─── High-Impact Stat Matrix ─── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Core Competencies', value: techSkills.length, icon: Brain, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Strategic Soft Skills', value: softSkills.length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Expert Domains', value: techSkills.filter(s => s.level === 'expert').length, icon: Sparkles, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Asset Categories', value: radarData.length, icon: BarChart2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100/50 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-500 group">
                        <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon size={18} className={stat.color} />
                        </div>
                        <p className={`text-3xl font-black text-[#0F172A]`}>{stat.value}</p>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B] mt-2 group-hover:text-indigo-600 transition-colors">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* ─── Proficiency Distribution ─── */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50 hover:border-indigo-100 transition-colors group">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Activity size={16} className="text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-[13px] font-black uppercase tracking-widest text-[#0F172A]">Competency Distribution</p>
                            <p className="text-[10px] font-bold text-[#94A3B8]">Metric: Proficiency Average Per Tier</p>
                        </div>
                    </div>
                    {radarData.length >= 3 ? (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                                    <PolarGrid stroke="#E2E8F0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748B', fontWeight: 900 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar
                                        name="Proficiency"
                                        dataKey="score"
                                        stroke="#6366f1"
                                        fill="#6366f1"
                                        fillOpacity={0.2}
                                        strokeWidth={3}
                                        animationBegin={200}
                                        animationDuration={1500}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#6366f1', strokeWidth: 1 }}
                                        formatter={(value: unknown) => [`${value}%`, 'Strategic Mastery']}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : radarData.length > 0 ? (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC" vertical={false} />
                                    <XAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748B', fontWeight: 900 }} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} hide />
                                    <Tooltip
                                        formatter={(value: unknown) => [`${value}%`, 'Average Proficiency']}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="score" fill="#6366f1" radius={[10, 10, 10, 10]} barSize={40} animationDuration={1000}>
                                        {radarData.map((_entry, index) => (
                                            <Cell key={index} fill={index % 2 === 0 ? '#6366f1' : '#8b5cf6'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-center px-6">
                            <p className="text-xs text-[#94A3B8] font-medium leading-relaxed italic">Minimum 3 competency categories required for advanced distribution mapping.</p>
                        </div>
                    )}
                </div>

                {/* ─── Top Performance Assets ─── */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50 hover:border-blue-100 transition-colors group">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BarChart2 size={16} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[13px] font-black uppercase tracking-widest text-[#0F172A]">Dominant Tier Assets</p>
                            <p className="text-[10px] font-bold text-[#94A3B8]">Metric: Proficiency Performance Index</p>
                        </div>
                    </div>
                    {barData.length > 0 ? (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F8FAFC" horizontal={false} />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#0F172A', fontWeight: 800 }} axisLine={false} tickLine={false} width={100} />
                                    <Tooltip
                                        cursor={{ fill: '#F8FAFC' }}
                                        formatter={(value: unknown, _name: unknown, props: { payload?: { level?: string } }) => [
                                            `${value}% Mastery (${props.payload?.level?.toUpperCase()})`,
                                            'Strategic Index'
                                        ]}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(59, 130, 246, 0.1)', fontSize: '11px', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="proficiency" radius={[0, 12, 12, 0]} barSize={20} animationDuration={1500}>
                                        {barData.map((_entry, index) => (
                                            <Cell key={index} fill={['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'][index % 5]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-center px-6">
                            <p className="text-xs text-[#94A3B8] font-medium leading-relaxed italic">Initialise skill assessment to unlock performance indexing.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Strategic Soft Assets ─── */}
            {softSkills.length > 0 && (
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                            <Brain size={16} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-[13px] font-black uppercase tracking-widest text-[#0F172A]">Strategic Soft Value Matrix</p>
                            <p className="text-[10px] font-bold text-[#94A3B8]">Attribute Sync: Professional Presence Assets</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {softSkills.map((skill, i) => (
                            <span
                                key={i}
                                className={`text-[12px] font-black px-6 py-3 rounded-2xl border transition-all duration-300 hover:scale-105 cursor-default ${softLevelColors[skill.level] ?? 'bg-slate-50 text-slate-600 border-slate-100'}`}
                            >
                                {skill.name}
                                <span className="ml-2.5 opacity-40 text-[10px] uppercase font-black tracking-tighter">/ {skill.level}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillDashboard;
