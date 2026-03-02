import React, { useState } from 'react';
import { Plus, X, Cpu, Heart, Globe, Award, Sparkles, Languages } from 'lucide-react';
import { useForm } from 'react-hook-form';
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

    // Technical Skills Form
    const techForm = useForm<Omit<TechnicalSkill, '_id'>>({
        defaultValues: { name: '', category: 'programming-language', level: 'beginner', yearsOfExp: 0 }
    });

    // Soft Skills Form
    const softForm = useForm<Omit<SoftSkill, '_id'>>({
        defaultValues: { name: '', level: 'proficient' }
    });

    // Languages Form
    const langForm = useForm<Omit<Language, '_id'>>({
        defaultValues: { name: '', proficiency: 'professional' }
    });

    const onTechSubmit = async (data: Omit<TechnicalSkill, '_id'>) => {
        await onAddTechnical(data);
        techForm.reset();
    };

    const onSoftSubmit = async (data: Omit<SoftSkill, '_id'>) => {
        await onAddSoft(data);
        softForm.reset();
    };

    const onLangSubmit = async (data: Omit<Language, '_id'>) => {
        await onAddLanguage(data);
        langForm.reset();
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Tab Navigation */}
            <div className="flex bg-slate-100/50 p-2 rounded-[24px] gap-2">
                {[
                    { id: 'tech', label: 'Technical Hard Skills', icon: Cpu },
                    { id: 'soft', label: 'Professional Soft Skills', icon: Sparkles },
                    { id: 'lang', label: 'Languages', icon: Languages },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-xl shadow-blue-100/50 scale-[1.02]'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                            }`}
                    >
                        <tab.icon size={18} />
                        <span className="hidden md:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Technical Skills Tab */}
            {activeTab === 'tech' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <form onSubmit={techForm.handleSubmit(onTechSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="md:col-span-1 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Skill Name</label>
                            <input
                                {...techForm.register('name', { required: true })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                placeholder="e.g. TypeScript"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                            <select
                                {...techForm.register('category')}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold appearance-none"
                            >
                                <option value="programming-language">Prog. Language</option>
                                <option value="framework">Framework</option>
                                <option value="database">Database</option>
                                <option value="cloud">Cloud</option>
                                <option value="tools">Tools</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expertise</label>
                            <select
                                {...techForm.register('level')}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold appearance-none"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                                <option value="expert">Expert</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-primary py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px]">
                            <Plus size={16} /> Add Skill
                        </button>
                    </form>

                    <div className="flex flex-wrap gap-4">
                        {technicalSkills.map(skill => (
                            <div key={skill._id} className="group flex items-center gap-4 pl-5 pr-2 py-3 bg-white border border-slate-100 rounded-[20px] shadow-sm hover:border-blue-200 hover:shadow-lg transition-all">
                                <div className="flex flex-col">
                                    <span className="font-black text-slate-900 text-sm tracking-tight">{skill.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-blue-600 font-black uppercase tracking-tighter">{skill.level}</span>
                                        <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{skill.category.replace(/-/g, ' ')}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onRemoveTechnical(skill._id!)}
                                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Soft Skills Tab */}
            {activeTab === 'soft' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <form onSubmit={softForm.handleSubmit(onSoftSubmit)} className="flex flex-col md:flex-row gap-4 items-end bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="flex-1 space-y-1.5 w-full">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Soft Skill</label>
                            <input
                                {...softForm.register('name', { required: true })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                placeholder="e.g. Critical Thinking"
                            />
                        </div>
                        <button type="submit" className="btn-primary py-3 px-10 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px]">
                            <Plus size={16} /> Add Skill
                        </button>
                    </form>
                    <div className="flex flex-wrap gap-4">
                        {softSkills.map(skill => (
                            <div key={skill._id} className="group flex items-center gap-4 px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-full hover:bg-white hover:border-blue-200 transition-all">
                                <Heart size={16} className="text-pink-500" />
                                <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{skill.name}</span>
                                <button onClick={() => onRemoveSoft(skill._id!)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Languages Tab */}
            {activeTab === 'lang' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <form onSubmit={langForm.handleSubmit(onLangSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
                        <div className="space-y-1.5 w-full">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Language</label>
                            <input
                                {...langForm.register('name', { required: true })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                                placeholder="e.g. Japanese"
                            />
                        </div>
                        <div className="space-y-1.5 w-full">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Proficiency</label>
                            <select
                                {...langForm.register('proficiency')}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold appearance-none"
                            >
                                <option value="elementary">Elementary</option>
                                <option value="professional">Professional</option>
                                <option value="native">Native</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-primary py-3 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px]">
                            <Plus size={16} /> Add Language
                        </button>
                    </form>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {languages.map(lang => (
                            <div key={lang._id} className="flex justify-between items-center p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm hover:shadow-xl transition-all group">
                                <div className="flex gap-4 items-center">
                                    <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                        <Languages size={20} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 tracking-tight">{lang.name}</p>
                                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">{lang.proficiency}</p>
                                    </div>
                                </div>
                                <button onClick={() => onRemoveLanguage(lang._id!)} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
