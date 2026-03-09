import React, { useState } from 'react';
import { Camera, Save, Loader2, AlertCircle } from 'lucide-react';
import profileService from '../../../services/profileService';
import type { StudentProfile } from '../../../types/profile';

interface Props {
    profile: StudentProfile;
    setProfile: (p: StudentProfile) => void;
}

const EditInfoTab: React.FC<Props> = ({ profile, setProfile }) => {
    const [formData, setFormData] = useState({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
        location: {
            city: profile.location?.city || '',
            country: profile.location?.country || 'Sri Lanka',
            isOpenToRelocation: profile.location?.isOpenToRelocation || false,
        },
        isActivelyLooking: profile.isActivelyLooking || false,
        isPublic: profile.isPublic ?? true,
    });

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            setError(null);
            const { avatarUrl, profile: updatedProfile } = await profileService.uploadAvatar(file);
            setProfile({ ...profile, avatarUrl, ...updatedProfile });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Avatar upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);
            setSuccess(false);
            const updated = await profileService.updateMe(formData);
            setProfile({ ...profile, ...updated });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save profile');
        } finally {
            setLoading(false);
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

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">First Name</label>
                        <input
                            type="text"
                            required
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="input-field"
                            placeholder="John"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Last Name</label>
                        <input
                            type="text"
                            required
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="input-field"
                            placeholder="Doe"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Professional Headline</label>
                    <input
                        type="text"
                        value={formData.headline}
                        onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                        className="input-field"
                        placeholder="e.g. Full Stack Developer | React Enthusiast"
                        maxLength={120}
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">About Me (Bio)</label>
                    <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        className="input-field min-h-[120px] resize-y"
                        placeholder="Write a short summary about yourself to help the AI understand your background and goals..."
                        maxLength={800}
                    />
                    <div className="text-right text-[10px] text-slate-400 font-bold">{formData.bio.length}/800</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">City</label>
                        <input
                            type="text"
                            value={formData.location.city}
                            onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                            className="input-field"
                            placeholder="Colombo"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Country</label>
                        <input
                            type="text"
                            value={formData.location.country}
                            onChange={(e) => setFormData({ ...formData, location: { ...formData.location, country: e.target.value } })}
                            className="input-field"
                            placeholder="Sri Lanka"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-500">Phone</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="input-field"
                            placeholder="+94 7X XXX XXXX"
                        />
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                    {/* Toggles */}
                    <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isActivelyLooking}
                                onChange={(e) => setFormData({ ...formData, isActivelyLooking: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 ring-blue-500"
                            />
                            <span className="text-sm font-bold text-slate-700">Actively looking for work</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isPublic}
                                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                className="w-4 h-4 text-blue-600 rounded border-slate-300 ring-blue-500"
                            />
                            <span className="text-sm font-bold text-slate-700">Public Profile</span>
                        </label>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {success ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditInfoTab;
