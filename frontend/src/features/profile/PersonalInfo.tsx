import React, { useState, useRef } from 'react';
import { Camera, Mail, Phone, MapPin, Globe } from 'lucide-react';
import type { StudentProfile } from '../../types/profile';

interface PersonalInfoProps {
    profile: StudentProfile;
    onUpdate: (data: any) => Promise<void>;
    onAvatarUpload: (file: File) => Promise<void>;
}

export const PersonalInfo: React.FC<PersonalInfoProps> = ({ profile, onUpdate, onAvatarUpload }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: profile.firstName,
        lastName: profile.lastName,
        headline: profile.headline || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: {
            city: profile.location?.city || '',
            country: profile.location?.country || '',
            isOpenToRelocation: profile.location?.isOpenToRelocation || false,
        },
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData((prev: any) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleToggleRelocation = () => {
        setFormData((prev) => ({
            ...prev,
            location: {
                ...prev.location,
                isOpenToRelocation: !prev.location.isOpenToRelocation,
            },
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onUpdate(formData);
        setIsEditing(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await onAvatarUpload(file);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar Section */}
                <div className="relative group">
                    <div className="h-32 w-32 rounded-3xl bg-slate-100 border-2 border-slate-200 overflow-hidden relative">
                        {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-300">
                                <Camera size={40} />
                            </div>
                        )}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                        >
                            <Camera size={24} />
                        </button>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                    />
                    <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full border-2 border-white uppercase tracking-wider">
                        {profile.profileCompleteness}% Complete
                    </div>
                </div>

                {/* Basic Info Display/Form */}
                <div className="flex-1 space-y-4">
                    {!isEditing ? (
                        <>
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900">{profile.firstName} {profile.lastName}</h3>
                                <p className="text-blue-600 font-medium">{profile.headline || 'Add a professional headline'}</p>
                            </div>
                            <p className="text-slate-600 leading-relaxed max-w-2xl italic">
                                {profile.bio || 'Write a short bio about yourself...'}
                            </p>
                            <div className="flex flex-wrap gap-4 pt-2">
                                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <Mail size={16} /> {profile.user && typeof profile.user !== 'string' ? profile.user.email : 'N/A'}
                                </div>
                                {profile.phone && (
                                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                        <Phone size={16} /> {profile.phone}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <MapPin size={16} /> {profile.location?.city || 'City'}, {profile.location?.country || 'Country'}
                                </div>
                                {profile.location?.isOpenToRelocation && (
                                    <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 font-medium">
                                        <Globe size={16} /> Open to relocation
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn-secondary py-2 px-6 mt-4"
                            >
                                Edit Profile
                            </button>
                        </>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Headline</label>
                                <input
                                    type="text"
                                    name="headline"
                                    placeholder="e.g. Final Year IT Student | Aspiring Web Developer"
                                    value={formData.headline}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-bold text-slate-700">Bio</label>
                                <textarea
                                    name="bio"
                                    rows={4}
                                    placeholder="Tell us about yourself..."
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">City</label>
                                    <input
                                        type="text"
                                        name="location.city"
                                        value={formData.location.city}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700">Country</label>
                                    <input
                                        type="text"
                                        name="location.country"
                                        value={formData.location.country}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 py-2">
                                <button
                                    type="button"
                                    onClick={handleToggleRelocation}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.location.isOpenToRelocation ? 'bg-blue-600' : 'bg-slate-200'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.location.isOpenToRelocation ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm font-medium text-slate-700">Open to relocation</span>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <button type="submit" className="btn-primary py-2 px-8">Save Changes</button>
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
            </div>
        </div>
    );
};
