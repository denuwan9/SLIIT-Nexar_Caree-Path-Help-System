import React, { useState } from 'react';
import { Plus, Trash, Calendar, Briefcase, MapPin } from 'lucide-react';
import type { Experience, EmploymentType } from '../../types/profile';

interface ExperienceListProps {
    experience: Experience[];
    onAdd: (data: Omit<Experience, '_id'>) => Promise<void>;
    onRemove: (id: string) => Promise<void>;
}

export const ExperienceList: React.FC<ExperienceListProps> = ({ experience, onAdd, onRemove }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState<Omit<Experience, '_id'>>({
        title: '',
        company: '',
        type: 'internship',
        location: '',
        isRemote: false,
        startDate: '',
        endDate: '',
        isCurrent: false,
        description: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onAdd(formData);
        setFormData({
            title: '',
            company: '',
            type: 'internship',
            location: '',
            isRemote: false,
            startDate: '',
            endDate: '',
            isCurrent: false,
            description: '',
        });
        setShowAddForm(false);
    };

    const types: EmploymentType[] = ['full-time', 'part-time', 'internship', 'contract', 'freelance', 'volunteer', 'project'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="text-blue-600" />
                    Work Experience
                </h3>
                {!showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                    >
                        <Plus size={16} /> Add Experience
                    </button>
                )}
            </div>

            {showAddForm && (
                <form onSubmit={handleSubmit} className="card bg-blue-50/30 border-blue-100 p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Job Title</label>
                            <input
                                type="text"
                                name="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Frontend Developer"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Company</label>
                            <input
                                type="text"
                                name="company"
                                required
                                value={formData.company}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Google"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Employment Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none capitalize"
                            >
                                {types.map(t => <option key={t} value={t}>{t.replace(/-/g, ' ')}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Colombo"
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-6">
                            <input
                                type="checkbox"
                                id="remote"
                                name="isRemote"
                                checked={formData.isRemote}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="remote" className="text-sm font-medium text-slate-700">Remote role</label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Start Date</label>
                            <input
                                type="date"
                                name="startDate"
                                required
                                value={formData.startDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">End Date</label>
                            <input
                                type="date"
                                name="endDate"
                                disabled={formData.isCurrent}
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="current"
                            name="isCurrent"
                            checked={formData.isCurrent}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="current" className="text-sm font-medium text-slate-700">Currently in this role</label>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Description</label>
                        <textarea
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="What did you achieve in this role?"
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="btn-primary py-2 px-8">Add to Profile</button>
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="btn-secondary py-2 px-8"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {experience.length === 0 && !showAddForm && (
                    <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-500 font-medium italic">No work experience added yet.</p>
                    </div>
                )}

                {experience.map((exp) => (
                    <div key={exp._id} className="group relative card hover:border-blue-200 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h4 className="text-lg font-bold text-slate-900">{exp.title}</h4>
                                <p className="text-blue-600 font-semibold">{exp.company} • <span className="capitalize">{exp.type.replace(/-/g, ' ')}</span></p>
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500 mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {
                                            exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A')
                                        }
                                    </div>
                                    {exp.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={14} />
                                            {exp.location} {exp.isRemote && '(Remote)'}
                                        </div>
                                    )}
                                </div>
                                {exp.description && (
                                    <p className="text-sm text-slate-600 mt-3 leading-relaxed border-l-2 border-slate-100 pl-4 italic">
                                        {exp.description}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => onRemove(exp._id!)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Trash size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
