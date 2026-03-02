
import React, { useState, useRef } from 'react';
import { Camera, Mail, Phone, MapPin, Globe, User, Hash, Briefcase } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { StudentProfile, ProfileUpdateData } from '../../types/profile';

interface PersonalInfoProps {
    profile: StudentProfile;
    onUpdate: (data: ProfileUpdateData) => Promise<void>;
    onAvatarUpload: (file: File) => Promise<void>;
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({ profile, onUpdate, onAvatarUpload }) => {
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileUpdateData>({
        defaultValues: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            headline: profile.headline || '',
            bio: profile.bio || '',
            phone: profile.phone || '',
            address: profile.address || '',
            age: profile.age,
            preferredCareerField: profile.preferredCareerField || '',
            location: {
                city: profile.location?.city || '',
                country: profile.location?.country || '',
                isOpenToRelocation: profile.location?.isOpenToRelocation || false,
            },
        }
    });

    const onSubmit = async (data: ProfileUpdateData) => {
        await onUpdate(data);
        setIsEditing(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await onAvatarUpload(file);
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row gap-10 items-start">
                {/* Avatar Section */}
                <div className="relative group shrink-0">
                    <div className="h-40 w-40 rounded-[40px] bg-slate-100 border-4 border-white shadow-2xl overflow-hidden relative transition-transform duration-500 group-hover:scale-105">
                        {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
                                <Camera size={48} />
                            </div>
                        )}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 text-white backdrop-blur-sm"
                        >
                            <Camera size={24} className="mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">Change Photo</span>
                        </button>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full border-2 border-white uppercase tracking-widest shadow-lg whitespace-nowrap">
                        {profile.profileCompleteness}% PROFILE STRENGTH
                    </div>
                </div>

                {/* Display Mode */}
                {!isEditing ? (
                    <div className="flex-1 space-y-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                                    {profile.firstName} {profile.lastName}
                                </h2>
                                {profile.age && (
                                    <span className="bg-slate-100 text-slate-500 text-sm font-bold px-3 py-1 rounded-full border border-slate-200">
                                        {profile.age} years
                                    </span>
                                )}
                            </div>
                            <p className="text-xl text-blue-600 font-bold tracking-tight">{profile.headline || 'Professional Headline'}</p>
                        </div>

                        <div className="bg-slate-50/50 p-6 rounded-[24px] border border-slate-100 italic text-slate-600 leading-relaxed text-lg shadow-sm">
                            {profile.bio || 'Add a compelling bio to stand out to employers...'}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 text-sm text-slate-600 font-medium bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <Mail size={18} className="text-blue-500" />
                                <span>{typeof profile.user !== 'string' ? profile.user?.email : 'No Email'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600 font-medium bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <Phone size={18} className="text-blue-500" />
                                <span>{profile.phone || 'No phone number'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600 font-medium bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <MapPin size={18} className="text-blue-500" />
                                <span>{profile.location?.city || 'City'}, {profile.location?.country || 'Country'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600 font-medium bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <Briefcase size={18} className="text-blue-500" />
                                <span>{profile.preferredCareerField || 'Career Field'}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn-primary py-3 px-10 shadow-xl shadow-blue-100 rounded-2xl font-black uppercase tracking-widest text-xs"
                        >
                            Edit Personal Profile
                        </button>
                    </div>
                ) : (
                    /* Edit Mode */
                    <form onSubmit={handleSubmit(onSubmit)} className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-500">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    {...register('firstName', { required: 'Required' })}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                />
                            </div>
                            {errors.firstName && <span className="text-red-500 text-[10px] font-bold">{errors.firstName.message}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    {...register('lastName', { required: 'Required' })}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Headline</label>
                            <input
                                {...register('headline')}
                                placeholder="e.g. Software Engineer at TechCorp"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bio</label>
                            <textarea
                                {...register('bio')}
                                rows={4}
                                placeholder="What makes you unique?"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium resize-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Age (Min 16)</label>
                            <div className="relative">
                                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="number"
                                    {...register('age', { min: { value: 16, message: 'Minimum age is 16' } })}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                />
                            </div>
                            {errors.age && <span className="text-red-500 text-[10px] font-bold">{errors.age.message}</span>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    {...register('phone')}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    {...register('address')}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                            <input
                                {...register('location.city')}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
                            <input
                                {...register('location.country')}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Preferred Career Field</label>
                            <input
                                {...register('preferredCareerField', { required: 'Required' })}
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                            />
                            {errors.preferredCareerField && <span className="text-red-500 text-[10px] font-bold">{errors.preferredCareerField.message}</span>}
                        </div>

                        <div className="md:col-span-2 flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-3">
                                <Globe className="text-blue-600" size={20} />
                                <span className="text-sm font-bold text-slate-700">Are you open to relocation?</span>
                            </div>
                            <input
                                type="checkbox"
                                {...register('location.isOpenToRelocation')}
                                className="h-6 w-12 rounded-full appearance-none bg-slate-200 checked:bg-blue-600 transition-colors relative cursor-pointer before:content-[''] before:absolute before:h-4 before:w-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:translate-x-6 before:transition-transform"
                            />
                        </div>

                        <div className="md:col-span-2 flex gap-4 pt-6 mt-4 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary py-3 px-10 shadow-xl shadow-blue-100 rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-50"
                            >
                                {isSubmitting ? 'Updating...' : 'Save Profile Details'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="btn-secondary py-3 px-10 rounded-2xl font-black uppercase tracking-widest text-xs"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default PersonalInfo;
