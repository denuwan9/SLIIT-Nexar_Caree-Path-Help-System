import React, { useState } from 'react';
import { Target, Link as LinkIcon, Save, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import profileService from '../../../services/profileService';
import type { StudentProfile } from '../../../types/profile';
import { 
    careerGoalsSchema, 
    socialLinksSchema, 
    type CareerGoalsInput, 
    type SocialLinksInput 
} from '../profileSchemas';
import toast from 'react-hot-toast';

interface Props {
    profile: StudentProfile;
    setProfile: (p: StudentProfile) => void;
}

const SettingsTab: React.FC<Props> = ({ profile, setProfile }) => {
    const [loadingGoals, setLoadingGoals] = useState(false);
    const [loadingSocial, setLoadingSocial] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const goalsForm = useForm<CareerGoalsInput>({
        resolver: zodResolver(careerGoalsSchema),
        defaultValues: {
            targetRoles: profile.careerGoals?.targetRoles?.join(', ') || '',
            preferredIndustries: profile.careerGoals?.preferredIndustries?.join(', ') || '',
            careerObjective: profile.careerGoals?.careerObjective || '',
        }
    });

    const socialForm = useForm<SocialLinksInput>({
        resolver: zodResolver(socialLinksSchema),
        defaultValues: {
            linkedin: profile.socialLinks?.linkedin || '',
            github: profile.socialLinks?.github || '',
            portfolio: profile.socialLinks?.portfolio || '',
            twitter: profile.socialLinks?.twitter || '',
            stackoverflow: profile.socialLinks?.stackoverflow || '',
        }
    });

    const onSaveGoals = async (data: CareerGoalsInput) => {
        try {
            setLoadingGoals(true); setError(null);
            const goals = {
                targetRoles: data.targetRoles?.split(',').map(s => s.trim()).filter(Boolean) || [],
                preferredIndustries: data.preferredIndustries?.split(',').map(s => s.trim()).filter(Boolean) || [],
                careerObjective: data.careerObjective?.trim() || ''
            };
            const updated = await profileService.updateCareerGoals(goals);
            setProfile({ ...profile, careerGoals: updated });
            toast.success('Career goals updated');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save goals');
            toast.error('Failed to update career goals');
        } finally { setLoadingGoals(false); }
    };

    const onSaveSocial = async (data: SocialLinksInput) => {
        try {
            setLoadingSocial(true); setError(null);
            const updated = await profileService.updateSocialLinks(data);
            setProfile({ ...profile, socialLinks: updated });
            toast.success('Social links updated');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save social links');
            toast.error('Failed to update social links');
        } finally { setLoadingSocial(false); }
    };

    return (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {error && (
                <div className="flex items-center gap-3 p-5 rounded-3xl bg-rose-50 text-rose-600 border border-rose-100 text-[13px] font-bold">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {/* Career Goals */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50">
                <div className="mb-8">
                    <h2 className="text-2xl font-black tracking-tight text-[#0F172A] flex items-center gap-3 uppercase tracking-widest text-[14px]">
                        <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white">
                            <Target size={20} />
                        </div> 
                        North Star Metrics
                    </h2>
                    <p className="text-[13px] font-bold text-[#64748B] mt-1 ml-13">Define the heights you want to reach in your career.</p>
                </div>

                <form onSubmit={goalsForm.handleSubmit(onSaveGoals)} className="space-y-6 p-8 rounded-[2rem] bg-slate-50 border border-slate-100/50 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Target Roles</label>
                            <input 
                                type="text" 
                                {...goalsForm.register('targetRoles')} 
                                placeholder="e.g. Frontend Developer, Full Stack Engineer" 
                                className="input-field h-12 bg-white text-[13px]" 
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Preferred Industries</label>
                            <input 
                                type="text" 
                                {...goalsForm.register('preferredIndustries')} 
                                placeholder="e.g. Fintech, Healthcare, EdTech" 
                                className="input-field h-12 bg-white text-[13px]" 
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Career Objective Summary</label>
                        <textarea 
                            {...goalsForm.register('careerObjective')} 
                            placeholder="What are you ultimately looking to achieve in your career?" 
                            className={`input-field bg-white min-h-[120px] resize-none py-4 text-[13px] ${goalsForm.formState.errors.careerObjective ? 'border-rose-500' : ''}`} 
                        />
                        {goalsForm.formState.errors.careerObjective && <p className="text-[10px] font-bold text-rose-500">{goalsForm.formState.errors.careerObjective.message}</p>}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={loadingGoals} className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-[13px] shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                            {loadingGoals ? <Loader2 size={16} className="animate-spin" /> : <Save size={18} />} Update Goals
                        </button>
                    </div>
                </form>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50">
                <div className="mb-8">
                    <h2 className="text-2xl font-black tracking-tight text-[#0F172A] flex items-center gap-3 uppercase tracking-widest text-[14px]">
                        <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-white">
                            <LinkIcon size={20} />
                        </div> 
                        Digital Identity
                    </h2>
                    <p className="text-[13px] font-bold text-[#64748B] mt-1 ml-13">Sync your professional footprints across the web.</p>
                </div>

                <form onSubmit={socialForm.handleSubmit(onSaveSocial)} className="space-y-6 p-8 rounded-[2rem] bg-slate-50 border border-slate-100/50 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">LinkedIn Profile</label>
                            <input 
                                type="url" 
                                {...socialForm.register('linkedin')} 
                                placeholder="https://linkedin.com/in/..." 
                                className={`input-field h-12 bg-white text-[13px] ${socialForm.formState.errors.linkedin ? 'border-rose-500' : ''}`} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">GitHub Presence</label>
                            <input 
                                type="url" 
                                {...socialForm.register('github')} 
                                placeholder="https://github.com/..." 
                                className={`input-field h-12 bg-white text-[13px] ${socialForm.formState.errors.github ? 'border-rose-500' : ''}`} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Personal Portfolio</label>
                            <input 
                                type="url" 
                                {...socialForm.register('portfolio')} 
                                placeholder="https://yourname.com" 
                                className={`input-field h-12 bg-white text-[13px] ${socialForm.formState.errors.portfolio ? 'border-rose-500' : ''}`} 
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">StackOverflow</label>
                            <input 
                                type="url" 
                                {...socialForm.register('stackoverflow')} 
                                placeholder="https://stackoverflow.com/..." 
                                className={`input-field h-12 bg-white text-[13px] ${socialForm.formState.errors.stackoverflow ? 'border-rose-500' : ''}`} 
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={loadingSocial} className="px-8 py-3.5 bg-slate-800 text-white rounded-2xl font-black text-[13px] shadow-lg shadow-slate-200 hover:bg-black transition-all flex items-center gap-2">
                            {loadingSocial ? <Loader2 size={16} className="animate-spin" /> : <Save size={18} />} Sync Identity
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsTab;
