import React, { useState, useEffect } from 'react';
import { Camera, Save, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import profileService from '../../../services/profileService';
import type { StudentProfile } from '../../../types/profile';
import { profileInfoSchema, type ProfileInfoInput } from '../profileSchemas';
import toast from 'react-hot-toast';
import { useAuth } from '../../../components/auth/AuthProvider';

interface Props {
    profile: StudentProfile;
    setProfile: (p: StudentProfile) => void;
}

const EditInfoTab: React.FC<Props> = ({ profile, setProfile }) => {
    const { updateUser } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting, isDirty },
    } = useForm<ProfileInfoInput>({
        resolver: zodResolver(profileInfoSchema),
        defaultValues: {
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            headline: profile.headline || '',
            bio: profile.bio || '',
            phone: profile.phone || '',
            location: {
                city: profile.location?.city || '',
                country: profile.location?.country || 'Sri Lanka',
                isOpenToRelocation: !!profile.location?.isOpenToRelocation,
            },
            university: profile.university || '',
            faculty: profile.faculty || '',
            major: profile.major || '',
            yearOfStudy: profile.yearOfStudy || undefined,
            gpa: profile.gpa || undefined,
            studentId: profile.studentId || undefined,
            isActivelyLooking: !!profile.isActivelyLooking,
            isPublic: profile.isPublic ?? true,
        },
    });

    // Update form when profile prop changes
    useEffect(() => {
        reset({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            headline: profile.headline || '',
            bio: profile.bio || '',
            phone: profile.phone || '',
            location: {
                city: profile.location?.city || '',
                country: profile.location?.country || 'Sri Lanka',
                isOpenToRelocation: !!profile.location?.isOpenToRelocation,
            },
            university: profile.university || '',
            faculty: profile.faculty || '',
            major: profile.major || '',
            yearOfStudy: profile.yearOfStudy || undefined,
            gpa: profile.gpa || undefined,
            studentId: profile.studentId || undefined,
            isActivelyLooking: !!profile.isActivelyLooking,
            isPublic: profile.isPublic ?? true,
        });
    }, [profile, reset]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setError(null);
            const { avatarUrl, profile: updatedProfile } = await profileService.uploadAvatar(file);
            setProfile({ ...profile, avatarUrl, ...updatedProfile });
            updateUser({ avatarUrl });
            toast.success('Avatar updated successfully');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Avatar upload failed');
            toast.error('Avatar upload failed');
        } finally {
            setUploading(false);
        }
    };

    const onFormSubmit = async (data: ProfileInfoInput) => {
        try {
            setError(null);
            setSuccess(false);
            const updated = await profileService.updateMe(data);
            setProfile({ ...profile, ...updated });
            updateUser({ firstName: data.firstName, lastName: data.lastName });
            setSuccess(true);
            toast.success('Profile saved successfully');
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save profile');
            toast.error('Failed to save profile');
        }
    };

    return (
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header & Avatar */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50">
                <div className="mb-8">
                    <h2 className="text-2xl font-black tracking-tight text-[#0F172A] uppercase tracking-widest text-[14px]">
                        Identity & Presence
                    </h2>
                    <p className="text-[13px] font-bold text-[#64748B] mt-1">Update your professional identity and appearance.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-[2rem] bg-slate-50 border border-slate-100/50">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[2rem] overflow-hidden bg-white border-4 border-white shadow-xl group-hover:shadow-2xl transition-all duration-500">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-3xl">
                                    {profile.firstName?.[0] || 'N'}
                                </div>
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-[#0F172A]/60 text-white opacity-0 group-hover:opacity-100 cursor-pointer rounded-[2rem] transition-all duration-300 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-2">
                                {uploading ? <Loader2 className="animate-spin" size={24} /> : <Camera size={24} />}
                                <span className="text-[10px] font-black uppercase tracking-widest">Update</span>
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
                        </label>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Professional Portrait</h3>
                        <p className="text-[13px] font-medium text-[#64748B] mt-1 mb-6 leading-relaxed max-w-sm">
                            A professional photo increases your profile visibility by 14x. Use a clear, high-resolution headshot.
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <label className="px-6 py-2.5 bg-white border border-slate-200 text-[#0F172A] rounded-xl font-black text-[12px] shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                                {uploading ? 'Processing...' : 'Upload New Photo'}
                                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
                            </label>
                            {profile.avatarUrl && (
                                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    Active Profile Image
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-3 p-5 rounded-3xl bg-rose-50 text-rose-600 border border-rose-100 text-[13px] font-bold">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-10">
                {/* Basic Info Section */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-2">
                             Core Information
                        </h3>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">First Name</label>
                                <input
                                    {...register('firstName')}
                                    type="text"
                                    className={`input-field h-12 text-[13px] ${errors.firstName ? 'border-rose-500 bg-rose-50/30' : 'bg-slate-50/50'}`}
                                    placeholder="John"
                                />
                                {errors.firstName && (
                                    <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Last Name</label>
                                <input
                                    {...register('lastName')}
                                    type="text"
                                    className={`input-field h-12 text-[13px] ${errors.lastName ? 'border-rose-500 bg-rose-50/30' : 'bg-slate-50/50'}`}
                                    placeholder="Doe"
                                />
                                {errors.lastName && (
                                    <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Professional Headline</label>
                            <input
                                {...register('headline')}
                                type="text"
                                className={`input-field h-12 text-[13px] ${errors.headline ? 'border-rose-500 bg-rose-50/30' : 'bg-slate-50/50'}`}
                                placeholder="e.g. Full Stack Developer | ML Enthusiast"
                            />
                            {errors.headline && (
                                <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.headline.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">About Me (Bio)</label>
                            <textarea
                                {...register('bio')}
                                className={`input-field min-h-[140px] resize-none py-4 text-[13px] leading-relaxed ${errors.bio ? 'border-rose-500 bg-rose-50/30' : 'bg-slate-50/50'}`}
                                placeholder="Describe your journey, skills, and what drives you..."
                            />
                            {errors.bio && (
                                <p className="text-[10px] font-bold text-rose-500 mt-1">{errors.bio.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Academic Information Section */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Academic Nexus</h3>
                        <p className="text-[13px] font-bold text-[#64748B] mt-1">Your current placement and academic trajectory.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">University / Institution</label>
                            <input
                                {...register('university')}
                                type="text"
                                className={`input-field h-12 text-[13px] ${errors.university ? 'border-rose-500 bg-rose-50/30' : 'bg-slate-50/50'}`}
                                placeholder="e.g. SLIIT"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Faculty</label>
                            <input
                                {...register('faculty')}
                                type="text"
                                className={`input-field h-12 text-[13px] ${errors.faculty ? 'border-rose-500 bg-rose-50/30' : 'bg-slate-50/50'}`}
                                placeholder="e.g. Computing"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Major / Specialization</label>
                            <input
                                {...register('major')}
                                type="text"
                                className={`input-field h-12 text-[13px] ${errors.major ? 'border-rose-500 bg-rose-50/30' : 'bg-slate-50/50'}`}
                                placeholder="e.g. Software Engineering"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-6 md:col-span-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Year</label>
                                <input
                                    {...register('yearOfStudy', { valueAsNumber: true })}
                                    type="number"
                                    min="1"
                                    className={`input-field h-12 text-[13px] ${errors.yearOfStudy ? 'border-rose-500 bg-rose-50/30' : 'bg-slate-50/50'}`}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">GPA</label>
                                <input
                                    {...register('gpa', { valueAsNumber: true })}
                                    type="number"
                                    step="0.01"
                                    className={`input-field h-12 text-[13px] ${errors.gpa ? 'border-rose-500 bg-rose-50/30' : 'bg-slate-50/50'}`}
                                    placeholder="4.00"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Student ID</label>
                                <input
                                    {...register('studentId')}
                                    type="text"
                                    className={`input-field h-12 text-[13px] ${errors.studentId ? 'border-rose-500 bg-rose-50/30' : 'bg-slate-50/50'}`}
                                    placeholder="ITXXXXXXXX"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Location & Visibility Section */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100/50">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Presence & Preferences</h3>
                        <p className="text-[13px] font-bold text-[#64748B] mt-1">Manage your visibility and professional status.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">City</label>
                            <input
                                {...register('location.city')}
                                className="input-field h-12 text-[13px] bg-slate-50/50"
                                placeholder="Colombo"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Country</label>
                            <input
                                {...register('location.country')}
                                className="input-field h-12 text-[13px] bg-slate-50/50"
                                placeholder="Sri Lanka"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Contact Phone</label>
                            <input
                                {...register('phone')}
                                className="input-field h-12 text-[13px] bg-slate-50/50"
                                placeholder="+94 7..."
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-8 py-6 border-t border-slate-50">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    {...register('isActivelyLooking')}
                                    type="checkbox"
                                    className="peer sr-only"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </div>
                            <span className="text-[13px] font-black text-[#0F172A] group-hover:text-blue-600 transition-colors">Open to Opportunities</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <input
                                    {...register('isPublic')}
                                    type="checkbox"
                                    className="peer sr-only"
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                            </div>
                            <span className="text-[13px] font-black text-[#0F172A] group-hover:text-emerald-600 transition-colors">Public Profile Discovery</span>
                        </label>
                    </div>
                </div>

                {/* Submit Bar */}
                <div className="flex items-center justify-between p-8 rounded-[2rem] bg-[#0F172A] shadow-xl">
                    <div>
                        <p className="text-white font-black text-[14px]">Ready to sync updates?</p>
                        <p className="text-slate-400 text-[11px] font-bold">Your profile will be re-analyzed by NEXAR AI upon saving.</p>
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSubmitting || (!isDirty && !!profile.avatarUrl)} 
                        className={`px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-[13px] shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        {success ? 'Nexus Synced!' : 'Force Save Updates'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditInfoTab;
