import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { Camera, Phone, MapPin, Globe, User, Hash, Briefcase } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { StudentProfile, ProfileUpdateData } from '../../types/profile';

interface PersonalInfoProps {
    profile: StudentProfile;
    onUpdate: (data: ProfileUpdateData) => Promise<void>;
    onAvatarUpload: (file: File) => Promise<void>;
}

export interface PersonalInfoHandle {
    submit: () => void;
}

export const PersonalInfo = forwardRef<PersonalInfoHandle, PersonalInfoProps>(
    ({ profile, onUpdate, onAvatarUpload }, ref) => {
        const fileInputRef = useRef<HTMLInputElement>(null);
        const formRef = useRef<HTMLFormElement>(null);

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

        // Expose submit() to parent (modal footer)
        useImperativeHandle(ref, () => ({
            submit: () => formRef.current?.requestSubmit(),
        }));

        const onSubmit = async (data: ProfileUpdateData) => {
            await onUpdate(data);
        };

        const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                await onAvatarUpload(file);
            }
        };

        return (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Avatar Edit Section */}
                <div className="flex items-center gap-8 pb-8 border-b border-slate-50">
                    <div className="relative group">
                        <div className="h-32 w-32 rounded-[32px] bg-slate-100 border-4 border-white shadow-xl overflow-hidden relative transition-all duration-500 hover:scale-105 hover:rotate-2">
                            {profile.avatarUrl ? (
                                <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
                                    <Camera size={32} />
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 text-white backdrop-blur-sm"
                            >
                                <Camera size={20} className="mb-1" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-center px-2">Change Photo</span>
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-800">Profile Identity</h3>
                        <p className="text-xs font-bold text-slate-400 max-w-[200px] leading-relaxed mt-1">
                            Use a high-quality professional photo to increase your visibility.
                        </p>
                    </div>
                </div>

                {/* Edit Form */}
                <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                {...register('firstName', { required: 'First name is required' })}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-slate-700 transition-all"
                                placeholder="e.g. John"
                            />
                        </div>
                        {errors.firstName && <span className="text-red-500 text-[10px] font-bold ml-1">{errors.firstName.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                {...register('lastName', { required: 'Last name is required' })}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-slate-700 transition-all"
                                placeholder="e.g. Doe"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Headline</label>
                        <div className="relative group">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                {...register('headline')}
                                placeholder="e.g. Full-Stack Web Developer | AI Enthusiast"
                                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-slate-700 transition-all"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">About Me Summary</label>
                        <textarea
                            {...register('bio')}
                            rows={5}
                            placeholder="Share your passion, key achievements, and what you're looking for..."
                            className="w-full px-6 py-5 bg-slate-50/50 border border-slate-100 rounded-[24px] focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none font-medium text-slate-600 leading-relaxed resize-none transition-all shadow-inner"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                {...register('phone')}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-slate-700 transition-all"
                                placeholder="+94 7X XXX XXXX"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                        <div className="relative group">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="number"
                                {...register('age', { min: { value: 16, message: 'Minimum age is 16' } })}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-slate-700 transition-all"
                            />
                        </div>
                        {errors.age && <span className="text-red-500 text-[10px] font-bold ml-1">{errors.age.message}</span>}
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                {...register('address')}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-slate-700 transition-all"
                                placeholder="e.g. 123 Main Street, Colombo"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                        <div className="relative group">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                {...register('location.city')}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-slate-700 transition-all"
                                placeholder="e.g. Colombo"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Country</label>
                        <div className="relative group">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                {...register('location.country')}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-slate-700 transition-all"
                                placeholder="Sri Lanka"
                            />
                        </div>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Career Sector</label>
                        <input
                            {...register('preferredCareerField', { required: 'Career sector is required' })}
                            className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 outline-none font-bold text-slate-700 transition-all"
                            placeholder="e.g. Information Technology / Data Science / Digital Marketing"
                        />
                        {errors.preferredCareerField && <span className="text-red-500 text-[10px] font-bold ml-1">{errors.preferredCareerField.message}</span>}
                    </div>

                    <div className="md:col-span-2 flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
                        <div className="space-y-1">
                            <h4 className="text-sm font-black text-slate-800">Open to Relocation</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Are you open to relocation opportunities?</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                {...register('location.isOpenToRelocation')}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Hidden submit — triggered by modal footer "Save Changes" */}
                    <button type="submit" className="hidden" aria-hidden="true" />
                </form>

                {isSubmitting && (
                    <p className="text-center text-[10px] font-bold text-blue-400 uppercase tracking-[0.1em] animate-pulse">Saving to server...</p>
                )}
            </div>
        );
    });

PersonalInfo.displayName = 'PersonalInfo';

export default PersonalInfo;
