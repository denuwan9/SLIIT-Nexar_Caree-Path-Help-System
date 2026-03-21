import React, { useState, useEffect } from 'react';
import { 
    User, 
    Award, 
    BookOpen, 
    Briefcase, 
    Code, 
    FileText, 
    Settings,
    Mail,
    MapPin,
    Github,
    Linkedin,
    ExternalLink,
    MoreHorizontal,
    Plus
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
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Synchronizing Profile</p>
        </div>
    );

    if (error || !profile) return (
        <div className="bg-white rounded-[2.5rem] p-12 text-center space-y-4 max-w-lg mx-auto border border-slate-100 shadow-sm">
            <h3 className="text-xl font-black text-rose-500 tracking-tight">Access Denied</h3>
            <p className="text-slate-500 text-sm font-medium">{error}</p>
            <button onClick={fetchProfile} className="px-8 py-3 bg-[#0F172A] text-white rounded-2xl font-bold text-sm hover:scale-105 transition-all">Try Again</button>
        </div>
    );

    const completeness = profile.profileCompleteness || 0;

    return (
        <div className="w-full pb-10 text-[#0F172A] font-sans">
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* ─── LEFT MAIN COLUMN (Tabs & Content) ─── */}
                <div className="xl:col-span-8 flex flex-col gap-6">
                    
                    {/* Horizontal Premium Navigation */}
                    <div className="bg-white rounded-[2rem] p-2 shadow-sm border border-slate-100/50 flex flex-wrap gap-1 overflow-x-auto scrollbar-hide">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-300 whitespace-nowrap ${isActive
                                        ? 'bg-[#0F172A] text-white shadow-lg shadow-slate-200'
                                        : 'text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]'
                                        }`}
                                >
                                    <Icon size={16} className={isActive ? 'text-white' : 'text-[#94A3B8]'} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Content Area Rendering */}
                    <div className="min-h-[700px]">
                        <React.Suspense fallback={
                            <div className="bg-white rounded-[2.5rem] p-10 animate-pulse">
                                <div className="h-8 bg-slate-100 rounded-xl w-1/3 mb-6"></div>
                                <div className="space-y-4">
                                    <div className="h-4 bg-slate-50 rounded-lg w-full"></div>
                                    <div className="h-4 bg-slate-50 rounded-lg w-5/6"></div>
                                    <div className="h-4 bg-slate-50 rounded-lg w-4/6"></div>
                                </div>
                            </div>
                        }>
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

                {/* ─── RIGHT SIDEBAR (Profile Stats & Contact) ─── */}
                <div className="xl:col-span-4 flex flex-col gap-8">
                    
                    {/* Completeness Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50 flex flex-col items-center text-center relative overflow-hidden group">
                        <div className="w-full flex justify-between items-center mb-10 relative z-10">
                            <h2 className="text-[17px] font-bold text-[#0F172A]">Completeness</h2>
                            <button className="text-[#94A3B8] hover:text-[#0F172A] transition-colors"><MoreHorizontal size={20} /></button>
                        </div>

                        <div className="relative w-44 h-44 flex items-center justify-center mb-8 z-10">
                            {/* Circular Progress Path */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle 
                                    cx="88" cy="88" r="78" 
                                    className="stroke-slate-50 fill-none" 
                                    strokeWidth="10" 
                                />
                                <circle 
                                    cx="88" cy="88" r="78" 
                                    className="stroke-[#0F172A] fill-none transition-all duration-1000 ease-out" 
                                    strokeWidth="10" 
                                    strokeDasharray={490} 
                                    strokeDashoffset={490 - (490 * completeness) / 100} 
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="bg-white rounded-full w-[136px] h-[136px] shadow-xl flex flex-col items-center justify-center border border-slate-50">
                                <span className="text-3xl font-black text-[#0F172A]">{completeness}%</span>
                                <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mt-1">Profile Health</span>
                            </div>
                        </div>

                        <p className="text-[13px] font-medium text-[#64748B] px-4 mb-8 leading-relaxed z-10">
                            {completeness < 100 
                                ? "Complete your profile to unlock NEXAR's full career strategy potential." 
                                : "Your profile is fully optimized for top-tier career opportunities!"}
                        </p>

                        <button onClick={() => setActiveTab('edit')} className="w-full h-[52px] bg-[#0F172A] hover:bg-black text-white rounded-2xl font-bold text-[14px] flex items-center justify-center transition-all shadow-lg shadow-slate-200 z-10 group-hover:scale-[1.02] active:scale-[0.98]">
                            Optimize Profile
                        </button>

                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-[100px] opacity-20 -z-0"></div>
                    </div>

                    {/* Skills Snapshot Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50 flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[16px] font-bold text-[#0F172A]">Core Skills</h3>
                            <button onClick={() => setActiveTab('skills')} className="text-[#94A3B8] hover:text-[#0F172A] transition-colors"><Plus size={18} /></button>
                        </div>
                        
                        <div className="space-y-4 mb-4">
                            {profile.technicalSkills?.slice(0, 4).map((skill: { name: string; level: string }, i: number) => (
                                <div key={i} className="flex flex-col gap-2 group cursor-default">
                                    <div className="flex justify-between items-center text-[12px] font-bold">
                                        <span className="text-[#0F172A]">{skill.name}</span>
                                        <span className="text-[#94A3B8] capitalize">{skill.level}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-1000" 
                                            style={{ width: skill.level === 'expert' ? '100%' : skill.level === 'advanced' ? '70%' : skill.level === 'intermediate' ? '45%' : '25%' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button onClick={() => setActiveTab('skills')} className="text-[12px] font-black text-[#0F172A] uppercase tracking-widest mt-4 hover:underline text-center">Manage All Skills</button>
                    </div>

                    {/* Contact & Socials Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50">
                        <h3 className="text-[16px] font-bold text-[#0F172A] mb-6">Connect</h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-11 h-11 rounded-2xl bg-slate-50 text-[#0F172A] flex items-center justify-center group-hover:bg-[#0F172A] group-hover:text-white transition-all">
                                    <Mail size={18} />
                                </div>
                                <div className="flex flex-col truncate">
                                    <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Email Address</span>
                                    <span className="text-[13px] font-bold text-[#0F172A] truncate">{(profile.user as any)?.email}</span>
                                </div>
                            </div>

                            {(profile.location?.city || profile.location?.country) && (
                                <div className="flex items-center gap-4 group">
                                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                        <MapPin size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Location</span>
                                        <span className="text-[13px] font-bold text-[#0F172A]">
                                            {profile.location.city}{profile.location.city && profile.location.country ? ', ' : ''}{profile.location.country}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {profile.socialLinks?.linkedin && (
                                <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-4 group">
                                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <Linkedin size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">LinkedIn</span>
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            <span className="text-[13px] font-bold text-[#0F172A] truncate">View Professional Profile</span>
                                            <ExternalLink size={12} className="text-[#94A3B8]" />
                                        </div>
                                    </div>
                                </a>
                            )}

                            {profile.socialLinks?.github && (
                                <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" className="flex items-center gap-4 group">
                                    <div className="w-11 h-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:bg-black transition-all">
                                        <Github size={18} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">GitHub</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[13px] font-bold text-[#0F172A] truncate">View Code Repos</span>
                                            <ExternalLink size={12} className="text-[#94A3B8]" />
                                        </div>
                                    </div>
                                </a>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
