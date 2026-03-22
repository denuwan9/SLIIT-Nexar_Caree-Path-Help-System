import React, { useState } from 'react';
import { Plus, X, Award, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import profileService from '../../../services/profileService';
import type { StudentProfile } from '../../../types/profile';
import { 
    technicalSkillSchema, 
    softSkillSchema, 
    type TechnicalSkillInput, 
    type SoftSkillInput 
} from '../profileSchemas';
import toast from 'react-hot-toast';

interface Props {
    profile: StudentProfile;
    setProfile: (p: StudentProfile) => void;
}

const LEVEL_COLORS: Record<string, string> = {
    beginner: 'bg-slate-100 text-slate-700',
    intermediate: 'bg-blue-100 text-blue-700',
    advanced: 'bg-indigo-100 text-indigo-700',
    expert: 'bg-purple-100 text-purple-700',
    developing: 'bg-slate-100 text-slate-700',
    proficient: 'bg-emerald-100 text-emerald-700',
};

const SkillsTab: React.FC<Props> = ({ profile, setProfile }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const techForm = useForm<TechnicalSkillInput>({
        resolver: zodResolver(technicalSkillSchema),
        defaultValues: { name: '', category: 'language', level: 'intermediate' }
    });

    const softForm = useForm<SoftSkillInput>({
        resolver: zodResolver(softSkillSchema),
        defaultValues: { name: '', level: 'proficient' }
    });

    const onAddTech = async (data: TechnicalSkillInput) => {
        try {
            setLoading(true); setError(null);
            const technicalSkills = await profileService.addTechnicalSkill(data as any);
            setProfile({ ...profile, technicalSkills });
            techForm.reset();
            toast.success('Technical skill added');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add tech skill');
            toast.error('Failed to add technical skill');
        } finally { setLoading(false); }
    };

    const handleRemoveTech = async (id: string) => {
        try {
            const technicalSkills = await profileService.removeTechnicalSkill(id);
            setProfile({ ...profile, technicalSkills });
            toast.success('Skill removed');
        } catch (err: any) { 
            setError('Failed to remove skill');
            toast.error('Failed to remove skill');
        }
    };

    const onAddSoft = async (data: SoftSkillInput) => {
        try {
            setLoading(true); setError(null);
            const softSkills = await profileService.addSoftSkill(data as any);
            setProfile({ ...profile, softSkills });
            softForm.reset();
            toast.success('Soft skill added');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add soft skill');
            toast.error('Failed to add soft skill');
        } finally { setLoading(false); }
    };

    const handleRemoveSoft = async (id: string) => {
        try {
            const softSkills = await profileService.removeSoftSkill(id);
            setProfile({ ...profile, softSkills });
            toast.success('Skill removed');
        } catch (err: any) { 
            setError('Failed to remove skill');
            toast.error('Failed to remove skill');
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Technical Skills Section */}
            <section>
                <div className="mb-4">
                    <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        <Award size={20} className="text-blue-500" /> Technical Skills
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">Languages, frameworks, tools, and platforms.</p>
                </div>

                <form onSubmit={techForm.handleSubmit(onAddTech)} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 items-end">
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Skill Name</label>
                        <input 
                            type="text" 
                            {...techForm.register('name')} 
                            placeholder="e.g. React" 
                            className={`input-field py-2 text-sm ${techForm.formState.errors.name ? 'border-red-500' : ''}`} 
                        />
                        {techForm.formState.errors.name && <p className="text-[10px] font-bold text-red-500">{techForm.formState.errors.name.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category</label>
                        <select {...techForm.register('category')} className="input-field py-2 text-sm">
                            <option value="language">Language</option>
                            <option value="framework">Framework</option>
                            <option value="database">Database</option>
                            <option value="cloud">Cloud</option>
                            <option value="tool">Tool</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Level</label>
                        <select {...techForm.register('level')} className="input-field py-2 text-sm">
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">&nbsp;</label>
                        <button type="submit" disabled={loading} className="btn-primary w-full py-2 text-sm flex items-center justify-center gap-2">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add Skill
                        </button>
                    </div>
                </form>

                <div className="flex flex-wrap gap-2">
                    {profile.technicalSkills?.length === 0 && <p className="text-sm italic text-slate-400">No technical skills added yet.</p>}
                    {profile.technicalSkills?.map((skill) => (
                        <div key={skill._id} className="flex items-center gap-3 pl-3 pr-2 py-2 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-black text-slate-800 leading-none truncate">{skill.name}</span>
                                <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400 mt-1">{skill.category}</span>
                            </div>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg shrink-0 ${LEVEL_COLORS[skill.level] || 'bg-slate-100'}`}>
                                {skill.level}
                            </span>
                            <button onClick={() => handleRemoveTech(skill._id!)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1 opacity-0 group-hover:opacity-100 shrink-0">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <hr className="border-slate-100" />

            {/* Soft Skills Section */}
            <section>
                <div className="mb-4">
                    <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        <Award size={20} className="text-emerald-500" /> Soft Skills
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">Interpersonal and non-technical proficiencies.</p>
                </div>

                <form onSubmit={softForm.handleSubmit(onAddSoft)} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 items-end">
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Skill Name</label>
                        <input 
                            type="text" 
                            {...softForm.register('name')} 
                            placeholder="e.g. Leadership, Communication" 
                            className={`input-field py-2 text-sm ${softForm.formState.errors.name ? 'border-red-500' : ''}`} 
                        />
                        {softForm.formState.errors.name && <p className="text-[10px] font-bold text-red-500">{softForm.formState.errors.name.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Level</label>
                        <select {...softForm.register('level')} className="input-field py-2 text-sm">
                            <option value="developing">Developing</option>
                            <option value="proficient">Proficient</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">&nbsp;</label>
                        <button type="submit" disabled={loading} className="btn-primary w-full py-2 text-sm flex items-center justify-center gap-2">
                            {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add Skill
                        </button>
                    </div>
                </form>

                <div className="flex flex-wrap gap-2">
                    {profile.softSkills?.length === 0 && <p className="text-sm italic text-slate-400">No soft skills added yet.</p>}
                    {profile.softSkills?.map((skill) => (
                        <div key={skill._id} className="flex items-center gap-3 pl-3 pr-2 py-2 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group">
                            <span className="text-sm font-black text-slate-800 truncate">{skill.name}</span>
                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg shrink-0 ${LEVEL_COLORS[skill.level] || 'bg-slate-100'}`}>
                                {skill.level}
                            </span>
                            <button onClick={() => handleRemoveSoft(skill._id!)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1 opacity-0 group-hover:opacity-100 shrink-0">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default SkillsTab;
