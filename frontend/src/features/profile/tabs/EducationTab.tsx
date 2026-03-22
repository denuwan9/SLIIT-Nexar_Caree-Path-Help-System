import React, { useState } from 'react';
import { Plus, X, BookOpen, GraduationCap, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import profileService from '../../../services/profileService';
import type { StudentProfile } from '../../../types/profile';
import { educationSchema, type EducationInput } from '../profileSchemas';
import toast from 'react-hot-toast';

interface Props {
    profile: StudentProfile;
    setProfile: (p: StudentProfile) => void;
}

const EducationTab: React.FC<Props> = ({ profile, setProfile }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<EducationInput>({
        resolver: zodResolver(educationSchema),
        defaultValues: {
            institution: '',
            degree: "Bachelor's",
            field: '',
            startYear: new Date().getFullYear(),
            isCurrent: true,
            description: '',
        },
    });

    const isCurrent = watch('isCurrent');

    const onSubmit = async (data: EducationInput) => {
        try {
            setLoading(true);
            setError(null);
            
            // Clean up data before submit
            const dataToSubmit = { ...data };
            if (dataToSubmit.isCurrent) {
                delete dataToSubmit.endYear;
            }
            if (!dataToSubmit.gpa) {
                delete dataToSubmit.gpa;
            }

            const education = await profileService.addEducation(dataToSubmit as any);
            setProfile({ ...profile, education });
            reset();
            setIsAdding(false);
            toast.success('Education entry added');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add education');
            toast.error('Failed to add education');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (id: string) => {
        if (!confirm('Remove this education entry?')) return;
        try {
            const education = await profileService.removeEducation(id);
            setProfile({ ...profile, education });
        } catch (err: any) { setError('Failed to remove entry'); }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black tracking-tight text-[#0F172A] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white">
                            <BookOpen size={20} />
                        </div> 
                        Education
                    </h2>
                    <p className="text-[13px] font-bold text-[#64748B] mt-1 ml-13">Academic background, degrees, and scholarly achievements.</p>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="px-6 py-3 bg-amber-600 text-white rounded-2xl font-black text-[13px] shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all flex items-center gap-2">
                        <Plus size={18} /> Add Entry
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
                        <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Add Academic Background</h3>
                        <button type="button" onClick={() => setIsAdding(false)} className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-white rounded-xl transition-all">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Institution</label>
                            <input 
                                type="text" 
                                {...register('institution')} 
                                placeholder="SLIIT" 
                                className={`input-field py-2 ${errors.institution ? 'border-red-500 bg-red-50' : ''}`} 
                            />
                            {errors.institution && <p className="text-[10px] font-bold text-red-500">{errors.institution.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Degree/Level</label>
                            <select 
                                {...register('degree')} 
                                className={`input-field py-2 ${errors.degree ? 'border-red-500 bg-red-50' : ''}`}
                            >
                                <option value="Certificate">Certificate</option>
                                <option value="Diploma">Diploma</option>
                                <option value="HND">HND</option>
                                <option value="Bachelor's">Bachelor's Degree</option>
                                <option value="Master's">Master's Degree</option>
                                <option value="PhD">PhD</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.degree && <p className="text-[10px] font-bold text-red-500">{errors.degree.message}</p>}
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Field of Study</label>
                            <input 
                                type="text" 
                                {...register('field')} 
                                placeholder="Software Engineering" 
                                className={`input-field py-2 ${errors.field ? 'border-red-500 bg-red-50' : ''}`} 
                            />
                            {errors.field && <p className="text-[10px] font-bold text-red-500">{errors.field.message}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Start Year</label>
                            <input 
                                type="number" 
                                {...register('startYear', { valueAsNumber: true })} 
                                className={`input-field py-2 ${errors.startYear ? 'border-red-500 bg-red-50' : ''}`} 
                            />
                            {errors.startYear && <p className="text-[10px] font-bold text-red-500">{errors.startYear.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">End/Expected Year</label>
                            <input 
                                type="number" 
                                disabled={isCurrent} 
                                {...register('endYear', { valueAsNumber: true })} 
                                className={`input-field py-2 disabled:bg-slate-100 ${errors.endYear ? 'border-red-500 bg-red-50' : ''}`} 
                            />
                            {errors.endYear && <p className="text-[10px] font-bold text-red-500">{errors.endYear.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">GPA (Optional)</label>
                            <input 
                                type="number" 
                                step="0.01" 
                                {...register('gpa', { valueAsNumber: true })} 
                                placeholder="3.8" 
                                className={`input-field py-2 ${errors.gpa ? 'border-red-500 bg-red-50' : ''}`} 
                            />
                            {errors.gpa && <p className="text-[10px] font-bold text-red-500">{errors.gpa.message}</p>}
                        </div>
                    </div>

                    <div className="mb-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                {...register('isCurrent')} 
                                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500" 
                            />
                            <span className="text-sm font-bold text-slate-700">I am currently studying here</span>
                        </label>
                    </div>

                    <div className="space-y-1.5 mb-6">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description / Achievements (Optional)</label>
                        <textarea 
                            {...register('description')} 
                            placeholder="E.g. Deans List 2023, President of IT Club..." 
                            className={`input-field min-h-[80px] py-2 resize-y ${errors.description ? 'border-red-500 bg-red-50' : ''}`} 
                        />
                        {errors.description && <p className="text-[10px] font-bold text-red-500">{errors.description.message}</p>}
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => { setIsAdding(false); reset(); }} className="btn-secondary py-2">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary py-2 w-32 flex justify-center bg-amber-600 hover:bg-amber-700 ring-amber-500">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Entry'}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-6">
                {profile.education?.length === 0 && !isAdding && (
                    <div className="text-center py-20 px-8 rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-slate-50/50 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center text-[#94A3B8] mb-6 group-hover:scale-110 transition-transform">
                                <GraduationCap size={32} />
                            </div>
                            <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Academic Journey</h3>
                            <p className="text-sm font-medium text-[#64748B] mt-2 max-w-sm mx-auto leading-relaxed">
                                Your degrees and certifications are the foundation of your career roadmap. Add them to help the AI better understand your expertise level.
                            </p>
                            <button onClick={() => setIsAdding(true)} className="mt-8 px-8 py-3.5 bg-amber-600 text-white rounded-2xl font-black text-[13px] shadow-lg shadow-amber-200 hover:bg-amber-700 transition-all">
                                Add Education
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-[100px] opacity-30 -z-0"></div>
                    </div>
                )}

                {([...profile.education || []]).sort((a, b) => b.startYear - a.startYear).map(edu => (
                    <div key={edu._id} className="group relative p-8 rounded-[2.5rem] border border-slate-100 bg-white hover:border-amber-200 hover:shadow-xl hover:shadow-amber-100/30 transition-all duration-500">
                        <button onClick={() => handleRemove(edu._id!)} className="absolute top-6 right-6 p-2.5 text-[#94A3B8] hover:text-rose-500 hover:bg-rose-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all">
                            <X size={18} />
                        </button>

                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-all duration-500">
                                <GraduationCap size={28} />
                            </div>
                            <div className="flex-1 space-y-4">
                                <div>
                                    <h3 className="text-2xl font-black text-[#0F172A] tracking-tight leading-tight">{edu.institution}</h3>
                                    <p className="text-lg font-bold text-[#475569]">{edu.degree} in {edu.field}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] font-bold text-[#94A3B8]">
                                    <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100/50">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                                        {edu.startYear} — {edu.isCurrent ? 'Present' : edu.endYear}
                                    </span>
                                    {edu.gpa && (
                                        <span className="text-amber-600 bg-amber-50 px-4 py-1.5 rounded-xl border border-amber-100 font-black">
                                            GPA: {edu.gpa.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                                {edu.description && (
                                    <div className="relative">
                                        <p className="text-[14px] font-medium text-[#64748B] leading-relaxed whitespace-pre-wrap pl-4 border-l-2 border-slate-100 group-hover:border-amber-400 transition-colors">
                                            {edu.description}
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

export default EducationTab;
