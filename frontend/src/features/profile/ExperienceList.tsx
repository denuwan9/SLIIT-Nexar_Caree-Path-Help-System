import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Briefcase, MapPin, Globe, X, Building2, Rocket } from 'lucide-react';
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

    const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<Omit<Experience, '_id'>>({
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
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Experience Status Toggle */}
            <div className="bg-slate-50/50 p-10 rounded-[40px] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase tracking-widest">Experience Status</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Are you currently an active professional or exploring entry-level?</p>
                </div>
                <div className="flex bg-white p-2 rounded-[24px] shadow-sm border border-slate-100 gap-2 shrink-0">
                    <button
                        onClick={() => onStatusUpdate('Has Experience')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${experienceStatus === 'Has Experience'
                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Has Experience
                    </button>
                    <button
                        onClick={() => onStatusUpdate('No Experience')}
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${experienceStatus === 'No Experience'
                            ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20'
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                            }`}
                    >
                        Entry Level
                    </button>
                </div>
            </div>

            {experienceStatus === 'Has Experience' && (
                <div className="space-y-10">
                    <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 italic">
                                <Briefcase size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Professional Timeline</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your career milestones and impact</p>
                            </div>
                        </div>
                        {!showAddForm && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="group flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:shadow-xl hover:shadow-emerald-500/10 transition-all active:scale-95"
                            >
                                <Plus size={16} className="transition-transform group-hover:rotate-90" />
                                Add Position
                            </button>
                        )}
                    </div>

                    {showAddForm && (
                        <div className="p-10 bg-white border-2 border-emerald-100 rounded-[40px] shadow-2xl shadow-emerald-500/5 relative overflow-hidden animate-in slide-in-from-top-6 duration-500">
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="absolute top-8 right-8 p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                            >
                                <X size={24} />
                            </button>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                                    {/* Role */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Job Title / Functional Role</label>
                                        <div className="relative group">
                                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                            <input
                                                {...register('title', { required: 'Required' })}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-slate-700 transition-all"
                                                placeholder="e.g. Lead Software Architect"
                                            />
                                        </div>
                                    </div>

                                    {/* Company */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organization / Entity</label>
                                        <div className="relative group">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                            <input
                                                {...register('company', { required: 'Required' })}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-slate-700 transition-all"
                                                placeholder="e.g. Google International"
                                            />
                                        </div>
                                    </div>

                                    {/* Type & Location */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contract Nature</label>
                                        <select
                                            {...register('type', { required: 'Required' })}
                                            className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-emerald-500/50 outline-none font-bold text-slate-700 appearance-none transition-all capitalize"
                                        >
                                            {types.map(t => <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Physical Location</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                            <input
                                                {...register('location')}
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-emerald-500/50 outline-none font-bold text-slate-700 transition-all"
                                                placeholder="City, Country"
                                            />
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="grid grid-cols-2 gap-6 md:col-span-2">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Engagement Start</label>
                                            <div className="relative group">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                                <input
                                                    type="date"
                                                    {...register('startDate', { required: 'Required' })}
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-emerald-500/50 outline-none font-bold text-slate-700 transition-all uppercase text-xs"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Engagement End</label>
                                            <div className="relative group">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
                                                <input
                                                    type="date"
                                                    disabled={isCurrent}
                                                    {...register('endDate')}
                                                    className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-emerald-500/50 outline-none font-bold text-slate-700 disabled:opacity-30 transition-all uppercase text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Toggles */}
                                    <div className="flex flex-col md:flex-row gap-6 md:col-span-2">
                                        <div className="flex-1 flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                                            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Active Status</span>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    {...register('isCurrent')}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </label>
                                        </div>
                                        <div className="flex-1 flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <Globe size={18} className="text-emerald-500" />
                                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">Remote Ready</span>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    {...register('isRemote')}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2 space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Key Contributions & Achievements</label>
                                        <textarea
                                            {...register('description')}
                                            rows={6}
                                            placeholder="Use bullet points to describe your quantifiable impact (e.g. Optimized database queries reducing load time by 40%)..."
                                            className="w-full px-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[32px] focus:bg-white focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none font-medium text-slate-600 leading-relaxed resize-none transition-all shadow-inner"
                                        />
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="flex gap-4 pt-6 border-t border-slate-50">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 btn-primary py-5 rounded-[24px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-xl shadow-emerald-500/20"
                                    >
                                        {isSubmitting ? (
                                            <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                                        ) : null}
                                        <span className="text-sm uppercase tracking-[0.2em] font-black">Archive Position</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="px-10 bg-slate-50 text-slate-400 py-3 rounded-[24px] font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 hover:text-slate-600 transition-all border border-slate-100"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Records List */}
                    <div className="grid grid-cols-1 gap-6">
                        {experience.map((exp) => (
                            <div key={exp._id} className="group relative p-10 bg-white border border-slate-100 rounded-[40px] shadow-sm hover:shadow-2xl hover:translate-y-[-6px] transition-all duration-500">
                                <div className="flex flex-col lg:flex-row justify-between lg:items-start gap-8">
                                    <div className="flex gap-8">
                                        <div className="h-20 w-20 rounded-[32px] bg-emerald-50/50 flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 rotate-[-3deg] group-hover:rotate-0">
                                            <Briefcase size={36} />
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{exp.title}</h4>
                                            <p className="text-emerald-600 font-black uppercase tracking-[0.15em] text-[11px] bg-emerald-50 px-3 py-1.5 rounded-lg inline-block">{exp.company} • {exp.type.replace(/-/g, ' ')}</p>

                                            <div className="flex flex-wrap items-center gap-6 mt-4">
                                                <div className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                    <Calendar size={16} className="text-slate-300" />
                                                    {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} — {
                                                        exp.isCurrent ? <span className="text-emerald-600">Active</span> : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Archive')
                                                    }
                                                </div>
                                                {exp.location && (
                                                    <div className="flex items-center gap-2.5 text-[11px] font-black uppercase tracking-widest text-slate-400">
                                                        <MapPin size={16} className="text-slate-300" />
                                                        {exp.location} {exp.isRemote && <span className="text-emerald-500">(Remote)</span>}
                                                    </div>
                                                )}
                                            </div>

                                            {exp.description && (
                                                <div className="mt-8 p-8 bg-slate-50/50 rounded-[32px] border border-slate-100 text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line group-hover:bg-white group-hover:shadow-inner transition-all duration-500 italic">
                                                    {exp.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onRemove(exp._id!)}
                                        className="p-4 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-[24px] transition-all self-end lg:self-start group-hover:opacity-100 md:opacity-0"
                                    >
                                        <Trash2 size={24} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {experienceStatus === 'No Experience' && (
                <div className="p-16 bg-blue-50/20 rounded-[50px] border-4 border-dashed border-blue-50 text-center space-y-6 animate-in zoom-in-95">
                    <div className="h-24 w-24 bg-white rounded-[40px] shadow-xl shadow-blue-500/10 flex items-center justify-center mx-auto text-blue-500">
                        <Rocket size={48} className="animate-bounce" />
                    </div>
                    <div className="max-w-md mx-auto space-y-3">
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">Catalyzing Your Career!</h4>
                        <p className="text-sm font-bold text-slate-400 leading-relaxed uppercase tracking-wider">
                            If you're at the beginning of your journey, focus on <strong className="text-blue-600">Projects</strong> above to highlight your technical expertise.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
