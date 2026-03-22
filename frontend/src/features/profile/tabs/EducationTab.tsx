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
                    <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        <BookOpen size={20} className="text-amber-500" /> Education
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">Degrees, diplomas, and certifications.</p>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="btn-primary py-2 px-4 shadow-sm text-sm flex items-center gap-2 bg-amber-600 hover:bg-amber-700 ring-amber-500">
                        <Plus size={16} /> Add Entry
                    </button>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {isAdding && (
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-slate-900">Add Academic Background</h3>
                        <button type="button" onClick={() => setIsAdding(false)} className="p-1 text-slate-400 hover:text-slate-900 transition-colors">
                            <X size={20} />
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

            <div className="space-y-4">
                {profile.education?.length === 0 && !isAdding && (
                    <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50">
                        <GraduationCap size={32} className="mx-auto text-slate-300 mb-3" />
                        <h3 className="text-sm font-black text-slate-600">No education added</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1 max-w-sm mx-auto">Add your degrees and academic achievements so AI can tailor roles to your level.</p>
                        <button onClick={() => setIsAdding(true)} className="btn-secondary mt-4 py-2 px-4 text-xs">Add Education</button>
                    </div>
                )}

                {([...profile.education || []]).sort((a, b) => b.startYear - a.startYear).map(edu => (
                    <div key={edu._id} className="group relative p-6 rounded-3xl border border-slate-100 bg-white hover:border-amber-200 hover:shadow-md hover:shadow-amber-500/5 transition-all">
                        <button onClick={() => handleRemove(edu._id!)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                            <X size={16} />
                        </button>

                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 border border-amber-100 flex items-center justify-center shrink-0">
                                <GraduationCap size={24} />
                            </div>
                            <div className="flex-1 space-y-1.5 pr-8">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 leading-tight">{edu.institution}</h3>
                                    <p className="text-sm font-bold text-slate-700">{edu.degree} in {edu.field}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-500 pt-1">
                                    <span className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50">
                                        {edu.startYear} — {edu.isCurrent ? 'Present' : edu.endYear}
                                    </span>
                                    {edu.gpa && <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded font-black">GPA: {edu.gpa.toFixed(2)}</span>}
                                </div>
                                {edu.description && (
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed pt-2">
                                        {edu.description}
                                    </p>
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
