import React, { useState, useEffect } from 'react';
import { User, GraduationCap, Briefcase, Award, FileText, CheckCircle2, ChevronRight, Share2 } from 'lucide-react';
import profileService from '../services/profileService';
import type { StudentProfile } from '../types/profile';
import { PersonalInfo } from '../features/profile/PersonalInfo';
import { AcademicInfo } from '../features/profile/AcademicInfo';
import { EducationList } from '../features/profile/EducationList';
import { ExperienceList } from '../features/profile/ExperienceList';
import { SkillManager } from '../features/profile/SkillManager';

type TabType = 'personal' | 'academic' | 'experience' | 'skills';

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabType>('personal');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await profileService.getMe();
            setProfile(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (data: any) => {
        try {
            const updated = await profileService.updateMe(data);
            setProfile(updated);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Update failed');
        }
    };

    const handleAvatarUpload = async (file: File) => {
        try {
            const url = await profileService.uploadAvatar(file);
            if (profile) setProfile({ ...profile, avatarUrl: url });
        } catch (err: any) {
            alert(err.response?.data?.message || 'Upload failed');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error || !profile) return (
        <div className="card text-center py-12 border-red-100">
            <p className="text-red-500 font-bold">{error || 'Could not find profile'}</p>
            <button onClick={fetchProfile} className="btn-primary mt-4">Try Again</button>
        </div>
    );

    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'personal', label: 'Personal', icon: <User size={18} /> },
        { id: 'academic', label: 'Academic', icon: <GraduationCap size={18} /> },
        { id: 'experience', label: 'Experience', icon: <Briefcase size={18} /> },
        { id: 'skills', label: 'Skills & Languages', icon: <Award size={18} /> },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Banner */}
            <div className="relative h-48 bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                <div className="absolute top-6 right-8 flex gap-3">
                    <button className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-2.5 rounded-2xl transition-all border border-white/10">
                        <Share2 size={20} />
                    </button>
                    <button className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all border border-white/10 font-bold text-sm">
                        <FileText size={18} /> Export CV
                    </button>
                </div>
                <div className="absolute -bottom-1 left-12 flex items-center gap-2 text-white/40 text-xs font-bold uppercase tracking-widest bg-black/20 px-4 py-2 rounded-t-xl">
                    <CheckCircle2 size={12} className="text-emerald-400" /> Auto-saved to Cloud
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Nav */}
                <aside className="lg:col-span-1 space-y-6">
                    <div className="card overflow-hidden p-2">
                        <div className="flex flex-col gap-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 translate-x-1'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                    {activeTab === tab.id && <ChevronRight size={16} className="ml-auto" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="card bg-slate-900 text-white border-0 shadow-xl relative overflow-hidden">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Strength</h4>
                        <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden mb-3">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-1000"
                                style={{ width: `${profile.profileCompleteness}%` }}
                            ></div>
                        </div>
                        <p className="text-2xl font-black">{profile.profileCompleteness}%</p>
                        <p className="text-xs text-slate-400 mt-1">Completion Score</p>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="lg:col-span-3 space-y-8">
                    <section className="card p-8 min-h-[500px] border-slate-100">
                        {activeTab === 'personal' && (
                            <PersonalInfo
                                profile={profile}
                                onUpdate={handleUpdate}
                                onAvatarUpload={handleAvatarUpload}
                            />
                        )}

                        {activeTab === 'academic' && (
                            <div className="space-y-12">
                                <AcademicInfo profile={profile} onUpdate={handleUpdate} />
                                <div className="border-t border-slate-100 pt-12">
                                    <EducationList
                                        education={profile.education}
                                        onAdd={async (data) => {
                                            const list = await profileService.addEducation(data);
                                            setProfile({ ...profile, education: list });
                                        }}
                                        onRemove={async (id) => {
                                            const list = await profileService.removeEducation(id);
                                            setProfile({ ...profile, education: list });
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'experience' && (
                            <ExperienceList
                                experience={profile.experience}
                                onAdd={async (data) => {
                                    const list = await profileService.addExperience(data);
                                    setProfile({ ...profile, experience: list });
                                }}
                                onRemove={async (id) => {
                                    const list = await profileService.removeExperience(id);
                                    setProfile({ ...profile, experience: list });
                                }}
                            />
                        )}

                        {activeTab === 'skills' && (
                            <SkillManager
                                technicalSkills={profile.technicalSkills}
                                softSkills={profile.softSkills}
                                languages={profile.languages}
                                onAddTechnical={async (d) => {
                                    const list = await profileService.addTechnicalSkill(d);
                                    setProfile({ ...profile, technicalSkills: list });
                                }}
                                onRemoveTechnical={async (id) => {
                                    const list = await profileService.removeTechnicalSkill(id);
                                    setProfile({ ...profile, technicalSkills: list });
                                }}
                                onAddSoft={async (d) => {
                                    const list = await profileService.addSoftSkill(d);
                                    setProfile({ ...profile, softSkills: list });
                                }}
                                onRemoveSoft={async (id) => {
                                    const list = await profileService.removeSoftSkill(id);
                                    setProfile({ ...profile, softSkills: list });
                                }}
                                onAddLanguage={async (d) => {
                                    const list = await profileService.addLanguage(d);
                                    setProfile({ ...profile, languages: list });
                                }}
                                onRemoveLanguage={async (id) => {
                                    const list = await profileService.removeLanguage(id);
                                    setProfile({ ...profile, languages: list });
                                }}
                            />
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;
