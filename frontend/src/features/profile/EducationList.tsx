import React, { useState } from 'react';
import { Plus, Calendar, BookOpen, Trash2, GraduationCap, MapPin, Award, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { Education, DegreeType } from '../../types/profile';

interface EducationListProps {
    education: Education[];
    onAdd: (data: Omit<Education, '_id'>) => Promise<void>;
    onRemove: (id: string) => Promise<void>;
}

export const EducationList: React.FC<EducationListProps> = ({ education, onAdd, onRemove }) => {
    const [showAddForm, setShowAddForm] = useState(false);

    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<Omit<Education, '_id'>>({
        defaultValues: {
            institution: '',
            degree: 'Bachelor\'s',
            field: '',
            startDate: '',
            endDate: '',
            isCurrentlyEnrolled: false,
            description: '',
        }
    });

    const isCurrentlyEnrolled = watch('isCurrentlyEnrolled');

    const onSubmit = async (data: Omit<Education, '_id'>) => {
        await onAdd(data);
        reset();
        setShowAddForm(false);
    };

    const degrees: DegreeType[] = ['Certificate', 'Diploma', 'HND', "Bachelor's", "Master's", 'PhD', 'Other'];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <BookOpen className="text-blue-600" size={28} />
                    Education History
                </h3>
                {!showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-2"
                    >
                        <Plus size={16} /> Add Qualification
                    </button>
                )}
            </div>

            {showAddForm && (
                <div className="relative p-8 bg-white border-2 border-blue-100 rounded-[32px] shadow-xl overflow-hidden animate-in slide-in-from-top-4 duration-500">
                    <div className="absolute top-0 right-0 p-4">
                        <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institution Name</label>
                                <input
                                    {...register('institution', { required: 'Required' })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold transition-all"
                                    placeholder="e.g. SLIIT"
                                />
                                {errors.institution && <span className="text-red-500 text-[10px] font-bold">{errors.institution.message}</span>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qualification Type</label>
                                <select
                                    {...register('degree', { required: 'Required' })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold appearance-none"
                                >
                                    {degrees.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Field of Study</label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        {...register('field', { required: 'Required' })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold"
                                        placeholder="e.g. Software Engineering"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GPA (Optional)</label>
                                <div className="relative">
                                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('gpa', { min: 0, max: 4 })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold"
                                        placeholder="Scale 4.0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="date"
                                        {...register('startDate', { required: 'Required' })}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Graduation Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="date"
                                        disabled={isCurrentlyEnrolled}
                                        {...register('endDate')}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold disabled:opacity-40"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <input
                                type="checkbox"
                                {...register('isCurrentlyEnrolled')}
                                className="h-6 w-12 rounded-full appearance-none bg-slate-200 checked:bg-blue-600 transition-colors relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:translate-x-6 before:transition-transform"
                            />
                            <label className="text-sm font-bold text-slate-700">Currently enrolled in this program</label>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary py-3 px-10 rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-50"
                            >
                                {isSubmitting ? 'Adding...' : 'Add Qualification'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="bg-white text-slate-500 border border-slate-200 py-3 px-10 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {education.length === 0 && !showAddForm && (
                    <div className="text-center py-20 bg-slate-50/50 rounded-[40px] border-4 border-dashed border-slate-100">
                        <GraduationCap className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No academic records found</p>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="text-blue-600 text-sm font-black mt-4 underline"
                        >
                            Add your first qualification
                        </button>
                    </div>
                )}

                {education.map((edu) => (
                    <div key={edu._id} className="group relative p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-6">
                                <div className="h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                    <MapPin size={32} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xl font-bold text-slate-900 leading-tight">{edu.institution}</h4>
                                    <p className="text-blue-600 font-black uppercase tracking-widest text-[10px]">{edu.degree} • {edu.field}</p>
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 mt-3">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar size={14} className="text-slate-300" />
                                            {new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} — {
                                                edu.isCurrentlyEnrolled ? 'Present' : (edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Ongoing')
                                            }
                                        </div>
                                        {edu.gpa && (
                                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                                <Award size={14} />
                                                GPA: {edu.gpa}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => onRemove(edu._id!)}
                                className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
