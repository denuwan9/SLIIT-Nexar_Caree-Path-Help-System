import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Briefcase, MapPin, Globe, Info, X, Clock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { Experience, EmploymentType } from '../../types/profile';

interface ExperienceListProps {
    experience: Experience[];
    experienceStatus: 'Has Experience' | 'No Experience';
    onAdd: (data: Omit<Experience, '_id'>) => Promise<void>;
    onRemove: (id: string) => Promise<void>;
    onStatusUpdate: (status: 'Has Experience' | 'No Experience') => Promise<void>;
}

export const ExperienceList: React.FC<ExperienceListProps> = ({
    experience,
    experienceStatus,
    onAdd,
    onRemove,
    onStatusUpdate
}) => {
    const [showAddForm, setShowAddForm] = useState(false);

    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<Omit<Experience, '_id'>>({
        defaultValues: {
            title: '',
            company: '',
            type: 'internship',
            location: '',
            isRemote: false,
            startDate: '',
            endDate: '',
            isCurrent: false,
            description: '',
            duration: '',
        }
    });

    const isCurrent = watch('isCurrent');

    const onSubmit = async (data: Omit<Experience, '_id'>) => {
        await onAdd(data);
        reset();
        setShowAddForm(false);
    };

    const types: EmploymentType[] = ['full-time', 'part-time', 'internship', 'contract', 'freelance', 'volunteer', 'project'];

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Experience Status Toggle */}
            <div className="bg-slate-50/50 p-8 rounded-[40px] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1 text-center md:text-left">
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Experience Status</h3>
                    <p className="text-sm text-slate-500 font-medium">Are you currently working or have past experience?</p>
                </div>
                <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-100 gap-2">
                    <button
                        onClick={() => onStatusUpdate('Has Experience')}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${experienceStatus === 'Has Experience'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                : 'text-slate-400 hover:bg-slate-50'
                            }`}
                    >
                        Has Experience
                    </button>
                    <button
                        onClick={() => onStatusUpdate('No Experience')}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${experienceStatus === 'No Experience'
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                                : 'text-slate-400 hover:bg-slate-50'
                            }`}
                    >
                        Entry Level / No Exp
                    </button>
                </div>
            </div>

            {experienceStatus === 'Has Experience' && (
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                            <Briefcase className="text-blue-600" size={28} />
                            Professional Timeline
                        </h3>
                        {!showAddForm && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-xl flex items-center gap-2"
                            >
                                <Plus size={16} /> Add Position
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
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Title / Role</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                {...register('title', { required: 'Required' })}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold"
                                                placeholder="e.g. Senior Frontend Developer"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company / Organization</label>
                                        <input
                                            {...register('company', { required: 'Required' })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold"
                                            placeholder="e.g. Google"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employment Type</label>
                                        <select
                                            {...register('type', { required: 'Required' })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold appearance-none capitalize"
                                        >
                                            {types.map(t => <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                {...register('location')}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold"
                                                placeholder="e.g. Sydney, Australia"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duration (e.g. 2 yrs)</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <input
                                                {...register('duration')}
                                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold"
                                                placeholder="Total time spent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                                        <input
                                            type="date"
                                            {...register('startDate', { required: 'Required' })}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                                        <input
                                            type="date"
                                            disabled={isCurrent}
                                            {...register('endDate')}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold disabled:opacity-40"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <input
                                            type="checkbox"
                                            {...register('isCurrent')}
                                            className="h-6 w-12 rounded-full appearance-none bg-slate-200 checked:bg-blue-600 transition-colors relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:translate-x-6 before:transition-transform"
                                        />
                                        <label className="text-sm font-bold text-slate-700">Currently in this role</label>
                                    </div>
                                    <div className="flex-1 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <input
                                            type="checkbox"
                                            {...register('isRemote')}
                                            className="h-6 w-12 rounded-full appearance-none bg-slate-200 checked:bg-blue-600 transition-colors relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:translate-x-6 before:transition-transform"
                                        />
                                        <label className="text-sm font-bold text-slate-700 font-bold flex items-center gap-2">
                                            <Globe size={16} className="text-blue-600" /> Remote Role
                                        </label>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Impact & Responsibilities</label>
                                    <textarea
                                        {...register('description')}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-medium resize-none"
                                        placeholder="Use bullet points to describe your key achievements..."
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-primary py-3 px-10 rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Add Experience'}
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
                        {experience.length === 0 && !showAddForm && (
                            <div className="text-center py-20 bg-slate-50/50 rounded-[40px] border-4 border-dashed border-slate-100">
                                <Briefcase className="mx-auto text-slate-200 mb-4" size={48} />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Your professional timeline is empty</p>
                            </div>
                        )}

                        {experience.map((exp) => (
                            <div key={exp._id} className="group relative p-8 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-6">
                                        <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                            <Briefcase size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-xl font-bold text-slate-900 leading-tight">{exp.title}</h4>
                                            <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">
                                                <span className="text-blue-600">{exp.company}</span> • {exp.type.replace(/-/g, ' ')}
                                                {exp.duration && <span className="ml-2 text-slate-400 tracking-normal font-bold">({exp.duration})</span>}
                                            </p>

                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-slate-400 mt-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-slate-300" />
                                                    {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} — {
                                                        exp.isCurrent ? <span className="text-blue-600">Present</span> : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A')
                                                    }
                                                </div>
                                                {exp.location && (
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin size={14} className="text-slate-300" />
                                                        {exp.location} {exp.isRemote && <span className="text-blue-500">(Remote)</span>}
                                                    </div>
                                                )}
                                            </div>

                                            {exp.description && (
                                                <div className="mt-6 text-sm text-slate-600 leading-relaxed border-l-4 border-slate-100 pl-6 whitespace-pre-line group-hover:border-blue-100 transition-colors">
                                                    {exp.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onRemove(exp._id!)}
                                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {experienceStatus === 'No Experience' && (
                <div className="p-12 bg-blue-50/30 rounded-[40px] border-2 border-dashed border-blue-100 text-center space-y-4">
                    <div className="h-20 w-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto text-blue-600">
                        <Info size={40} />
                    </div>
                    <div className="max-w-md mx-auto space-y-2">
                        <h4 className="text-xl font-black text-slate-900">Showcase your potential!</h4>
                        <p className="text-slate-500 font-medium">
                            If you're just starting out, focus on adding <strong className="text-blue-600 underline">Projects</strong> below to demonstrate your skills to recruiters.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
