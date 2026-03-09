import React, { useState } from 'react';
import { Plus, X, Code, Github, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import profileService from '../../../services/profileService';
import type { StudentProfile, Project } from '../../../types/profile';

interface Props {
    profile: StudentProfile;
    setProfile: (p: StudentProfile) => void;
}

const ProjectsTab: React.FC<Props> = ({ profile, setProfile }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initialForm: Omit<Project, '_id'> = {
        title: '', description: '', techStack: [],
        githubUrl: '', liveUrl: '', impact: ''
    };
    const [formData, setFormData] = useState<Omit<Project, '_id'>>(initialForm);
    const [techInput, setTechInput] = useState('');

    const addTech = () => {
        if (!techInput.trim()) return;
        setFormData(prev => ({
            ...prev,
            techStack: [...(prev.techStack || []), techInput.trim()]
        }));
        setTechInput('');
    };

    const removeTech = (index: number) => {
        setFormData(prev => ({
            ...prev,
            techStack: prev.techStack?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true); setError(null);
            const projects = await profileService.addProject(formData);
            setProfile({ ...profile, projects });
            setFormData(initialForm);
            setIsAdding(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add project');
        } finally { setLoading(false); }
    };

    const handleRemove = async (id: string) => {
        if (!confirm('Remove this project?')) return;
        try {
            const projects = await profileService.removeProject(id);
            setProfile({ ...profile, projects });
        } catch (err: any) { setError('Failed to remove project'); }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        <Code size={20} className="text-pink-500" /> Projects Portfolio
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">Showcase your best work and side projects.</p>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="btn-primary py-2 px-4 shadow-sm text-sm flex items-center gap-2 bg-pink-600 hover:bg-pink-700 ring-pink-500">
                        <Plus size={16} /> Add Project
                    </button>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm font-bold">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {isAdding && (
                <form onSubmit={handleSubmit} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-slate-900">Add New Project</h3>
                        <button type="button" onClick={() => setIsAdding(false)} className="p-1 text-slate-400 hover:text-slate-900 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-1.5 mb-5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Project Title</label>
                        <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Nexar Career AI" className="input-field py-2" />
                    </div>

                    <div className="space-y-1.5 mb-5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tech Stack</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={techInput}
                                onChange={e => setTechInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                                placeholder="e.g. React"
                                className="input-field py-2 flex-1"
                            />
                            <button type="button" onClick={addTech} className="btn-secondary px-4 py-2 text-xs">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                            {formData.techStack?.map((tech, i) => (
                                <span key={i} className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-lg bg-white border border-slate-200 text-xs font-black text-slate-700">
                                    {tech}
                                    <button type="button" onClick={() => removeTech(i)} className="text-slate-400 hover:text-red-500 p-0.5"><X size={12} /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-1.5 mb-5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description</label>
                        <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="What did you build and why?" className="input-field min-h-[80px] py-2 resize-y" maxLength={600} />
                    </div>

                    <div className="space-y-1.5 mb-5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Impact / Results (Optional)</label>
                        <input type="text" value={formData.impact} onChange={e => setFormData({ ...formData, impact: e.target.value })} placeholder="e.g. Reduced load time by 40%, 100+ active users" className="input-field py-2" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">GitHub URL</label>
                            <div className="relative">
                                <Github size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="url" value={formData.githubUrl} onChange={e => setFormData({ ...formData, githubUrl: e.target.value })} placeholder="https://github.com/..." className="input-field py-2 pl-9" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Live URL</label>
                            <div className="relative">
                                <ExternalLink size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="url" value={formData.liveUrl} onChange={e => setFormData({ ...formData, liveUrl: e.target.value })} placeholder="https://..." className="input-field py-2 pl-9" />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary py-2">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary py-2 w-32 flex justify-center bg-pink-600 hover:bg-pink-700 ring-pink-500">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Project'}
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.projects?.length === 0 && !isAdding && (
                    <div className="col-span-1 md:col-span-2 text-center py-12 px-4 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50">
                        <Code size={32} className="mx-auto text-slate-300 mb-3" />
                        <h3 className="text-sm font-black text-slate-600">No projects added</h3>
                        <p className="text-xs font-bold text-slate-400 mt-1 max-w-sm mx-auto">Projects are the best way to prove your skills to the AI matching engine.</p>
                        <button onClick={() => setIsAdding(true)} className="btn-secondary mt-4 py-2 px-4 text-xs">Add Project</button>
                    </div>
                )}

                {([...profile.projects || []]).sort((a, b) => b._id!.localeCompare(a._id!)).map(project => (
                    <div key={project._id} className="group relative flex flex-col p-6 rounded-3xl border border-slate-200 bg-white hover:border-pink-300 hover:shadow-xl hover:shadow-pink-500/10 transition-all">
                        <button onClick={() => handleRemove(project._id!)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                            <X size={16} />
                        </button>

                        <h3 className="text-lg font-black text-slate-900 leading-tight pr-8 mb-2">{project.title}</h3>

                        <p className="text-sm font-medium text-slate-600 flex-1 whitespace-pre-wrap leading-relaxed">
                            {project.description}
                        </p>

                        {project.impact && (
                            <div className="mt-4 p-3 rounded-xl bg-pink-50/50 border border-pink-100/50">
                                <p className="text-[10px] font-black uppercase tracking-widest text-pink-500 mb-1">Impact</p>
                                <p className="text-xs font-bold text-slate-700">{project.impact}</p>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-1.5 mt-5 mb-5">
                            {project.techStack?.map((t, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    {t}
                                </span>
                            ))}
                        </div>

                        <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                            {project.githubUrl && (
                                <a href={project.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-lg">
                                    <Github size={14} /> Source
                                </a>
                            )}
                            {project.liveUrl && (
                                <a href={project.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg">
                                    <ExternalLink size={14} /> Live Demo
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectsTab;
