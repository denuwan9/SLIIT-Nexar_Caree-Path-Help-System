import React, { useState } from 'react';
import { Plus, Calendar, BookOpen, Trash } from 'lucide-react';
import type { Education, DegreeType } from '../../types/profile';

interface EducationListProps {
    education: Education[];
    onAdd: (data: Omit<Education, '_id'>) => Promise<void>;
    onRemove: (id: string) => Promise<void>;
}

export const EducationList: React.FC<EducationListProps> = ({ education, onAdd, onRemove }) => {
    const [showAddForm, setShowAddForm] = useState(education.length === 0);
    const [formData, setFormData] = useState<Omit<Education, '_id'>>({
        institution: '',
        degree: 'Bachelor\'s',
        field: '',
        startDate: '',
        endDate: '',
        isCurrentlyEnrolled: false,
        gpa: undefined,
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
            institution: '',
            degree: 'Bachelor\'s',
            field: '',
            startDate: '',
            endDate: '',
            isCurrentlyEnrolled: false,
            gpa: undefined,
            description: '',
        });
        setShowAddForm(false);
    };

    const degrees: DegreeType[] = ['Certificate', 'Diploma', 'HND', "Bachelor's", "Master's", 'PhD', 'Other'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="text-blue-600" />
                    Education History
                </h3>
                {!showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                    >
                        <Plus size={16} /> Add Education
                    </button>
                )}
            </div>

            {showAddForm && (
                <form onSubmit={handleSubmit} className="card bg-blue-50/30 border-blue-100 p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Institution</label>
                            <input
                                type="text"
                                name="institution"
                                required
                                value={formData.institution}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. SLIIT"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Degree</label>
                            <select
                                name="degree"
                                value={formData.degree}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {degrees.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700">Field of Study</label>
                            <input
                                type="text"
                                name="field"
                                required
                                value={formData.field}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Software Engineering"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">GPA (Optional)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="gpa"
                                value={formData.gpa || ''}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
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
                                disabled={formData.isCurrentlyEnrolled}
                                value={formData.endDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 disabled:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="enrolled"
                            name="isCurrentlyEnrolled"
                            checked={formData.isCurrentlyEnrolled}
                            onChange={handleChange}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="enrolled" className="text-sm font-medium text-slate-700">Currently enrolled</label>
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
                {education.length === 0 && !showAddForm && (
                    <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-500 font-medium italic">No education history added yet.</p>
                    </div>
                )}

                {education.map((edu) => (
                    <div key={edu._id} className="group relative card hover:border-blue-200 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <h4 className="text-lg font-bold text-slate-900">{edu.institution}</h4>
                                <p className="text-blue-600 font-semibold">{edu.degree} in {edu.field}</p>
                                <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        {new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {
                                            edu.isCurrentlyEnrolled ? 'Present' : (edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A')
                                        }
                                    </div>
                                    {edu.gpa && <div className="font-bold border-l pl-4 border-slate-200">GPA: {edu.gpa}</div>}
                                </div>
                            </div>
                            <button
                                onClick={() => onRemove(edu._id!)}
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
