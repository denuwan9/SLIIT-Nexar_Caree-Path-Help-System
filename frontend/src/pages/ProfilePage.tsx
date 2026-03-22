import React, { useState, useEffect } from 'react';
import {
    User, Award,
    BookOpen, Briefcase, Code,
    FileText, Settings
} from 'lucide-react';
import profileService from '../services/profileService';
import type { StudentProfile } from '../types/profile';

// Lazy load tabs
const OverviewTab = React.lazy(() => import('../features/profile/tabs/OverviewTab'));
const EditInfoTab = React.lazy(() => import('../features/profile/tabs/EditInfoTab'));
const SkillsTab = React.lazy(() => import('../features/profile/tabs/SkillsTab'));
const ExperienceTab = React.lazy(() => import('../features/profile/tabs/ExperienceTab'));
const EducationTab = React.lazy(() => import('../features/profile/tabs/EducationTab'));
const ProjectsTab = React.lazy(() => import('../features/profile/tabs/ProjectsTab'));
const SettingsTab = React.lazy(() => import('../features/profile/tabs/SettingsTab'));

const TABS = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'edit', label: 'Edit Info', icon: FileText },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: BookOpen },
    { id: 'projects', label: 'Projects', icon: Code },
    { id: 'settings', label: 'Settings', icon: Settings },
];

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await profileService.getMe();
            setProfile(data);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading Profile</p>
        </div>
    );

    if (error || !profile) return (
        <div className="card p-12 text-center space-y-4 max-w-lg mx-auto bg-red-50/50 border-red-100">
            <h3 className="text-xl font-black text-red-600">Connection Failed</h3>
            <p className="text-slate-600 text-sm">{error}</p>
            <button onClick={fetchProfile} className="btn-primary mt-4">Try Again</button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
            {/* Minimal Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile Engine</h1>
                    <p className="text-sm font-bold text-slate-500 mt-1">Manage your professional identity and AI context.</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Completeness</p>
                    <div className="flex items-center gap-3">
                        <div className="w-32 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${profile.profileCompleteness >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                                    profile.profileCompleteness >= 50 ? 'bg-gradient-to-r from-amber-400 to-orange-500' :
                                        'bg-gradient-to-r from-red-400 to-rose-500'
                                    }`}
                                style={{ width: `${profile.profileCompleteness}%` }}
                            />
                        </div>
                        <span className="text-lg font-black text-slate-900">{profile.profileCompleteness}%</span>
                    </div>
                </div>
            </div>

            {/* In-page Tab Layout */}
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Vertical Sidebar Navigation */}
                <div className="w-full md:w-64 shrink-0 space-y-1 bg-white p-3 rounded-3xl border border-slate-200 shadow-sm sticky top-6 z-10">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${isActive
                                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200/50'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content Area */}
                <div className="flex-1 min-w-0 bg-white rounded-[32px] border border-slate-200 shadow-sm p-8 min-h-[600px] relative">
                    <React.Suspense fallback={<div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-4 bg-slate-200 rounded w-3/4"></div><div className="space-y-3"><div className="grid grid-cols-3 gap-4"><div className="h-2 bg-slate-200 rounded col-span-2"></div><div className="h-2 bg-slate-200 rounded col-span-1"></div></div><div className="h-2 bg-slate-200 rounded"></div></div></div></div>}>
                        {activeTab === 'overview' && <OverviewTab profile={profile} />}
                        {activeTab === 'edit' && <EditInfoTab profile={profile} setProfile={setProfile} />}
                        {activeTab === 'skills' && <SkillsTab profile={profile} setProfile={setProfile} />}
                        {activeTab === 'experience' && <ExperienceTab profile={profile} setProfile={setProfile} />}
                        {activeTab === 'education' && <EducationTab profile={profile} setProfile={setProfile} />}
                        {activeTab === 'projects' && <ProjectsTab profile={profile} setProfile={setProfile} />}
                        {activeTab === 'settings' && <SettingsTab profile={profile} setProfile={setProfile} />}
                    </React.Suspense>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
