/**
 * ProfileStats.tsx
 */
import React from 'react';
import { Target, Award, Code, Briefcase } from 'lucide-react';
import type { StudentProfile } from '../../types/profile';

const StatCard: React.FC<{ icon: any; label: string; value: string | number; color: string; bg: string; subtitle?: string }> = ({ icon: Icon, label, value, color, bg, subtitle }) => (
    <div className={`p-4 rounded-2xl border ${bg} flex items-center justify-between mb-2`}>
        <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center shrink-0`}>
                <Icon size={20} className="text-white" />
            </div>
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
                <div className="flex flex-col justify-center">
                    <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
                    {subtitle && (
                        <p className="text-[10px] font-bold text-slate-400 mt-1 leading-tight max-w-[100px]">
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
        </div>
    </div>
);

export default function ProfileStats({ profile }: { profile: StudentProfile }) {
    const techCount = (profile.technicalSkills || []).length;
    const softCount = (profile.softSkills || []).length;

    // Calculate total experience years
    const expYears = (profile.experience || []).reduce((acc, exp) => {
        const start = new Date(exp.startDate).getTime();
        const end = exp.isCurrent ? Date.now() : new Date(exp.endDate!).getTime();
        return acc + (end - start) / (1000 * 60 * 60 * 24 * 365.25);
    }, 0);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Award} label="Skills Verified" value={techCount + softCount} subtitle={`${techCount} Tech, ${softCount} Soft`} color="bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20" bg="bg-blue-50 border-blue-100" />
            <StatCard icon={Briefcase} label="Experience" value={expYears.toFixed(1)} subtitle="Years" color="bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-purple-500/20" bg="bg-purple-50 border-purple-100" />
            <StatCard icon={Code} label="Projects" value={(profile.projects || []).length} subtitle="Shipped" color="bg-gradient-to-br from-pink-500 to-rose-600 shadow-pink-500/20" bg="bg-pink-50 border-pink-100" />
            <StatCard icon={Target} label="Completeness" value={`${profile.profileCompleteness || 0}%`} subtitle="AI Ranking" color="bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20" bg="bg-emerald-50 border-emerald-100" />
        </div>
    );
}
