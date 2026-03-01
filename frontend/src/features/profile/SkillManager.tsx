import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import type { TechnicalSkill, SoftSkill, Language, SkillLevel, LanguageProficiency } from '../../types/profile';

interface SkillManagerProps {
    technicalSkills: TechnicalSkill[];
    softSkills: SoftSkill[];
    languages: Language[];
    onAddTechnical: (data: Omit<TechnicalSkill, '_id'>) => Promise<void>;
    onRemoveTechnical: (id: string) => Promise<void>;
    onAddSoft: (data: Omit<SoftSkill, '_id'>) => Promise<void>;
    onRemoveSoft: (id: string) => Promise<void>;
    onAddLanguage: (data: Omit<Language, '_id'>) => Promise<void>;
    onRemoveLanguage: (id: string) => Promise<void>;
}

export const SkillManager: React.FC<SkillManagerProps> = ({
    technicalSkills, softSkills, languages,
    onAddTechnical, onRemoveTechnical,
    onAddSoft, onRemoveSoft,
    onAddLanguage, onRemoveLanguage
}) => {
    const [activeTab, setActiveTab] = useState<'tech' | 'soft' | 'lang'>('tech');

    // Forms
    const [techForm, setTechForm] = useState<Omit<TechnicalSkill, '_id'>>({ name: '', category: 'programming-language', level: 'beginner', yearsOfExp: 0 });
    const [softForm, setSoftForm] = useState<Omit<SoftSkill, '_id'>>({ name: '', level: 'proficient' });
    const [langForm, setLangForm] = useState<Omit<Language, '_id'>>({ name: '', proficiency: 'professional' });

    return (
        <div className="space-y-8">
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('tech')}
                    className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'tech' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Technical Skills
                </button>
                <button
                    onClick={() => setActiveTab('soft')}
                    className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'soft' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Soft Skills
                </button>
                <button
                    onClick={() => setActiveTab('lang')}
                    className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'lang' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                >
                    Languages
                </button>
            </div>

            {activeTab === 'tech' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <form
                        onSubmit={(e) => { e.preventDefault(); onAddTechnical(techForm); setTechForm({ ...techForm, name: '' }); }}
                        className="flex flex-wrap gap-3 items-end p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                        <div className="flex-1 min-w-[200px] space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Skill Name</label>
                            <input
                                type="text"
                                value={techForm.name}
                                onChange={e => setTechForm({ ...techForm, name: e.target.value })}
                                required
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. React"
                            />
                        </div>
                        <div className="w-48 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Category</label>
                            <select
                                value={techForm.category}
                                onChange={e => setTechForm({ ...techForm, category: e.target.value as any })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none"
                            >
                                <option value="programming-language">Prog. Language</option>
                                <option value="framework">Framework</option>
                                <option value="database">Database</option>
                                <option value="cloud">Cloud</option>
                                <option value="tools">Tools</option>
                            </select>
                        </div>
                        <div className="w-32 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Level</label>
                            <select
                                value={techForm.level}
                                onChange={e => setTechForm({ ...techForm, level: e.target.value as SkillLevel })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                                <option value="expert">Expert</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-primary h-10 w-10 flex items-center justify-center p-0 rounded-xl">
                            <Plus size={20} />
                        </button>
                    </form>

                    <div className="flex flex-wrap gap-3">
                        {technicalSkills.map(skill => (
                            <div key={skill._id} className="group flex items-center gap-3 pl-4 pr-2 py-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-200 transition-all">
                                <div className="flex flex-col">
                                    <span className="font-bold text-slate-800 text-sm">{skill.name}</span>
                                    <span className="text-[10px] text-slate-400 uppercase font-medium">{skill.level} • {skill.category.replace(/-/g, ' ')}</span>
                                </div>
                                <button
                                    onClick={() => onRemoveTechnical(skill._id!)}
                                    className="p-1 px-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Similar blocks for Soft Skills and Languages */}
            {activeTab === 'soft' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <form
                        onSubmit={(e) => { e.preventDefault(); onAddSoft(softForm); setSoftForm({ ...softForm, name: '' }); }}
                        className="flex gap-3 items-end p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                        <div className="flex-1 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Soft Skill</label>
                            <input
                                type="text"
                                value={softForm.name}
                                onChange={e => setSoftForm({ ...softForm, name: e.target.value })}
                                required
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Leadership"
                            />
                        </div>
                        <button type="submit" className="btn-primary h-10 w-10 flex items-center justify-center p-0 rounded-xl">
                            <Plus size={20} />
                        </button>
                    </form>
                    <div className="flex flex-wrap gap-3">
                        {softSkills.map(skill => (
                            <div key={skill._id} className="flex items-center gap-3 pl-4 pr-1 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
                                <span className="text-sm font-semibold text-slate-700">{skill.name}</span>
                                <button onClick={() => onRemoveSoft(skill._id!)} className="p-1 text-slate-400 hover:text-red-500"><X size={14} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'lang' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                    <form
                        onSubmit={(e) => { e.preventDefault(); onAddLanguage(langForm); setLangForm({ ...langForm, name: '' }); }}
                        className="flex gap-3 items-end p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                        <div className="flex-1 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Language</label>
                            <input
                                type="text"
                                value={langForm.name}
                                onChange={e => setLangForm({ ...langForm, name: e.target.value })}
                                required
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. German"
                            />
                        </div>
                        <div className="w-48 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Proficiency</label>
                            <select
                                value={langForm.proficiency}
                                onChange={e => setLangForm({ ...langForm, proficiency: e.target.value as LanguageProficiency })}
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none"
                            >
                                <option value="elementary">Elementary</option>
                                <option value="professional">Professional</option>
                                <option value="native">Native</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-primary h-10 w-10 flex items-center justify-center p-0 rounded-xl">
                            <Plus size={20} />
                        </button>
                    </form>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {languages.map(lang => (
                            <div key={lang._id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-xl">
                                <div>
                                    <p className="font-bold text-slate-900">{lang.name}</p>
                                    <p className="text-[10px] text-blue-600 font-bold uppercase">{lang.proficiency.replace(/-/g, ' ')}</p>
                                </div>
                                <button onClick={() => onRemoveLanguage(lang._id!)} className="text-slate-300 hover:text-red-500"><X size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
