import React, { useState } from 'react';
import { Plus, X, Briefcase, Calendar, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import profileService from '../../../services/profileService';
import type { StudentProfile } from '../../../types/profile';
import { experienceSchema, type ExperienceInput } from '../profileSchemas';
import toast from 'react-hot-toast';

interface Props {
    profile: StudentProfile;
    setProfile: (p: StudentProfile) => void;
}

const ExperienceTab: React.FC<Props> = ({ profile, setProfile }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<ExperienceInput>({
        resolver: zodResolver(experienceSchema),
        defaultValues: {
            title: '',
            company: '',
            type: 'full-time',
            location: '',
            isRemote: false,
            startDate: '',
            endDate: '',
            isCurrent: false,
            description: ''
        },
    });

    const isCurrent = watch('isCurrent');

    const onSubmit = async (data: ExperienceInput) => {
        try {
            setLoading(true);
            setError(null);
            
            const dataToSubmit = { ...data };
            if (dataToSubmit.isCurrent) {
                delete dataToSubmit.endDate;
            }

            const experience = await profileService.addExperience(dataToSubmit as any);
            setProfile({ ...profile, experience });
            reset();
            setIsAdding(false);
            toast.success('Experience role added');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add experience');
            toast.error('Failed to add experience');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id: string) => {
        if (!confirm('Remove this experience entry?')) return;
        try {
            const experience = await profileService.removeExperience(id);
            setProfile({ ...profile, experience });
            toast.success('Experience role removed');
        } catch (err: any) { 
            setError('Failed to remove entry'); 
            toast.error('Failed to remove entry');
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-[#0F172A] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white">
                            <Briefcase size={20} />
                        </div> 
                        Work Experience
                    </h2>
                    <p className="text-[13px] font-bold text-[#64748B] mt-1 ml-13">Internships, part-time jobs, and volunteering milestones.</p>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="px-6 py-3 bg-[#0F172A] text-white rounded-2xl font-black text-[13px] shadow-lg shadow-slate-200 hover:bg-black transition-all flex items-center gap-2">
                        <Plus size={18} /> Add New Role
                    </button>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-3 p-5 rounded-3xl bg-rose-50 text-rose-600 border border-rose-100 text-[13px] font-bold">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {isAdding && (
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-200/60 animate-in slide-in-from-top-4 duration-500 shadow-inner">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Expand Experience</h3>
                        <button type="button" onClick={() => { setIsAdding(false); reset(); }} className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-white rounded-xl transition-all">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Job Title</label>
                            <input 
                                type="text" 
                                {...register('title')} 
                                placeholder="Software Engineer Intern" 
                                className={`input-field py-2 ${errors.title ? 'border-red-500 bg-red-50' : ''}`} 
                            />
                            {errors.title && <p className="text-[10px] font-bold text-red-50">{errors.title.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Company</label>
                            <input 
                                type="text" 
                                {...register('company')} 
                                placeholder="Tech Corp" 
                                className={`input-field py-2 ${errors.company ? 'border-red-500 bg-red-50' : ''}`} 
                            />
                            {errors.company && <p className="text-[10px] font-bold text-red-500">{errors.company.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Employment Type</label>
                            <select 
                                {...register('type')} 
                                className="input-field py-2"
                            >
                                <option value="full-time">Full-time</option>
                                <option value="part-time">Part-time</option>
                                <option value="internship">Internship</option>
                                <option value="contract">Contract</option>
                                <option value="freelance">Freelance</option>
                                <option value="volunteer">Volunteer</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Location</label>
                            <input 
                                type="text" 
                                {...register('location')} 
                                placeholder="Colombo, LK" 
                                className={`input-field py-2 ${errors.location ? 'border-red-500 bg-red-50' : ''}`} 
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Start Date</label>
                            <input 
                                type="month" 
                                {...register('startDate')} 
                                className={`input-field py-2 ${errors.startDate ? 'border-red-500 bg-red-50' : ''}`} 
                            />
                            {errors.startDate && <p className="text-[10px] font-bold text-red-500">{errors.startDate.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">End Date</label>
                            <input 
                                type="month" 
                                disabled={isCurrent} 
                                {...register('endDate')} 
                                className={`input-field py-2 disabled:bg-slate-100 disabled:text-slate-400 ${errors.endDate ? 'border-red-500 bg-red-50' : ''}`} 
                            />
                            {errors.endDate && <p className="text-[10px] font-bold text-red-500">{errors.endDate.message}</p>}
                        </div>
                    </div>

                    <div className="flex items-center gap-6 mb-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                {...register('isCurrent')} 
                                className="w-4 h-4 text-blue-600 rounded border-slate-300" 
                            />
                            <span className="text-sm font-bold text-slate-700">I currently work here</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                {...register('isRemote')} 
                                className="w-4 h-4 text-blue-600 rounded border-slate-300" 
                            />
                            <span className="text-sm font-bold text-slate-700">Remote Position</span>
                        </label>
                    </div>

                    <div className="space-y-1.5 mb-6">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description (Optional)</label>
                        <textarea 
                            {...register('description')} 
                            placeholder="Describe your responsibilities and achievements..." 
                            className={`input-field min-h-[100px] resize-y py-2 ${errors.description ? 'border-red-500 bg-red-50' : ''}`} 
                        />
                        {errors.description && <p className="text-[10px] font-bold text-red-500">{errors.description.message}</p>}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => { setIsAdding(false); reset(); }} className="btn-secondary py-2">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary py-2 w-32 flex justify-center">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Role'}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-6">
                {profile.experience?.length === 0 && !isAdding && (
                    <div className="text-center py-20 px-8 rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-slate-50/50 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center text-slate-300 mb-6 group-hover:scale-110 transition-transform">
                                <Briefcase size={32} />
                            </div>
                            <h3 className="text-xl font-black text-[#0F172A] tracking-tight">No Experience Yet</h3>
                            <p className="text-sm font-medium text-[#64748B] mt-2 max-w-sm mx-auto leading-relaxed">
                                NEXAR's AI advisor works best when it knows your background. Add internships, part-time roles, or volunteering to see tailored strategy suggestions.
                            </p>
                            <button onClick={() => setIsAdding(true)} className="mt-8 px-8 py-3.5 bg-[#0F172A] text-white rounded-2xl font-black text-[13px] shadow-lg shadow-slate-200 hover:bg-black transition-all">
                                Add First Role
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-[100px] opacity-30 -z-0"></div>
                    </div>
                )}

                {([...profile.experience || []]).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(exp => (
                    <div key={exp._id} className="group relative p-8 rounded-[2.5rem] border border-slate-100 bg-white hover:border-[#0F172A]/10 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500">
                        <button onClick={() => handleRemove(exp._id!)} className="absolute top-6 right-6 p-2.5 text-[#94A3B8] hover:text-rose-500 hover:bg-rose-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all">
                            <X size={18} />
                        </button>

                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-[#0F172A] transition-colors duration-500">
                                <Briefcase size={26} className="text-[#94A3B8] group-hover:text-white transition-colors duration-500" />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="text-2xl font-black text-[#0F172A] tracking-tight leading-tight">{exp.title}</h3>
                                        {exp.isCurrent && (
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100">Active Role</span>
                                        )}
                                    </div>
                                    <p className="text-lg font-bold text-[#475569]">{exp.company}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] font-bold text-[#94A3B8]">
                                    <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100/50"><Calendar size={15} className="text-indigo-500" /> {formatDate(exp.startDate)} — {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}</span>
                                    {exp.location && <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100/50"><MapPin size={15} className="text-rose-500" /> {exp.location}{exp.isRemote ? ' (Remote)' : ''}</span>}
                                    <span className="px-3 py-1.5 rounded-xl bg-[#0F172A] text-[10px] font-black uppercase tracking-widest text-white">{exp.type}</span>
                                </div>
                                {exp.description && (
                                    <div className="relative">
                                        <p className="text-[14px] font-medium text-[#64748B] leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-slate-100 group-hover:border-[#0F172A] transition-colors">
                                            {exp.description}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExperienceTab;
