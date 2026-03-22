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
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20">
            {error && (
                <div className="group relative overflow-hidden flex items-center gap-4 p-6 rounded-[2rem] bg-rose-50 text-rose-600 border border-rose-100 text-sm font-black uppercase tracking-widest shadow-xl shadow-rose-100/20">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                    <AlertCircle size={20} className="relative transition-transform group-hover:scale-110" /> 
                    <span className="relative">{error}</span>
                </div>
            )}

            {/* Career Goals - North Star Metrics */}
            <div className="group relative overflow-hidden bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all hover:shadow-2xl">
                <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-colors" />
                
                <div className="relative flex items-center gap-6 mb-10">
                    <div className="p-4 rounded-3xl bg-blue-600 text-white shadow-lg shadow-blue-200 transition-transform group-hover:scale-110">
                        <Target size={24} />
                    </div> 
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">North Star Metrics</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Strategic Career Mapping</p>
                    </div>
                </div>

                <form onSubmit={goalsForm.handleSubmit(onSaveGoals)} className="relative space-y-8 p-10 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Target Designations</label>
                            <input 
                                type="text" 
                                {...goalsForm.register('targetRoles')} 
                                placeholder="e.g. Frontend Architect, AI Research Lead" 
                                className={`w-full bg-white border rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100/50 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300 ${
                                    goalsForm.formState.errors.targetRoles ? 'border-rose-300 bg-rose-50/10' : 'border-slate-100'
                                }`} 
                            />
                            {goalsForm.formState.errors.targetRoles && (
                                <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mt-2 ml-1">{goalsForm.formState.errors.targetRoles.message}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Preferred Domains</label>
                            <input 
                                type="text" 
                                {...goalsForm.register('preferredIndustries')} 
                                placeholder="e.g. Fintech, DeepTech, Sustainable Energy" 
                                className={`w-full bg-white border rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100/50 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300 ${
                                    goalsForm.formState.errors.preferredIndustries ? 'border-rose-300 bg-rose-50/10' : 'border-slate-100'
                                }`} 
                            />
                            {goalsForm.formState.errors.preferredIndustries && (
                                <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mt-2 ml-1">{goalsForm.formState.errors.preferredIndustries.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Career Objective Protocol</label>
                        <textarea 
                            {...goalsForm.register('careerObjective')} 
                            placeholder="What is your ultimate professional impact?" 
                            className={`w-full bg-white border rounded-2xl px-6 py-5 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-100/50 focus:border-blue-400 outline-none transition-all placeholder:text-slate-300 min-h-[160px] resize-none leading-relaxed ${
                                goalsForm.formState.errors.careerObjective ? 'border-rose-300 bg-rose-50/10' : 'border-slate-100'
                            }`} 
                        />
                        {goalsForm.formState.errors.careerObjective && (
                            <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mt-2 ml-1">{goalsForm.formState.errors.careerObjective.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-200/50">
                        <button 
                            type="submit" 
                            disabled={loadingGoals} 
                            className="group/btn px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
                        >
                            {loadingGoals ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="group-hover/btn:rotate-12 transition-transform" />}
                            {loadingGoals ? 'Processing...' : 'Update Strategy'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Social Links - Digital Identity */}
            <div className="group relative overflow-hidden bg-white rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 border border-slate-100 transition-all hover:shadow-2xl">
                <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-slate-900/5 blur-3xl group-hover:bg-slate-900/10 transition-colors" />
                
                <div className="relative flex items-center gap-6 mb-10">
                    <div className="p-4 rounded-3xl bg-slate-900 text-white shadow-lg shadow-slate-300 transition-transform group-hover:scale-110">
                        <LinkIcon size={24} />
                    </div> 
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Digital Identity</h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Professional Web Presence</p>
                    </div>
                </div>

                <form onSubmit={socialForm.handleSubmit(onSaveSocial)} className="relative space-y-8 p-10 rounded-[2rem] bg-slate-50 border border-slate-100 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { name: 'linkedin', label: 'LinkedIn Relay', placeholder: 'https://linkedin.com/in/...' },
                            { name: 'github', label: 'GitHub Repository', placeholder: 'https://github.com/...' },
                            { name: 'portfolio', label: 'Dossier / Portfolio', placeholder: 'https://yourname.com' },
                            { name: 'stackoverflow', label: 'StackOverflow Intel', placeholder: 'https://stackoverflow.com/...' },
                        ].map((field) => (
                            <div key={field.name} className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">{field.label}</label>
                                <div className="relative">
                                    <input 
                                        type="url" 
                                        {...socialForm.register(field.name as keyof SocialLinksInput)} 
                                        placeholder={field.placeholder} 
                                        className={`w-full bg-white border rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-slate-200 focus:border-slate-800 outline-none transition-all placeholder:text-slate-300 ${
                                            socialForm.formState.errors[field.name as keyof SocialLinksInput] ? 'border-rose-300 bg-rose-50/10' : 'border-slate-100'
                                        }`} 
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-200 group-hover:text-blue-500 transition-colors">
                                        <LinkIcon size={16} />
                                    </div>
                                </div>
                                {socialForm.formState.errors[field.name as keyof SocialLinksInput] && (
                                    <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 mt-2 ml-1">{socialForm.formState.errors[field.name as keyof SocialLinksInput]?.message}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-200/50">
                        <button 
                            type="submit" 
                            disabled={loadingSocial} 
                            className="group/btn px-10 py-5 bg-slate-950 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40 hover:bg-black hover:scale-[1.02] active:scale-95 disabled:opacity-50 transition-all flex items-center gap-3"
                        >
                            {loadingSocial ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} className="group-hover/btn:rotate-12 transition-transform" />}
                            {loadingSocial ? 'Processing...' : 'Sync Identity'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsTab;
