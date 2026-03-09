/**
 * SkillDashboard.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Visualises the student's technical and soft skills using Recharts.
 *   - RadarChart: skill category distribution (technical)
 *   - BarChart: top technical skills by proficiency
 *   - Soft skills listed as pill badges
 * ─────────────────────────────────────────────────────────────────────────
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { BarChart2, Activity, Brain, Loader2 } from 'lucide-react';
import profileService from '../../services/profileService';
import type { TechnicalSkill, SoftSkill } from '../../types/profile';

// Level → numeric score
const LEVEL_SCORE: Record<string, number> = {
    beginner: 25, developing: 25,
    intermediate: 50, proficient: 50,
    advanced: 75,
    expert: 100,
};

// Category display labels
const CATEGORY_LABELS: Record<string, string> = {
    'programming-language': 'Languages',
    'framework': 'Frameworks',
    'database': 'Databases',
    'cloud': 'Cloud',
    'devops': 'DevOps',
    'mobile': 'Mobile',
    'design': 'Design',
    'data-science': 'Data Sci',
    'testing': 'Testing',
    'other': 'Other',
};

// Gradient colours for bar chart
const BAR_COLORS = [
    '#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981',
    '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316',
];

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
            .catch(() => setError('Failed to load profile. Please refresh.'))
            .finally(() => setIsLoading(false));
    }, []);

    // Radar data: average proficiency per category
    const radarData = useMemo(() => {
        const groups: Record<string, number[]> = {};
        techSkills.forEach(skill => {
            const cat = CATEGORY_LABELS[skill.category] ?? 'Other';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(LEVEL_SCORE[skill.level] ?? 50);
        });
        return Object.entries(groups).map(([subject, scores]) => ({
            subject,
            score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
            fullMark: 100,
        }));
    }, [techSkills]);

    // Bar data: top 10 technical skills sorted by proficiency
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
        expert: 'bg-purple-100 text-purple-700 border-purple-200',
        advanced: 'bg-blue-100 text-blue-700 border-blue-200',
        proficient: 'bg-teal-100 text-teal-700 border-teal-200',
        developing: 'bg-slate-100 text-slate-600 border-slate-200',
    };

    if (isLoading) {
        return (
            <div className="card flex items-center justify-center py-20 gap-3">
                <Loader2 size={24} className="text-purple-500 animate-spin" />
                <p className="font-bold text-slate-500">Loading your skills…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card text-center py-12 text-red-500">{error}</div>
        );
    }

    if (techSkills.length === 0 && softSkills.length === 0) {
        return (
            <div className="card flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <BarChart2 size={32} className="text-slate-300" />
                </div>
                <div>
                    <p className="font-black text-slate-500">No Skills Data Yet</p>
                    <p className="text-sm text-slate-400 mt-1">
                        Add technical and soft skills to your profile to see your skill visualisation dashboard.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stat Pills */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Technical Skills', value: techSkills.length, color: 'from-purple-500 to-indigo-500' },
                    { label: 'Soft Skills', value: softSkills.length, color: 'from-cyan-500 to-blue-500' },
                    { label: 'Expert Level', value: techSkills.filter(s => s.level === 'expert').length, color: 'from-amber-500 to-orange-500' },
                    { label: 'Categories', value: radarData.length, color: 'from-emerald-500 to-teal-500' },
                ].map(stat => (
                    <div key={stat.label} className="card text-center py-4">
                        <p className={`text-2xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                {/* Radar Chart */}
                {radarData.length >= 3 && (
                    <div className="card">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity size={16} className="text-purple-500" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Skill Category Distribution</p>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                            <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Proficiency"
                                    dataKey="score"
                                    stroke="#8b5cf6"
                                    fill="#8b5cf6"
                                    fillOpacity={0.25}
                                    strokeWidth={2}
                                />
                                <Tooltip
                                    formatter={(value: unknown) => [`${value}%`, 'Avg. Proficiency']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Bar Chart — top skills */}
                {barData.length > 0 && (
                    <div className="card">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart2 size={16} className="text-blue-500" />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Top Skills by Proficiency</p>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v}%`} />
                                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#475569', fontWeight: 700 }} axisLine={false} tickLine={false} width={90} />
                                <Tooltip
                                    formatter={(value: unknown, _name: unknown, props: { payload?: { level?: string } }) => [
                                        `${value}% (${props.payload?.level ?? ''})`,
                                        'Proficiency'
                                    ]}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '11px' }}
                                />
                                <Bar dataKey="proficiency" radius={[0, 6, 6, 0]}>
                                    {barData.map((_entry, index) => (
                                        <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* Soft Skills */}
            {softSkills.length > 0 && (
                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        <Brain size={16} className="text-cyan-500" />
                        <p className="text-xs font-black uppercase tracking-widest text-slate-500">Soft Skills</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {softSkills.map((skill, i) => (
                            <span
                                key={i}
                                className={`text-xs font-bold px-3 py-1.5 rounded-full border ${softLevelColors[skill.level] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}
                            >
                                {skill.name}
                                <span className="ml-1.5 opacity-60 text-[10px] capitalize">· {skill.level}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillDashboard;
