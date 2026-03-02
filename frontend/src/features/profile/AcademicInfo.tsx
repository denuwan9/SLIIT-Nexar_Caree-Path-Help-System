import React, { useState } from 'react';
import { GraduationCap, Award, Book, Landmark, Microscope, Briefcase } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { StudentProfile, ProfileUpdateData } from '../../types/profile';

interface AcademicInfoProps {
    profile: StudentProfile;
    onUpdate: (data: ProfileUpdateData) => Promise<void>;
}

export const AcademicInfo: React.FC<AcademicInfoProps> = ({ profile, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileUpdateData>({
        defaultValues: {
            university: profile.university || '',
            faculty: profile.faculty || '',
            major: profile.major || '',
            yearOfStudy: profile.yearOfStudy || 1,
            gpa: profile.gpa || 0,
            studentId: profile.studentId || '',
            careerField: profile.careerField || '',
        }
    });

    const onSubmit = async (data: ProfileUpdateData) => {
        await onUpdate(data);
        setIsEditing(false);
    };

    const careerFields = [
        'software-engineering', 'data-science', 'cybersecurity', 'cloud-devops',
        'ui-ux-design', 'mobile-development', 'networking', 'ai-machine-learning',
        'business-analysis', 'project-management', 'other'
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                    <GraduationCap className="text-blue-600" size={28} />
                    Academic Journey
                </h3>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="text-blue-600 font-bold text-xs uppercase tracking-widest hover:text-blue-800 transition-colors bg-blue-50 px-4 py-2 rounded-xl"
                    >
                        Edit Academic Stats
                    </button>
                )}
            </div>

            {!isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="group p-6 bg-white border border-slate-100 rounded-[24px] shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                            <Landmark size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">University / Faculty</p>
                            <p className="font-bold text-slate-900 text-lg leading-tight">{profile.university || 'University not specified'}</p>
                            <p className="text-sm text-slate-500 mt-1">{profile.faculty || 'Faculty details to be added'}</p>
                        </div>
                    </div>

                    <div className="group p-6 bg-white border border-slate-100 rounded-[24px] shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                            <Microscope size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Major & Progress</p>
                            <p className="font-bold text-slate-900 text-lg leading-tight">{profile.major || 'Major not specified'}</p>
                            <p className="text-sm text-slate-500 mt-1">Year {profile.yearOfStudy} Student • ID: {profile.studentId || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="group p-6 bg-slate-900 text-white rounded-[24px] shadow-xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute -top-6 -right-6 h-24 w-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                        <div className="flex justify-between items-start z-10">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grade Point Average</p>
                                <p className="text-4xl font-black">{profile.gpa || '0.00'}</p>
                            </div>
                            <Award className="text-blue-500" size={24} />
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest z-10">Academic Excellence</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="card p-8 bg-slate-50/50 border-slate-200 animate-in slide-in-from-top-4 duration-500 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">University Name</label>
                            <input
                                {...register('university', { required: 'University is required' })}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Faculty / Department</label>
                            <input
                                {...register('faculty')}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Degree Title / Major</label>
                            <input
                                {...register('major', { required: 'Major is required' })}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-600"
                                placeholder="e.g. BSc (Hons) in Software Engineering"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Year of Study</label>
                            <select
                                {...register('yearOfStudy')}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                            >
                                {[1, 2, 3, 4, 5, 6].map(y => <option key={y} value={y}>Year {y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current GPA (4.0 Scale)</label>
                            <input
                                type="number"
                                step="0.01"
                                {...register('gpa', { min: 0, max: 4 })}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Student ID</label>
                            <input
                                {...register('studentId')}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Career Sector</label>
                            <div className="relative">
                                <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <select
                                    {...register('careerField')}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold appearance-none capitalize"
                                >
                                    <option value="">Select Sector</option>
                                    {careerFields.map(field => (
                                        <option key={field} value={field}>{field.replace(/-/g, ' ')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-slate-200">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary py-3 px-10 rounded-2xl font-black uppercase tracking-widest text-xs"
                        >
                            {isSubmitting ? 'Updating...' : 'Save Academic Details'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsEditing(false)}
                            className="bg-white text-slate-500 border border-slate-200 py-3 px-10 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};
