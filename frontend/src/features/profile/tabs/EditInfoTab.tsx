import React, { useState, useEffect } from 'react';
import { Camera, Save, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import profileService from '../../../services/profileService';
import type { StudentProfile } from '../../../types/profile';
import { profileInfoSchema, type ProfileInfoInput } from '../profileSchemas';
import toast from 'react-hot-toast';

interface Props {
    profile: StudentProfile;
    setProfile: (p: StudentProfile) => void;
}

const EditInfoTab: React.FC<Props> = ({ profile, setProfile }) => {
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
            setSuccess(true);
            toast.success('Profile saved successfully');
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save profile');
            toast.error('Failed to save profile');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h2 className="text-xl font-black tracking-tight text-slate-900">Personal Information</h2>
                <p className="text-sm font-bold text-slate-500">Update your basic details and profile photo.</p>
            </div>

            {/* Avatar Upload */}
            <div className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border-4 border-white shadow-sm">
                        {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:opacity-75 transition-opacity" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500 font-black text-2xl">
                                {profile.firstName?.[0] || 'N'}
                            </div>
                        )}
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-slate-900/40 text-white opacity-0 group-hover:opacity-100 cursor-pointer rounded-2xl transition-opacity">
                        {uploading ? <Loader2 className="animate-spin" /> : <Camera />}
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
                    </label>
                </div>
                <div>
                    <h3 className="font-bold text-slate-900">Profile Photo</h3>
                    <p className="text-xs text-slate-500 mb-3">Square image, JPG or PNG up to 5MB.</p>
                    <label className="btn-secondary text-xs cursor-pointer py-1.5 px-3">
                        {uploading ? 'Uploading...' : 'Change Photo'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
                    </label>
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">First Name</label>
                        <input
                            {...register('firstName')}
                            type="text"
                            className={`input-field ${errors.firstName ? 'border-red-500 bg-red-50' : ''}`}
                            placeholder="John"
                        />
                        {errors.firstName && (
                            <p className="text-[10px] font-bold text-red-500 mt-1">{errors.firstName.message}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Last Name</label>
                        <input
                            {...register('lastName')}
                            type="text"
                            className={`input-field ${errors.lastName ? 'border-red-500 bg-red-50' : ''}`}
                            placeholder="Doe"
                        />
                        {errors.lastName && (
                            <p className="text-[10px] font-bold text-red-500 mt-1">{errors.lastName.message}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Professional Headline</label>
                    <input
                        {...register('headline')}
                        type="text"
                        className={`input-field ${errors.headline ? 'border-red-500 bg-red-50' : ''}`}
                        placeholder="e.g. Full Stack Developer | React Enthusiast"
                    />
                    <div className="flex justify-between items-center mt-1">
                        {errors.headline ? (
                            <p className="text-[10px] font-bold text-red-500">{errors.headline.message}</p>
                        ) : (
                            <span></span>
                        )}
                        {/* No easy way to get value length from register without watch, but we have bio length manually handled or we can just leave it if it's too much overhead. Actually, let's skip counter for headline to keep it clean if not using watch. */}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">About Me (Bio)</label>
                    <textarea
                        {...register('bio')}
                        className={`input-field min-h-[120px] resize-y ${errors.bio ? 'border-red-500 bg-red-50' : ''}`}
                        placeholder="Write a short summary about yourself to help the AI understand your background and goals..."
                    />
                    <div className="flex justify-between items-center mt-1">
                        {errors.bio ? (
                            <p className="text-[10px] font-bold text-red-500">{errors.bio.message}</p>
                        ) : (
                            <span></span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">City</label>
                        <input
                            {...register('location.city')}
                            type="text"
                            className={`input-field ${errors.location?.city ? 'border-red-500 bg-red-50' : ''}`}
                            placeholder="Colombo"
                        />
                        {errors.location?.city && (
                            <p className="text-[10px] font-bold text-red-500 mt-1">{errors.location.city.message}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Country</label>
                        <input
                            {...register('location.country')}
                            type="text"
                            className={`input-field ${errors.location?.country ? 'border-red-500 bg-red-50' : ''}`}
                            placeholder="Sri Lanka"
                        />
                        {errors.location?.country && (
                            <p className="text-[10px] font-bold text-red-500 mt-1">{errors.location.country.message}</p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Phone</label>
                        <input
                            {...register('phone')}
                            type="tel"
                            className={`input-field ${errors.phone ? 'border-red-500 bg-red-50' : ''}`}
                            placeholder="+94 7X XXX XXXX"
                        />
                        {errors.phone && (
                            <p className="text-[10px] font-bold text-red-500 mt-1">{errors.phone.message}</p>
                        )}
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    {/* Toggles */}
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                {...register('isActivelyLooking')}
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 ring-blue-500"
                            />
                            <span className="text-sm font-bold text-slate-700">Actively looking for work</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                {...register('isPublic')}
                                type="checkbox"
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 ring-blue-500"
                            />
                            <span className="text-sm font-bold text-slate-700">Public Profile</span>
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting || (!isDirty && !!profile.avatarUrl)} 
                        className={`btn-primary flex items-center gap-2 ${(isSubmitting || (!isDirty && !!profile.avatarUrl)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {success ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditInfoTab;
