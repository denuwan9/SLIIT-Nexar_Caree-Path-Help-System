import React from 'react';
import { Eye, Search, Award, TrendingUp } from 'lucide-react';
import type { StudentProfile } from '../../types/profile';

interface StatCardProps {
    label: string;
    value: string | number;
    change: string;
    icon: React.ElementType;
    iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, change, icon: Icon, iconColor }) => (
    <div className="card flex items-center justify-between group hover:scale-[1.02] transition-all duration-300">
        <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <h4 className="text-2xl font-black text-slate-900">{value}</h4>
            <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                {change} <TrendingUp size={10} />
            </p>
        </div>
        <div className={`h-12 w-12 rounded-2xl ${iconColor} flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-12`}>
            <Icon size={24} />
        </div>
    </div>
);

const ProfileStats: React.FC<{ profile: StudentProfile }> = ({ profile }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                label="Profile Strength"
                value={`${profile.profileCompleteness}%`}
                change="Increasing"
                icon={Eye}
                iconColor="bg-blue-500"
            />
            <StatCard
                label="Skills Verified"
                value={profile.technicalSkills.length}
                change="+1 this week"
                icon={Award}
                iconColor="bg-orange-500"
            />
            <StatCard
                label="Search Visibility"
                value={profile.isPublic ? 'Public' : 'Private'}
                change="Optimal"
                icon={Search}
                iconColor="bg-purple-500"
            />
            <StatCard
                label="Career Status"
                value={profile.isActivelyLooking ? 'Looking' : 'Exploring'}
                change="Active"
                icon={TrendingUp}
                iconColor="bg-emerald-500"
            />
        </div>
    );
};

export default ProfileStats;
