import React, { useState } from 'react';
import { Plus, X, Award, Loader2, AlertCircle } from 'lucide-react';
import profileService from '../../../services/profileService';
import type { StudentProfile, TechnicalSkill, SoftSkill } from '../../../types/profile';

interface Props {
    profile: StudentProfile;
    setProfile: (p: StudentProfile) => void;
}

const LEVEL_COLORS: Record<string, string> = {
    beginner: 'bg-slate-100 text-slate-700',
    intermediate: 'bg-blue-100 text-blue-700',
    advanced: 'bg-indigo-100 text-indigo-700',
    expert: 'bg-purple-100 text-purple-700',
    developing: 'bg-slate-100 text-slate-700',
    proficient: 'bg-emerald-100 text-emerald-700',
};

const SkillsTab: React.FC<Props> = ({ profile, setProfile }) => {
    const [techSkill, setTechSkill] = useState({ name: '', category: 'language', level: 'intermediate' });
    const [softSkill, setSoftSkill] = useState({ name: '', level: 'proficient' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddTech = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true); setError(null);
            const technicalSkills = await profileService.addTechnicalSkill(techSkill as any);
            setProfile({ ...profile, technicalSkills });
            setTechSkill({ name: '', category: 'language', level: 'intermediate' });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add tech skill');
        } finally { setLoading(false); }
    };

    const handleRemoveTech = async (id: string) => {
        try {
            const technicalSkills = await profileService.removeTechnicalSkill(id);
            setProfile({ ...profile, technicalSkills });
        } catch (err: any) { setError('Failed to remove skill'); }
    };

    const handleAddSoft = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true); setError(null);
            const softSkills = await profileService.addSoftSkill(softSkill as any);
            setProfile({ ...profile, softSkills });
            setSoftSkill({ name: '', level: 'proficient' });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add soft skill');
        } finally { setLoading(false); }
    };

    const handleRemoveSoft = async (id: string) => {
        try {
            const softSkills = await profileService.removeSoftSkill(id);
            setProfile({ ...profile, softSkills });
        } catch (err: any) { setError('Failed to remove skill'); }
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Technical Skills Section */}
            <section>
                <div className="mb-4">
                    <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        <Award size={20} className="text-blue-500" /> Technical Skills
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">Languages, frameworks, tools, and platforms.</p>
                </div>

                <form onSubmit={handleAddTech} className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 items-end">
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Skill Name</label>
                        <input type="text" required value={techSkill.name} onChange={e => setTechSkill({ ...techSkill, name: e.target.value })} placeholder="e.g. React" className="input-field py-2 text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Category</label>
                        <select value={techSkill.category} onChange={e => setTechSkill({ ...techSkill, category: e.target.value })} className="input-field py-2 text-sm">
                            <option value="language">Language</option>
                            <option value="framework">Framework</option>
                            <option value="database">Database</option>
                            <option value="cloud">Cloud</option>
                            <option value="tool">Tool</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Level</label>
                        <select value={techSkill.level} onChange={e => setTechSkill({ ...techSkill, level: e.target.value })} className="input-field py-2 text-sm">
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">&nbsp;</label>
                        <button type="submit" disabled={loading || !techSkill.name} className="btn-primary w-full py-2 text-sm flex items-center justify-center gap-2">
                            {loading && techSkill.name ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add Skill
                        </button>
                    </div>
                </form>

                <div className="flex flex-wrap gap-2">
                    {profile.technicalSkills?.length === 0 && <p className="text-sm italic text-slate-400">No technical skills added yet.</p>}
                    {profile.technicalSkills?.map((skill) => (
                        <div key={skill._id} className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-xl border border-slate-200 bg-white shadow-sm group">
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-800 leading-tight">{skill.name}</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{skill.category}</span>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-lg ml-2 ${LEVEL_COLORS[skill.level]}`}>
                                {skill.level}
                            </span>
                            <button onClick={() => handleRemoveTech(skill._id!)} className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1 opacity-0 group-hover:opacity-100">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <hr className="border-slate-100" />

            {/* Soft Skills Section */}
            <section>
                <div className="mb-4">
                    <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        <Award size={20} className="text-emerald-500" /> Soft Skills
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">Interpersonal and non-technical proficiencies.</p>
                </div>

                <form onSubmit={handleAddSoft} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-100 items-end">
                    <div className="md:col-span-2 space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Skill Name</label>
                        <input type="text" required value={softSkill.name} onChange={e => setSoftSkill({ ...softSkill, name: e.target.value })} placeholder="e.g. Leadership, Communication" className="input-field py-2 text-sm" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Level</label>
                        <select value={softSkill.level} onChange={e => setSoftSkill({ ...softSkill, level: e.target.value })} className="input-field py-2 text-sm">
                            <option value="developing">Developing</option>
                            <option value="proficient">Proficient</option>
                            <option value="advanced">Advanced</option>
                            <option value="expert">Expert</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">&nbsp;</label>
                        <button type="submit" disabled={loading || !softSkill.name} className="btn-primary w-full py-2 text-sm flex items-center justify-center gap-2">
                            {loading && softSkill.name ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Add Skill
                        </button>
                    </div>
                </form>

                <div className="flex flex-wrap gap-2">
                    {profile.softSkills?.length === 0 && <p className="text-sm italic text-slate-400">No soft skills added yet.</p>}
                    {profile.softSkills?.map((skill) => (
                        <div key={skill._id} className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-xl border border-slate-200 bg-white shadow-sm group">
                            <span className="text-sm font-black text-slate-800">{skill.name}</span>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-lg ml-2 ${LEVEL_COLORS[skill.level]}`}>
                                {skill.level}
                            </span>
                            <button onClick={() => handleRemoveSoft(skill._id!)} className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-1 opacity-0 group-hover:opacity-100">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default SkillsTab;
