import React from 'react';
import { 
    MapPin, 
    GraduationCap, 
    RefreshCw, 
    EyeOff,
    User,
    Briefcase,
    Globe,
    ExternalLink
} from 'lucide-react';
import type { StudentProfile } from '../../../types/profile';
import GrokVision from '../GrokVision';

interface Props {
    profile: StudentProfile;
}

const OverviewTab: React.FC<Props> = ({ profile }) => {
    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* ─── PROFESSIONAL HEADER CARD ─── */}
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100/50 relative overflow-hidden group">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                    
                    {/* Avatar Circle */}
                    <div className="shrink-0 relative">
                        <div className="w-36 h-36 rounded-[2.5rem] overflow-hidden bg-slate-50 border-4 border-white shadow-2xl group-hover:shadow-indigo-500/10 transition-all duration-500">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0F172A] to-[#1E293B] text-white font-black text-5xl">
                                    {profile.firstName?.[0] || 'N'}
                                </div>
                            )}
                        </div>
                        {profile.isActivelyLooking && (
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2.5 rounded-2xl border-4 border-white shadow-xl animate-bounce-subtle">
                                <RefreshCw size={18} />
                            </div>
                        )}
                    </div>

                    {/* Bio Info */}
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-3">
                            <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter">
                                {profile.firstName} {profile.lastName}
                            </h2>
                            {!profile.isPublic && (
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#94A3B8] bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100/50">
                                    <EyeOff size={12} /> Private Portal
                                </span>
                            )}
                        </div>

                        <p className="text-xl font-bold text-[#64748B] max-w-2xl leading-relaxed">
                            {profile.headline || 'Your Professional Headline...'}
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-[13px] font-bold">
                            {(profile.location?.city || profile.location?.country) && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[#0F172A] border border-slate-100/50">
                                    <MapPin size={14} className="text-blue-500" />
                                    {profile.location.city}, {profile.location.country}
                                </div>
                            )}
                            {profile.university && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-[#0F172A] border border-slate-100/50">
                                    <GraduationCap size={14} className="text-purple-500" />
                                    {profile.university}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Subtle Glow Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[100px] opacity-40 -z-0"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] opacity-40 -z-0"></div>
            </div>

            {/* ─── AI CORE CONTEXT (GrokVision) ─── */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50">
                <GrokVision profile={profile} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* ─── ABOUT / BIO CARD ─── */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50 flex flex-col gap-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-[#0F172A]">
                            <User size={18} />
                        </div>
                        <h3 className="text-[16px] font-black text-[#0F172A] uppercase tracking-widest">Professional Bio</h3>
                    </div>
                    <p className="text-[14px] font-medium text-[#64748B] leading-relaxed whitespace-pre-wrap">
                        {profile.bio || "No professional biography has been added yet. Use the 'Edit' tab to build your narrative."}
                    </p>
                </div>

                {/* ─── CAREER VISION CARD ─── */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50 flex flex-col gap-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white">
                            <Briefcase size={18} />
                        </div>
                        <h3 className="text-[16px] font-black text-[#0F172A] uppercase tracking-widest">Career Vision</h3>
                    </div>
                    
                    <div className="space-y-4">
                        {(profile.careerGoals?.targetRoles?.length ?? 0) > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.careerGoals!.targetRoles!.map((role, i) => (
                                    <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 text-[12px] font-black rounded-xl border border-blue-100/50 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        {role}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[13px] font-bold text-[#94A3B8] italic">No target roles defined.</p>
                        )}

                        {profile.socialLinks?.portfolio && (
                            <a 
                                href={profile.socialLinks.portfolio} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="mt-4 inline-flex items-center gap-2 px-5 py-3 bg-[#0F172A] text-white rounded-2xl text-[12px] font-black hover:bg-black transition-all shadow-lg shadow-slate-200"
                            >
                                <Globe size={14} />
                                View Portfolio
                                <ExternalLink size={12} className="opacity-50" />
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Note: Other tabs (Experience, Education, Projects) are handled within their respective lazy tabs */}
        </div>
    );
};

export default OverviewTab;
