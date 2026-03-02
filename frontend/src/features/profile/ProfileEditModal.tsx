import React, { useState } from 'react';
import {
    X, User, Cpu, BookOpen, Briefcase,
    Rocket, Globe, Check, Save
} from 'lucide-react';
import { PersonalInfo } from './PersonalInfo';
import { AcademicInfo } from './AcademicInfo';
import { EducationList } from './EducationList';
import { ExperienceList } from './ExperienceList';
import { ProjectList } from './ProjectList';
import { SkillManager } from './SkillManager';
import { SocialLinks } from './SocialLinks';
import type { StudentProfile } from '../../types/profile';
import profileService from '../../services/profileService';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    profile: StudentProfile;
    setProfile: (profile: StudentProfile) => void;
}

type EditTab = 'basic' | 'skills' | 'education' | 'experience' | 'projects' | 'social';

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose, profile, setProfile }) => {
    const [activeTab, setActiveTab] = useState<EditTab>('basic');
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleUpdate = async (data: any) => {
        setIsSaving(true);
        try {
            const updated = await profileService.updateMe(data);
            setProfile(updated);
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
        { id: 'social', label: 'Social', icon: Globe },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-5xl h-full max-h-[85vh] bg-white rounded-[48px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-slate-100 shrink-0">
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Edit Profile</h2>
                    <button onClick={onClose} className="p-3 text-slate-400 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Modal Sidebar */}
                    <aside className="w-64 border-r border-slate-100 p-6 hidden md:block shrink-0">
                        <div className="flex flex-col gap-2">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-6 py-4 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 translate-x-1'
                                            : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-10 scrollbar-hide">
                        {activeTab === 'basic' && (
                            <PersonalInfo
                                profile={profile}
                                onUpdate={handleUpdate}
                                onAvatarUpload={async (file) => {
                                    const url = await profileService.uploadAvatar(file);
                                    setProfile({ ...profile, avatarUrl: url });
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
                            <div className="space-y-12">
                                <AcademicInfo profile={profile} onUpdate={handleUpdate} />
                                <div className="h-px bg-slate-100"></div>
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
                            />
                        )}
                        {activeTab === 'social' && (
                            <SocialLinks
                                socialLinks={profile.socialLinks}
                                onUpdate={async (links) => {
                                    const updatedProfile = await profileService.updateSocialLinks(links);
                                    setProfile(updatedProfile);
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-slate-900 transition-all"
                    >
                        Close
                    </button>
                    <button
                        onClick={onClose}
                        className="btn-primary py-3 px-10 flex items-center gap-2"
                    >
                        {isSaving ? 'Syncing...' : <><Save size={16} /> Save Changes</>}
                    </button>
                </div>
            </div>
        </div>
    );
};
