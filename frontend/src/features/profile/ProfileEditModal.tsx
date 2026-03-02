import React, { useState, useRef } from 'react';
import {
    X, User, Cpu, BookOpen, Briefcase,
    Rocket, Globe, Save
} from 'lucide-react';
import { PersonalInfo } from './PersonalInfo';
import type { PersonalInfoHandle } from './PersonalInfo';
import { AcademicInfo } from './AcademicInfo';
import { EducationList } from './EducationList';
import { ExperienceList } from './ExperienceList';
import { ProjectList } from './ProjectList';
import { SkillManager } from './SkillManager';
import { SocialLinks } from './SocialLinks';
import type { StudentProfile } from '../../types/profile';
import profileService from '../../services/profileService';
import { useAuth } from '../../components/auth/AuthProvider';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: StudentProfile;
    setProfile: (profile: StudentProfile) => void;
}

type EditTab = 'basic' | 'skills' | 'education' | 'experience' | 'projects' | 'social';

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose, profile, setProfile }) => {
    const { checkAuth } = useAuth();
    const [activeTab, setActiveTab] = useState<EditTab>('basic');
    const [isSaving, setIsSaving] = useState(false);
    // Ref to PersonalInfo's imperative handle — lets the footer Save button submit the form
    const personalInfoRef = useRef<PersonalInfoHandle>(null);

    if (!isOpen) return null;

    const handleUpdate = async (data: any) => {
        setIsSaving(true);
        try {
            const updated = await profileService.updateMe(data);
            setProfile(updated);
            // Sync AuthContext (Sidebar/Dashboard name & avatar)
            if (data.firstName || data.lastName || data.avatarUrl) {
                await checkAuth();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    const tabs: { id: EditTab; label: string; icon: React.ElementType }[] = [
        { id: 'basic', label: 'Basic Info', icon: User },
        { id: 'skills', label: 'Skills', icon: Cpu },
        { id: 'education', label: 'Education', icon: BookOpen },
        { id: 'experience', label: 'Experience', icon: Briefcase },
        { id: 'projects', label: 'Projects', icon: Rocket },
        { id: 'social', label: 'Social Links', icon: Globe },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 lg:p-12 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={onClose}></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white rounded-[32px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-100 italic-none">
                {/* Header */}
                <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50 shrink-0">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                {/* Main Content Body */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar Nav */}
                    <aside className="w-72 bg-slate-50/30 border-r border-slate-50 p-8 hidden md:block shrink-0 overflow-y-auto scrollbar-hide">
                        <div className="flex flex-col gap-3">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-200'
                                        : 'text-slate-400 hover:bg-white hover:text-slate-600 hover:shadow-sm'
                                        }`}
                                >
                                    <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-slate-300'} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Editor Viewport */}
                    <div className="flex-1 overflow-y-auto p-12 lg:px-20 scrollbar-hide bg-white">
                        <div className="max-w-3xl mx-auto animate-in slide-in-from-right-4 duration-500">
                            {activeTab === 'basic' && (
                                <PersonalInfo
                                    ref={personalInfoRef}
                                    profile={profile}
                                    onUpdate={handleUpdate}
                                    onAvatarUpload={async (file) => {
                                        const result = await profileService.uploadAvatar(file);
                                        setProfile(result.profile);
                                        await checkAuth();
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
                            {activeTab === 'education' && (
                                <div className="space-y-16">
                                    <AcademicInfo profile={profile} onUpdate={handleUpdate} />
                                    <div className="h-px bg-slate-100/50"></div>
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
                            )}
                            {activeTab === 'experience' && (
                                <ExperienceList
                                    experience={profile.experience}
                                    experienceStatus={profile.experienceStatus || 'No Experience'}
                                    onStatusUpdate={async (status) => {
                                        await handleUpdate({ experienceStatus: status });
                                    }}
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
                            {activeTab === 'projects' && (
                                <ProjectList
                                    projects={profile.projects || []}
                                    onAdd={async (data) => {
                                        const list = await profileService.addProject(data);
                                        setProfile({ ...profile, projects: list });
                                    }}
                                    onRemove={async (id) => {
                                        const list = await profileService.removeProject(id);
                                        setProfile({ ...profile, projects: list });
                                    }}
                                    onUpdateProjects={(updatedProjects) => {
                                        setProfile({ ...profile, projects: updatedProjects });
                                    }}
                                />
                            )}
                            {activeTab === 'social' && (
                                <SocialLinks
                                    links={profile.socialLinks}
                                    onUpdate={async (links: any) => {
                                        const updatedLinks = await profileService.updateSocialLinks(links);
                                        setProfile({ ...profile, socialLinks: updatedLinks });
                                    }}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-10 py-8 border-t border-slate-50 flex justify-between items-center bg-slate-50/20 shrink-0">
                    <button
                        onClick={onClose}
                        className="text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-700 transition-colors"
                    >
                        Cancel
                    </button>

                    {activeTab === 'basic' ? (
                        // Basic Info tab: trigger the form's own submit via ref
                        <button
                            type="button"
                            onClick={() => personalInfoRef.current?.submit()}
                            disabled={isSaving}
                            className="btn-primary py-4 px-12 rounded-[20px] flex items-center gap-3 active:scale-95 transition-all shadow-2xl shadow-blue-400/20"
                        >
                            {isSaving ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                            ) : (
                                <Save size={18} />
                            )}
                            <span className="text-xs uppercase tracking-[0.2em] font-black">Save Changes</span>
                        </button>
                    ) : (
                        // Other tabs handle their own save buttons inline — just close
                        <button
                            onClick={onClose}
                            className="btn-primary py-4 px-12 rounded-[20px] flex items-center gap-3 active:scale-95 transition-all shadow-2xl shadow-blue-400/20"
                        >
                            <Save size={18} />
                            <span className="text-xs uppercase tracking-[0.2em] font-black">Done</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
