import React from 'react';
import { GraduationCap, Landmark, Microscope, Hash, Briefcase, Award } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { StudentProfile, ProfileUpdateData } from '../../types/profile';

interface AcademicInfoProps {
    profile: StudentProfile;
    onUpdate: (data: ProfileUpdateData) => Promise<void>;
}

export const AcademicInfo: React.FC<AcademicInfoProps> = ({ profile, onUpdate }) => {
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
    };

    const careerFields = [
        'software-engineering', 'data-science', 'cybersecurity', 'cloud-devops',
        'ui-ux-design', 'mobile-development', 'networking', 'ai-machine-learning',
        'business-analysis', 'project-management', 'finance', 'other'
    ];

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex items-center gap-8 pb-8 border-b border-slate-50">
                <div className="h-20 w-20 rounded-[28px] bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm border border-orange-100">
                    <GraduationCap size={32} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Academic Foundation</h3>
                    <p className="text-xs font-bold text-slate-400 max-w-[280px] leading-relaxed mt-1 uppercase tracking-wider">
                        Your university credentials and current academic progress.
                    </p>
                </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                {/* University Name */}
                <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">University / Educational Institution</label>
                    <div className="relative group">
                        <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            {...register('university', { required: 'University name is required' })}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-slate-700 transition-all"
                            placeholder="e.g. SLIIT"
                        />
                    </div>
                    {errors.university && <span className="text-red-500 text-[10px] font-bold ml-1">{errors.university.message}</span>}
                </div>

                {/* Faculty */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Faculty / Department</label>
                    <div className="relative group">
                        <Microscope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            {...register('faculty', { required: 'Faculty is required' })}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-slate-700 transition-all"
                            placeholder="e.g. Computing"
                        />
                    </div>
                </div>

                {/* Major */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Major / Specialization</label>
                    <input
                        {...register('major', { required: 'Major is required' })}
                        className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-blue-600 transition-all"
                        placeholder="e.g. Software Engineering"
                    />
                </div>

                {/* Year and GPA Row */}
                <div className="grid grid-cols-2 gap-6 md:col-span-2">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Year</label>
                        <select
                            {...register('yearOfStudy')}
                            className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 outline-none font-bold text-slate-700 appearance-none transition-all"
                        >
                            {[1, 2, 3, 4, 5].map(y => <option key={y} value={y}>Year {y}</option>)}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CGPA (if applicable)</label>
                        <div className="relative group">
                            <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="number"
                                step="0.01"
                                {...register('gpa', { min: 0, max: 4.0 })}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 outline-none font-bold text-slate-700 transition-all"
                                placeholder="4.00"
                            />
                        </div>
                    </div>
                </div>

                {/* Student ID */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Student ID Tag</label>
                    <div className="relative group">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <input
                            {...register('studentId')}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 outline-none font-bold text-slate-700 transition-all"
                            placeholder="ITXXXXXX"
                        />
                    </div>
                </div>

                {/* Career Field */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Strategic Career Path</label>
                    <div className="relative group">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                        <select
                            {...register('careerField')}
                            className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 outline-none font-bold text-slate-700 appearance-none transition-all capitalize"
                        >
                            <option value="">Select Domain</option>
                            {careerFields.map(field => (
                                <option key={field} value={field}>{field.replace(/-/g, ' ')}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="md:col-span-2 pt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-primary py-5 rounded-[24px] flex items-center justify-center gap-3 active:scale-[0.98] transition-all bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-orange-200"
                    >
                        {isSubmitting ? (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>
                        ) : null}
                        <span className="text-sm uppercase tracking-[0.2em] font-black">Sync Academic Record</span>
                    </button>
                    <p className="text-center text-[10px] font-bold text-slate-300 mt-4 uppercase tracking-[0.1em]">These details form the core of your professional index</p>
                </div>
            </form>
        </div>
    );
};

export default AcademicInfo;
