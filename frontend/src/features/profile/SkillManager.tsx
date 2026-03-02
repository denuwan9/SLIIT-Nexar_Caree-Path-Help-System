import React, { useState } from 'react';
import { Plus, X, Cpu, Heart, Sparkles, Languages, Terminal, Layers, Cloud, Command, Globe } from 'lucide-react';
import { useForm } from 'react-hook-form';
import type { TechnicalSkill, SoftSkill, Language } from '../../types/profile';

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

    const techForm = useForm<Omit<TechnicalSkill, '_id'>>({
        defaultValues: { name: '', category: 'programming-language', level: 'beginner', yearsOfExp: 0 }
    });

    const softForm = useForm<Omit<SoftSkill, '_id'>>({
        defaultValues: { name: '', level: 'proficient' }
    });

    const langForm = useForm<Omit<Language, '_id'>>({
        defaultValues: { language: '', proficiency: 'professional' }
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

    const getTechIcon = (category: string) => {
        switch (category) {
            case 'programming-language': return <Terminal size={14} />;
            case 'framework': return <Layers size={14} />;
            case 'cloud': return <Cloud size={14} />;
            case 'tools': return <Command size={14} />;
            default: return <Cpu size={14} />;
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Header / Tab Navigation */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between pb-8 border-b border-slate-50">
                <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Skills & Expertise</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 italic-none">Your competitive technical index</p>
                </div>
                <div className="flex bg-slate-100/50 p-1.5 rounded-[24px] gap-1 shadow-inner border border-slate-100">
                    {[
                        { id: 'tech', label: 'Hard Skills', icon: Cpu },
                        { id: 'soft', label: 'Soft Skills', icon: Sparkles },
                        { id: 'lang', label: 'Languages', icon: Languages },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2.5 py-3 px-6 rounded-[20px] text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === tab.id
                                ? 'bg-white text-blue-600 shadow-xl shadow-blue-500/10'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
                                }`}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Technical Skills Tab */}
            {activeTab === 'tech' && (
                <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-500">
                    <form onSubmit={techForm.handleSubmit(onTechSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-8 bg-white p-10 rounded-[40px] border-2 border-blue-50 shadow-2xl shadow-blue-500/5">
                        <div className="md:col-span-1 space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Skill Identifier</label>
                            <input
                                {...techForm.register('name', { required: true })}
                                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 outline-none font-bold text-slate-700"
                                placeholder="e.g. Docker"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                            <select
                                {...techForm.register('category')}
                                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 outline-none font-bold text-slate-700 appearance-none"
                            >
                                <option value="programming-language">Prog. Language</option>
                                <option value="framework">Framework</option>
                                <option value="database">Database</option>
                                <option value="cloud">Cloud / DevOps</option>
                                <option value="tools">Utility Tools</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mastery</label>
                            <select
                                {...techForm.register('level')}
                                className="w-full px-5 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-blue-500/50 outline-none font-bold text-slate-700 appearance-none"
                            >
                                <option value="beginner">Beginner</option>
                                <option value="intermediate">Intermediate</option>
                                <option value="advanced">Advanced</option>
                                <option value="expert">Expert</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full btn-primary py-4 rounded-[20px] flex items-center justify-center gap-3 bg-gradient-to-r from-blue-700 to-blue-600 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">
                            <Plus size={18} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Inject Skill</span>
                        </button>
                    </form>

                    <div className="flex flex-wrap gap-5">
                        {technicalSkills.map(skill => (
                            <div key={skill._id} className="group flex items-center gap-6 pl-6 pr-3 py-4 bg-white border border-slate-100 rounded-[30px] shadow-sm hover:shadow-2xl hover:translate-y-[-4px] transition-all duration-300">
                                <div className="h-10 w-10 flex items-center justify-center bg-slate-50 rounded-2xl text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 italic">
                                    {getTechIcon(skill.category)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-slate-800 text-sm tracking-tight">{skill.name}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] text-blue-600 font-black uppercase tracking-widest">{skill.level}</span>
                                        <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{skill.category.replace(/-/g, ' ')}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onRemoveTechnical(skill._id!)}
                                    className="p-3 text-slate-100 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all group-hover:opacity-100 md:opacity-0"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Soft Skills Tab */}
            {activeTab === 'soft' && (
                <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-500">
                    <form onSubmit={softForm.handleSubmit(onSoftSubmit)} className="flex flex-col md:flex-row gap-6 items-end bg-white p-10 rounded-[40px] border-2 border-pink-50 shadow-2xl shadow-pink-500/5">
                        <div className="flex-1 space-y-2 w-full">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Behavioral / Leadership Skill</label>
                            <div className="relative group">
                                <Heart size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-pink-500 transition-colors" />
                                <input
                                    {...softForm.register('name', { required: true })}
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-pink-500/50 outline-none font-bold text-slate-700 transition-all"
                                    placeholder="e.g. Emotional Intelligence"
                                />
                            </div>
                        </div>
                        <button type="submit" className="px-12 btn-primary py-4 rounded-[20px] flex items-center justify-center gap-3 bg-gradient-to-r from-pink-600 to-pink-500 shadow-lg shadow-pink-500/20 active:scale-95 transition-all text-white h-[60px]">
                            <Plus size={18} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Add Trait</span>
                        </button>
                    </form>
                    <div className="flex flex-wrap gap-5">
                        {softSkills.map(skill => (
                            <div key={skill._id} className="group flex items-center gap-5 pl-8 pr-4 py-5 bg-white border border-slate-100 rounded-full shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-500 group">
                                <Heart size={18} className="text-pink-100 fill-pink-50 group-hover:text-pink-500 group-hover:fill-pink-500 transition-all duration-700" />
                                <span className="text-xs font-black text-slate-700 uppercase tracking-widest">{skill.name}</span>
                                <button onClick={() => onRemoveSoft(skill._id!)} className="p-2 text-slate-100 hover:text-red-500 transition-all group-hover:opacity-100 md:opacity-0 ml-4">
                                    <X size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Languages Tab */}
            {activeTab === 'lang' && (
                <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-500">
                    <form onSubmit={langForm.handleSubmit(onLangSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-white p-10 rounded-[40px] border-2 border-emerald-50 shadow-2xl shadow-emerald-500/5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Global Language</label>
                            <div className="relative group">
                                <Globe size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    {...langForm.register('language', { required: true })}
                                    className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-emerald-500/50 outline-none font-bold text-slate-700 transition-all"
                                    placeholder="e.g. German"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fluency Level</label>
                            <select
                                {...langForm.register('proficiency')}
                                className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:bg-white focus:border-emerald-500/50 outline-none font-bold text-slate-700 appearance-none transition-all"
                            >
                                <option value="elementary">Elementary / Basic</option>
                                <option value="professional">Professional / Working</option>
                                <option value="fluent">Fluent / Advanced</option>
                                <option value="native">Native / Billingual</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full btn-primary py-4 rounded-[20px] flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all h-[60px] self-end">
                            <Plus size={18} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Link Language</span>
                        </button>
                    </form>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {languages.map(lang => (
                            <div key={lang._id} className="group flex justify-between items-center p-8 bg-white border border-slate-100 rounded-[35px] shadow-sm hover:shadow-2xl transition-all duration-500 hover:translate-y-[-6px]">
                                <div className="flex gap-6 items-center">
                                    <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 italic rotate-3 group-hover:rotate-0">
                                        <Languages size={24} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800 tracking-tight text-lg">{lang.language}</p>
                                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-[0.2em] mt-0.5">{lang.proficiency}</p>
                                    </div>
                                </div>
                                <button onClick={() => onRemoveLanguage(lang._id!)} className="p-3 text-slate-100 hover:text-red-500 transition-all group-hover:opacity-100 md:opacity-0">
                                    <X size={24} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillManager;
