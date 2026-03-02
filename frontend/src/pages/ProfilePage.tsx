import React, { useState, useEffect } from 'react';
import {
    Award, Share2, Pencil, MapPin,
    CheckCircle2, Mail, User
} from 'lucide-react';
import profileService from '../services/profileService';
import type { StudentProfile } from '../types/profile';
import ProfileStats from '../features/profile/ProfileStats';
import {
    AboutMeView,
    SkillsView,
    ExperienceEducationView,
    ProjectsView
} from '../features/profile/ProfileViewSections';
import { ProfileEditModal } from '../features/profile/ProfileEditModal';

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<StudentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-purple-600 border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Assembling Profile System</p>
        </div>
    );

    if (error || !profile) return (
        <div className="p-20 text-center space-y-6 bg-red-50/30 rounded-[40px] border-2 border-dashed border-red-100">
            <div className="h-20 w-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto text-red-500">
                <Award size={40} className="rotate-180" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Connection Interrupted</h3>
            <button onClick={fetchProfile} className="btn-primary">Reconnect</button>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-1000">
            {/* Massive Unique Profile Header */}
            <div className="relative bg-white rounded-[48px] overflow-hidden shadow-2xl border border-slate-100 group">
                {/* Banner Gradient */}
                <div className="h-48 bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')] opacity-30"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                {/* Profile Info Overlay */}
                <div className="px-12 pb-10 flex flex-col md:flex-row items-end gap-8 -mt-16 relative">
                    {/* Avatar with Ring */}
                    <div className="relative shrink-0">
                        <div className="h-40 w-40 rounded-[48px] bg-slate-100 p-1 bg-gradient-to-br from-purple-500 to-blue-500 shadow-2xl">
                            <div className="h-full w-full rounded-[44px] bg-white overflow-hidden relative border-4 border-white">
                                {profile.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-slate-50 text-slate-200">
                                        <User size={64} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>

                    {/* Text Info */}
                    <div className="flex-1 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tight">{profile.firstName} {profile.lastName}</h1>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                                    Aspiring Professional
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-slate-300" />
                                    {profile.location?.city || 'Location not set'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail size={16} className="text-slate-300" />
                                    {typeof profile.user !== 'string' ? profile.user?.email : 'No Email'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Profile Strength</p>
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-32 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                                            style={{ width: `${profile.profileCompleteness}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-xl font-black text-slate-900">{profile.profileCompleteness}%</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="btn-primary py-3 px-8 flex items-center gap-2 shadow-2xl shadow-blue-500/20"
                                >
                                    <Pencil size={18} /> Edit Profile
                                </button>
                                <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 hover:border-slate-400 transition-all shadow-sm">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Dashboard */}
            <ProfileStats profile={profile} />

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: About & Skills */}
                <div className="lg:col-span-1 space-y-10">
                    <AboutMeView profile={profile} />
                    <SkillsView profile={profile} />
                </div>

                {/* Right Column: Experience/Education & Projects */}
                <div className="lg:col-span-2 space-y-10">
                    <ExperienceEducationView profile={profile} />
                    <ProjectsView profile={profile} />
                </div>
            </div>

            {/* Edit Modal */}
            <ProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                profile={profile}
                setProfile={setProfile}
            />
        </div>
    );
};

export default ProfilePage;
