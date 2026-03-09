import React from 'react';
import { Mail, MapPin, Building, GraduationCap, Github, Linkedin, RefreshCw, EyeOff } from 'lucide-react';
import type { StudentProfile } from '../../../types/profile';
import GrokVision from '../GrokVision';
import ProfileStats from '../ProfileStats';

interface Props {
    profile: StudentProfile;
}

const OverviewTab: React.FC<Props> = ({ profile }) => {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Hero */}
            <div className="flex flex-col md:flex-row gap-8 items-start relative">
                <div className="shrink-0 relative group">
                    <div className="w-32 h-32 rounded-3xl overflow-hidden bg-slate-100 border-4 border-white shadow-xl group-hover:shadow-blue-500/20 transition-all duration-300">
                        {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-4xl">
                                {profile.firstName?.[0] || 'N'}
                            </div>
                        )}
                    </div>
                    {/* Status badge */}
                    {profile.isActivelyLooking && (
                        <div className="absolute -bottom-3 -right-3 bg-emerald-500 text-white p-2 rounded-2xl border-4 border-white shadow-lg tooltip-trigger" title="Actively Looking for Roles">
                            <RefreshCw size={16} />
                        </div>
                    )}
                </div>

                <div className="flex-1 space-y-3 pt-2">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                            {profile.firstName} {profile.lastName}
                        </h2>
                        {!profile.isPublic && (
                            <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                                <EyeOff size={10} /> Private
                            </span>
                        )}
                    </div>

                    <p className="text-lg font-bold text-slate-600">{profile.headline || 'Add a headline...'}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-400">
                        {(profile.location?.city || profile.location?.country) && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                                <MapPin size={14} className="text-blue-500" />
                                {profile.location.city}{profile.location.city && profile.location.country ? ', ' : ''}{profile.location.country}
                            </div>
                        )}
                        {typeof profile.user !== 'string' && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                                <Mail size={14} className="text-emerald-500" />
                                {(profile.user as any).email}
                            </div>
                        )}
                        {profile.university && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                                <GraduationCap size={14} className="text-purple-500" />
                                {profile.university}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        {profile.socialLinks?.github && (
                            <a href={profile.socialLinks.github} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-900 hover:shadow-md transition-all">
                                <Github size={18} />
                            </a>
                        )}
                        {profile.socialLinks?.linkedin && (
                            <a href={profile.socialLinks.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-500 hover:text-blue-700 hover:shadow-md transition-all">
                                <Linkedin size={18} />
                            </a>
                        )}
                        {profile.socialLinks?.portfolio && (
                            <a href={profile.socialLinks.portfolio} target="_blank" rel="noreferrer" className="px-4 h-10 flex items-center justify-center rounded-xl bg-slate-900 text-white text-xs font-black shadow-md hover:bg-slate-800 transition-all">
                                Portfolio ↗
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <hr className="border-slate-100" />

            {/* AI Context Visualizer */}
            <GrokVision profile={profile} />

            {/* Quick Stats */}
            <ProfileStats profile={profile as any} />

            {/* Bio */}
            <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">About Me</h3>
                {profile.bio ? (
                    <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {profile.bio}
                    </p>
                ) : (
                    <p className="text-sm font-medium text-slate-400 italic">No bio provided.</p>
                )}
            </div>

            {/* Career Goals Quick View */}
            {profile.careerGoals?.targetRoles?.length > 0 && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-2">
                        <Building size={12} /> Target Roles
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {profile.careerGoals.targetRoles.map((role, i) => (
                            <span key={i} className="px-3 py-1 bg-white text-blue-700 text-xs font-black rounded-lg shadow-sm border border-blue-100/50">
                                {role}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OverviewTab;
