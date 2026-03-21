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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Career Goals */}
            <section>
                <div className="mb-6">
                    <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        <Target size={20} className="text-blue-500" /> Career Goals & Aspirations
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">Tell the AI what roles you are aiming for.</p>
                </div>

                <form onSubmit={goalsForm.handleSubmit(onSaveGoals)} className="space-y-5 p-6 rounded-3xl border border-slate-200 bg-slate-50/50">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Roles (Comma separated)</label>
                        <input 
                            type="text" 
                            {...goalsForm.register('targetRoles')} 
                            placeholder="e.g. Frontend Developer, Full Stack Engineer" 
                            className="input-field bg-white py-2" 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Preferred Industries (Comma separated)</label>
                        <input 
                            type="text" 
                            {...goalsForm.register('preferredIndustries')} 
                            placeholder="e.g. Fintech, Healthcare, EdTech" 
                            className="input-field bg-white py-2" 
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Career Objective Summary</label>
                        <textarea 
                            {...goalsForm.register('careerObjective')} 
                            placeholder="What are you ultimately looking to achieve in your career?" 
                            className={`input-field bg-white min-h-[100px] resize-y py-2 ${goalsForm.formState.errors.careerObjective ? 'border-red-500' : ''}`} 
                        />
                        {goalsForm.formState.errors.careerObjective && <p className="text-[10px] font-bold text-red-500">{goalsForm.formState.errors.careerObjective.message}</p>}
                    </div>

                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={loadingGoals} className="btn-primary py-2 px-6 shadow-sm flex items-center gap-2">
                            {loadingGoals ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Goals
                        </button>
                    </div>
                </form>
            </section>

            {/* Social Links */}
            <section>
                <div className="mb-6">
                    <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        <LinkIcon size={20} className="text-slate-700" /> Social & Portfolios
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">Links to your professional presence.</p>
                </div>

                <form onSubmit={socialForm.handleSubmit(onSaveSocial)} className="space-y-5 p-6 rounded-3xl border border-slate-200 bg-slate-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">LinkedIn URL</label>
                            <input 
                                type="url" 
                                {...socialForm.register('linkedin')} 
                                placeholder="https://linkedin.com/in/..." 
                                className={`input-field bg-white py-2 ${socialForm.formState.errors.linkedin ? 'border-red-500' : ''}`} 
                            />
                            {socialForm.formState.errors.linkedin && <p className="text-[10px] font-bold text-red-500">{socialForm.formState.errors.linkedin.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">GitHub Profile</label>
                            <input 
                                type="url" 
                                {...socialForm.register('github')} 
                                placeholder="https://github.com/..." 
                                className={`input-field bg-white py-2 ${socialForm.formState.errors.github ? 'border-red-500' : ''}`} 
                            />
                            {socialForm.formState.errors.github && <p className="text-[10px] font-bold text-red-500">{socialForm.formState.errors.github.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Personal Portfolio</label>
                            <input 
                                type="url" 
                                {...socialForm.register('portfolio')} 
                                placeholder="https://yourname.com" 
                                className={`input-field bg-white py-2 ${socialForm.formState.errors.portfolio ? 'border-red-500' : ''}`} 
                            />
                            {socialForm.formState.errors.portfolio && <p className="text-[10px] font-bold text-red-500">{socialForm.formState.errors.portfolio.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">StackOverflow</label>
                            <input 
                                type="url" 
                                {...socialForm.register('stackoverflow')} 
                                placeholder="https://stackoverflow.com/users/..." 
                                className={`input-field bg-white py-2 ${socialForm.formState.errors.stackoverflow ? 'border-red-500' : ''}`} 
                            />
                            {socialForm.formState.errors.stackoverflow && <p className="text-[10px] font-bold text-red-500">{socialForm.formState.errors.stackoverflow.message}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={loadingSocial} className="btn-primary flex py-2 px-6 shadow-sm items-center gap-2 bg-slate-800 hover:bg-slate-900 ring-slate-800">
                            {loadingSocial ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Links
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default SettingsTab;
