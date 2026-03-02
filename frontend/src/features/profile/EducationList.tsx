import React, { useState } from 'react';
import { Plus, Calendar, BookOpen, Trash2, GraduationCap, Award, X, Building } from 'lucide-react';
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
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100 italic">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight">Academic History</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chronological education timeline</p>
                    </div>
                </div>
                {!showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="group flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:shadow-xl hover:shadow-blue-500/10 transition-all active:scale-95"
                    >
                        <Plus size={16} className="transition-transform group-hover:rotate-90" />
                        Add Qualification
                    </button>
                )}
            </div>

            {/* Empty State */}
            {education.length === 0 && !showAddForm && (
                <div className="py-24 text-center bg-slate-50/30 rounded-[40px] border-2 border-dashed border-slate-100 animate-in zoom-in-95">
                    <div className="h-20 w-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto text-slate-200 mb-6">
                        <GraduationCap size={48} />
                    </div>
                    <h4 className="text-lg font-black text-slate-800">No records found</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Start by adding your latest degree or certificate</p>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="mt-8 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
                    >
                        Add your first record
                    </button>
                </div>
            )}

            {/* Add Education Form */}
            {showAddForm && (
                <div className="p-10 bg-white border-2 border-blue-100 rounded-[40px] shadow-2xl shadow-blue-500/5 relative overflow-hidden animate-in slide-in-from-top-6 duration-500">
                    <button
                        onClick={() => setShowAddForm(false)}
                        className="absolute top-8 right-8 p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                    >
                        <X size={24} />
                    </button>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                            {/* Institution */}
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institution Name</label>
                                <div className="relative group">
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input
                                        {...register('institution', { required: 'Institution name is required' })}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-slate-700 transition-all italic-none"
                                        placeholder="e.g. SLIIT"
                                    />
                                </div>
                                {errors.institution && <span className="text-red-500 text-[10px] font-bold ml-1">{errors.institution.message}</span>}
                            </div>

                            {/* Degree */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qualification Level</label>
                                <select
                                    {...register('degree', { required: 'Required' })}
                                    className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 outline-none font-bold text-slate-700 appearance-none transition-all"
                                >
                                    {degrees.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>

                            {/* Major */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Field of Study</label>
                                <div className="relative group">
                                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input
                                        {...register('field', { required: 'Required' })}
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-blue-600 transition-all"
                                        placeholder="e.g. Software Engineering"
                                    />
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="grid grid-cols-2 gap-6 md:col-span-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="date"
                                            {...register('startDate', { required: 'Required' })}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 outline-none font-bold text-slate-700 transition-all uppercase text-xs"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Graduation Date</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                                        <input
                                            type="date"
                                            disabled={isCurrentlyEnrolled}
                                            {...register('endDate')}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 outline-none font-bold text-slate-700 disabled:opacity-30 transition-all uppercase text-xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Toggle & GPA */}
                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 md:col-span-2">
                                <div className="flex items-center gap-4">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            {...register('isCurrentlyEnrolled')}
                                            className="sr-only peer"
                                        />
                                        <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                    <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Enrolled</span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optional GPA</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register('gpa', { min: 0, max: 4 })}
                                        className="w-20 px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none font-black text-center text-blue-600 focus:border-blue-500"
                                        placeholder="4.00"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="flex gap-4 pt-6 border-t border-slate-50">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 btn-primary py-5 rounded-[24px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all bg-gradient-to-r from-blue-700 to-blue-600 shadow-xl shadow-blue-500/20"
                            >
                                {isSubmitting ? (
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                                ) : null}
                                <span className="text-sm uppercase tracking-[0.2em] font-black">Link Qualification</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowAddForm(false)}
                                className="px-10 bg-slate-50 text-slate-400 py-3 rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-100"
                            >
                                Discard
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List Section */}
            <div className="grid grid-cols-1 gap-6">
                {education.map((edu) => (
                    <div key={edu._id} className="group relative p-10 bg-white border border-slate-100 rounded-[40px] shadow-sm hover:shadow-2xl hover:translate-y-[-6px] transition-all duration-500">
                        <div className="flex justify-between items-start">
                            <div className="flex gap-8">
                                <div className="h-20 w-20 rounded-[32px] bg-blue-50/50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 italic rotate-3 group-hover:rotate-0">
                                    <GraduationCap size={36} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{edu.institution}</h4>
                                    <p className="text-blue-600 font-black uppercase tracking-[0.15em] text-[11px] bg-blue-50 px-3 py-1.5 rounded-lg inline-block">{edu.degree} in {edu.field}</p>
                                    <div className="flex items-center gap-6 mt-4">
                                        <div className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                                            <Calendar size={16} className="text-slate-300" />
                                            {new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} — {
                                                edu.isCurrentlyEnrolled ? 'Present' : (edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Ongoing')
                                            }
                                        </div>
                                        {edu.gpa && (
                                            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100">
                                                <Award size={14} />
                                                GPA {edu.gpa}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => onRemove(edu._id!)}
                                className="p-4 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-[20px] transition-all group-hover:opacity-100 md:opacity-0"
                            >
                                <Trash2 size={24} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
