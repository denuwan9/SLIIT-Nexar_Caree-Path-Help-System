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
    beginner: 'bg-slate-100 text-slate-600 border border-slate-200',
    intermediate: 'bg-blue-50 text-blue-600 border border-blue-100',
    advanced: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
    expert: 'bg-purple-50 text-purple-600 border border-purple-100',
    developing: 'bg-amber-50 text-amber-600 border border-amber-100',
    proficient: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
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
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {error && (
                <div className="flex items-center gap-3 p-5 rounded-3xl bg-rose-50 text-rose-600 border border-rose-100 text-[13px] font-bold">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {/* Technical Skills Section */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50">
                <div className="mb-8">
                    <h2 className="text-2xl font-black tracking-tight text-[#0F172A] flex items-center gap-3 uppercase tracking-widest text-[14px]">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center text-white">
                            <Award size={20} />
                        </div> 
                        Technical Arsenal
                    </h2>
                    <p className="text-[13px] font-bold text-[#64748B] mt-1 ml-13">The languages and frameworks that power your solutions.</p>
                </div>

                <form onSubmit={techForm.handleSubmit(onAddTech)} className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10 p-6 rounded-[2rem] bg-slate-50 border border-slate-100/50 items-end">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Skill</label>
                        <input 
                            type="text" 
                            {...techForm.register('name')} 
                            placeholder="e.g. React" 
                            className={`input-field h-12 text-[13px] ${techForm.formState.errors.name ? 'border-rose-500 bg-rose-50/50' : 'bg-white'}`} 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Category</label>
                        <select {...techForm.register('category')} className="input-field h-12 text-[13px] bg-white">
                            <option value="language">Language</option>
                            <option value="framework">Framework</option>
                            <option value="database">Database</option>
                            <option value="cloud">Cloud</option>
                            <option value="tool">Tool</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Proficiency</label>
                        <select {...techForm.register('level')} className="input-field h-12 text-[13px] bg-white">
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                        </select>
                    </div>
                    <button type="submit" disabled={loading} className="h-12 bg-[#0F172A] text-white rounded-2xl font-black text-[13px] hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />} Push Skill
                    </button>
                </form>

                <div className="flex flex-wrap gap-3">
                    {profile.technicalSkills?.length === 0 && (
                        <div className="w-full text-center py-10 text-[13px] font-bold text-[#94A3B8] italic">
                            Your technical arsenal is currently empty.
                        </div>
                    )}
                    {profile.technicalSkills?.map((skill) => (
                        <div key={skill._id} className="flex items-center gap-4 pl-4 pr-2 py-3 rounded-[1.25rem] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all group cursor-default">
                            <div className="flex flex-col">
                                <span className="text-[14px] font-black text-[#0F172A] leading-none">{skill.name}</span>
                                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#94A3B8] mt-1.5">{skill.category}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl ${LEVEL_COLORS[skill.level] || 'bg-slate-50 text-slate-500'}`}>
                                    {skill.level}
                                </span>
                                <button onClick={() => handleRemoveTech(skill._id!)} className="p-2 text-[#94A3B8] hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Soft Skills Section */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50">
                <div className="mb-8">
                    <h2 className="text-2xl font-black tracking-tight text-[#0F172A] flex items-center gap-3 uppercase tracking-widest text-[14px]">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
                            <Award size={20} />
                        </div> 
                        Human Excellence
                    </h2>
                    <p className="text-[13px] font-bold text-[#64748B] mt-1 ml-13">The interpersonal superpowers that make you a great collaborator.</p>
                </div>

                <form onSubmit={softForm.handleSubmit(onAddSoft)} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 p-6 rounded-[2rem] bg-slate-50 border border-slate-100/50 items-end">
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Skill Name</label>
                        <input 
                            type="text" 
                            {...softForm.register('name')} 
                            placeholder="e.g. Leadership, Strategic Thinking" 
                            className={`input-field h-12 text-[13px] ${softForm.formState.errors.name ? 'border-rose-500 bg-rose-50/50' : 'bg-white'}`} 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Proficiency</label>
                        <select {...softForm.register('level')} className="input-field h-12 text-[13px] bg-white">
                            <option value="developing">Developing</option>
                            <option value="proficient">Proficient</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                        </select>
                    </div>
                    <button type="submit" disabled={loading} className="h-12 bg-emerald-600 text-white rounded-2xl font-black text-[13px] hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={18} />} Add Talent
                    </button>
                </form>

                <div className="flex flex-wrap gap-3">
                    {profile.softSkills?.length === 0 && (
                        <div className="w-full text-center py-10 text-[13px] font-bold text-[#94A3B8] italic">
                            No soft skills documented yet.
                        </div>
                    )}
                    {profile.softSkills?.map((skill) => (
                        <div key={skill._id} className="flex items-center gap-4 pl-4 pr-2 py-3 rounded-[1.25rem] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all group cursor-default">
                            <span className="text-[14px] font-black text-[#0F172A]">{skill.name}</span>
                            <div className="flex items-center gap-3">
                                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl ${LEVEL_COLORS[skill.level] || 'bg-slate-50 text-slate-500'}`}>
                                    {skill.level}
                                </span>
                                <button onClick={() => handleRemoveSoft(skill._id!)} className="p-2 text-[#94A3B8] hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SkillsTab;
