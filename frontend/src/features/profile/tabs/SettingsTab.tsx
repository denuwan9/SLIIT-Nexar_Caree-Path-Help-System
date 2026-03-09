import React, { useState } from 'react';
import { Target, Link as LinkIcon, Save, Loader2, AlertCircle } from 'lucide-react';
import profileService from '../../../services/profileService';
import type { StudentProfile } from '../../../types/profile';

interface Props {
    profile: StudentProfile;
    setProfile: (p: StudentProfile) => void;
}

const SettingsTab: React.FC<Props> = ({ profile, setProfile }) => {
    const [loadingGoals, setLoadingGoals] = useState(false);
    const [loadingSocial, setLoadingSocial] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [goalsForm, setGoalsForm] = useState({
        targetRoles: profile.careerGoals?.targetRoles?.join(', ') || '',
        preferredIndustries: profile.careerGoals?.preferredIndustries?.join(', ') || '',
        careerObjective: profile.careerGoals?.careerObjective || '',
    });

    const [socialForm, setSocialForm] = useState({
        linkedin: profile.socialLinks?.linkedin || '',
        github: profile.socialLinks?.github || '',
        portfolio: profile.socialLinks?.portfolio || '',
        twitter: profile.socialLinks?.twitter || '',
        stackoverflow: profile.socialLinks?.stackoverflow || '',
    });

    const handleSaveGoals = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoadingGoals(true); setError(null);
            const goals = {
                targetRoles: goalsForm.targetRoles.split(',').map(s => s.trim()).filter(Boolean),
                preferredIndustries: goalsForm.preferredIndustries.split(',').map(s => s.trim()).filter(Boolean),
                careerObjective: goalsForm.careerObjective.trim()
            };
            const updated = await profileService.updateCareerGoals(goals);
            setProfile({ ...profile, careerGoals: updated });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save goals');
        } finally { setLoadingGoals(false); }
    };

    const handleSaveSocial = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoadingSocial(true); setError(null);
            const updated = await profileService.updateSocialLinks(socialForm);
            setProfile({ ...profile, socialLinks: updated });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save social links');
        } finally { setLoadingSocial(false); }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Career Goals */}
            <section>
                <div className="mb-6">
                    <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        <Target size={20} className="text-blue-500" /> Career Goals & Aspirations
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">Tell the AI what roles you are aiming for.</p>
                </div>

                <form onSubmit={handleSaveGoals} className="space-y-5 p-6 rounded-3xl border border-slate-200 bg-slate-50/50">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Roles (Comma separated)</label>
                        <input type="text" value={goalsForm.targetRoles} onChange={e => setGoalsForm({ ...goalsForm, targetRoles: e.target.value })} placeholder="e.g. Frontend Developer, Full Stack Engineer" className="input-field bg-white py-2" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Preferred Industries (Comma separated)</label>
                        <input type="text" value={goalsForm.preferredIndustries} onChange={e => setGoalsForm({ ...goalsForm, preferredIndustries: e.target.value })} placeholder="e.g. Fintech, Healthcare, EdTech" className="input-field bg-white py-2" />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Career Objective Summary</label>
                        <textarea value={goalsForm.careerObjective} onChange={e => setGoalsForm({ ...goalsForm, careerObjective: e.target.value })} placeholder="What are you ultimately looking to achieve in your career?" className="input-field bg-white min-h-[100px] resize-y py-2" maxLength={600} />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={loadingGoals} className="btn-primary py-2 px-6 shadow-sm flex items-center gap-2">
                            {loadingGoals ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Goals
                        </button>
                    </div>
                </form>
            </section>

            {/* Social Links */}
            <section>
                <div className="mb-6">
                    <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        <LinkIcon size={20} className="text-slate-700" /> Social & Portfolios
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">Links to your professional presence.</p>
                </div>

                <form onSubmit={handleSaveSocial} className="space-y-5 p-6 rounded-3xl border border-slate-200 bg-slate-50/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">LinkedIn URL</label>
                            <input type="url" value={socialForm.linkedin} onChange={e => setSocialForm({ ...socialForm, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." className="input-field bg-white py-2" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">GitHub Profile</label>
                            <input type="url" value={socialForm.github} onChange={e => setSocialForm({ ...socialForm, github: e.target.value })} placeholder="https://github.com/..." className="input-field bg-white py-2" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Personal Portfolio</label>
                            <input type="url" value={socialForm.portfolio} onChange={e => setSocialForm({ ...socialForm, portfolio: e.target.value })} placeholder="https://yourname.com" className="input-field bg-white py-2" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">StackOverflow</label>
                            <input type="url" value={socialForm.stackoverflow} onChange={e => setSocialForm({ ...socialForm, stackoverflow: e.target.value })} placeholder="https://stackoverflow.com/users/..." className="input-field bg-white py-2" />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={loadingSocial} className="btn-primary flex py-2 px-6 shadow-sm items-center gap-2 bg-slate-800 hover:bg-slate-900 ring-slate-800">
                            {loadingSocial ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Links
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default SettingsTab;
