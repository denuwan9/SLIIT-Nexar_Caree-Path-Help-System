import React, { useState } from 'react';
import { GraduationCap, Award, Book } from 'lucide-react';
import type { StudentProfile } from '../../types/profile';

interface AcademicInfoProps {
    profile: StudentProfile;
    onUpdate: (data: any) => Promise<void>;
}

export const AcademicInfo: React.FC<AcademicInfoProps> = ({ profile, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        university: profile.university || '',
        faculty: profile.faculty || '',
        major: profile.major || '',
        yearOfStudy: profile.yearOfStudy || 1,
        gpa: profile.gpa || '',
        studentId: profile.studentId || '',
        careerField: profile.careerField || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdate(formData);
        setIsEditing(false);
    };

    const careerFields = [
        'software-engineering', 'data-science', 'cybersecurity', 'cloud-devops',
        'ui-ux-design', 'mobile-development', 'networking', 'ai-machine-learning',
        'business-analysis', 'project-management', 'other'
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="text-blue-600" />
                    Academic Overview
                </h3>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-blue-600 font-bold text-sm hover:underline">
                        Edit Details
                    </button>
                )}
            </div>

            {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                        <Book className="text-slate-400 mt-1" size={20} />
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Institution</p>
                            <p className="font-semibold text-slate-900">{profile.university || 'Not specified'}</p>
                            <p className="text-sm text-slate-500">{profile.faculty || 'Faculty not added'}</p>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                        <Award className="text-slate-400 mt-1" size={20} />
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Major & Year</p>
                            <p className="font-semibold text-slate-900">{profile.major || 'Not specified'}</p>
                            <p className="text-sm text-slate-500">Year {profile.yearOfStudy} Student</p>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold mb-1">
                            {profile.gpa || '-'}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current GPA</p>
                            <p className="font-semibold text-slate-900 border-b-2 border-blue-200">Scale 4.0</p>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase">Academic Performance</p>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="card space-y-6 bg-slate-50/50 border-blue-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">University</label>
                            <input
                                type="text"
                                name="university"
                                value={formData.university}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Faculty</label>
                            <input
                                type="text"
                                name="faculty"
                                value={formData.faculty}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-sm font-bold text-slate-700">Degree/Major</label>
                            <input
                                type="text"
                                name="major"
                                value={formData.major}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. BSe (Hons) in Information Technology"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Year of Study</label>
                            <input
                                type="number"
                                name="yearOfStudy"
                                min="1"
                                max="6"
                                value={formData.yearOfStudy}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Current GPA</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="4"
                                name="gpa"
                                value={formData.gpa}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Student ID</label>
                            <input
                                type="text"
                                name="studentId"
                                value={formData.studentId}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Target Career Field</label>
                            <select
                                name="careerField"
                                value={formData.careerField}
                                onChange={handleChange}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none capitalize"
                            >
                                <option value="">Select Field</option>
                                {careerFields.map(field => (
                                    <option key={field} value={field}>{field.replace(/-/g, ' ')}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-200/50">
                        <button type="submit" className="btn-primary py-2 px-8">Update Academic Info</button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="btn-secondary py-2 px-8"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};
