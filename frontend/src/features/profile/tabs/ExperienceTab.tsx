import React, { useState } from 'react';
import { Plus, X, Briefcase, Calendar, MapPin, Loader2, AlertCircle } from 'lucide-react';
import profileService from '../../../services/profileService';
import type { StudentProfile, Experience, EmploymentType } from '../../../types/profile';

interface Props {
    profile: StudentProfile;
    setProfile: (p: StudentProfile) => void;
}

const ExperienceTab: React.FC<Props> = ({ profile, setProfile }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initialForm: Omit<Experience, '_id'> = {
        title: '', company: '', type: 'full-time',
        location: '', isRemote: false,
        startDate: '', endDate: '', isCurrent: false,
        description: ''
    };
    const [formData, setFormData] = useState(initialForm);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true); setError(null);
            const dataToSubmit = { ...formData };
            if (dataToSubmit.isCurrent) delete dataToSubmit.endDate;

            const experience = await profileService.addExperience(dataToSubmit);
            setProfile({ ...profile, experience });
            setFormData(initialForm);
            setIsAdding(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add experience');
        } finally { setLoading(false); }
    };

    const handleRemove = async (id: string) => {
        if (!confirm('Remove this experience entry?')) return;
        try {
            const experience = await profileService.removeExperience(id);
            setProfile({ ...profile, experience });
        } catch (err: any) { setError('Failed to remove entry'); }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        <Briefcase size={20} className="text-purple-500" /> Work Experience
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">Internships, part-time jobs, and volunteering.</p>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="btn-primary py-2 px-4 shadow-sm text-sm flex items-center gap-2">
                        <Plus size={16} /> Add Role
                    </button>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {isAdding && (
                <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-slate-900">Add New Role</h3>
                        <button type="button" onClick={() => setIsAdding(false)} className="p-1 text-slate-400 hover:text-slate-900 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Job Title</label>
                            <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Software Engineer Intern" className="input-field py-2" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Company</label>
                            <input type="text" required value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} placeholder="Tech Corp" className="input-field py-2" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Employment Type</label>
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as EmploymentType })} className="input-field py-2">
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
                            <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="Colombo, LK" className="input-field py-2" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Start Date</label>
                            <input type="month" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="input-field py-2" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">End Date</label>
                            <input type="month" disabled={formData.isCurrent} required={!formData.isCurrent} value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="input-field py-2 disabled:bg-slate-100 disabled:text-slate-400" />
                        </div>
                    </div>

                    <div className="flex items-center gap-6 mb-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.isCurrent} onChange={e => setFormData({ ...formData, isCurrent: e.target.checked })} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                            <span className="text-sm font-bold text-slate-700">I currently work here</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.isRemote} onChange={e => setFormData({ ...formData, isRemote: e.target.checked })} className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                            <span className="text-sm font-bold text-slate-700">Remote Position</span>
                        </label>
                    </div>

                    <div className="space-y-1.5 mb-6">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description (Optional)</label>
                        <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your responsibilities and achievements..." className="input-field min-h-[100px] resize-y py-2" maxLength={600} />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary py-2">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary py-2 w-32 flex justify-center">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Role'}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {profile.experience?.length === 0 && !isAdding && (
                    <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50">
                        <Briefcase size={32} className="mx-auto text-slate-300 mb-3" />
                        <h3 className="text-sm font-black text-slate-600">No experience added</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1 max-w-sm mx-auto">Add your internships or full-time roles to help the AI understand your practical background.</p>
                        <button onClick={() => setIsAdding(true)} className="btn-secondary mt-4 py-2 px-4 text-xs">Add First Role</button>
                    </div>
                )}

                {([...profile.experience || []]).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()).map(exp => (
                    <div key={exp._id} className="group relative p-6 rounded-3xl border border-slate-100 bg-white hover:border-purple-200 hover:shadow-md hover:shadow-purple-500/5 transition-all">
                        <button onClick={() => handleRemove(exp._id!)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                            <X size={16} />
                        </button>

                        <div className="flex gap-4 items-start">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center shrink-0">
                                <Briefcase size={20} className="text-slate-400" />
                            </div>
                            <div className="flex-1 space-y-2 pr-8">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 leading-tight">{exp.title}</h3>
                                    <p className="text-sm font-bold text-slate-600">{exp.company}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-slate-400">
                                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(exp.startDate)} — {exp.isCurrent ? 'Present' : formatDate(exp.endDate)}</span>
                                    {exp.location && <span className="flex items-center gap-1.5"><MapPin size={14} /> {exp.location}{exp.isRemote ? ' (Remote)' : ''}</span>}
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">{exp.type}</span>
                                </div>
                                {exp.description && (
                                    <p className="text-sm font-medium text-slate-600 leading-relaxed pt-2 whitespace-pre-wrap">
                                        {exp.description}
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

export default ExperienceTab;
