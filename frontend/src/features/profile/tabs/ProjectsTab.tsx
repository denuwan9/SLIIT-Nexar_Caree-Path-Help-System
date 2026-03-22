import React, { useState } from 'react';
import { Plus, X, Globe, Github, Code2, Loader2, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import profileService from '../../../services/profileService';
import type { StudentProfile } from '../../../types/profile';
import { projectSchema, type ProjectInput } from '../profileSchemas';
import toast from 'react-hot-toast';

interface Props {
    profile: StudentProfile;
    setProfile: (p: StudentProfile) => void;
}

const ProjectsTab: React.FC<Props> = ({ profile, setProfile }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [techInput, setTechInput] = useState('');

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ProjectInput>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: '',
            description: '',
            liveUrl: '',
            githubUrl: '',
            techStack: [],
            impact: '',
        },
    });

    const techStack = watch('techStack');

    const onSubmit = async (data: ProjectInput) => {
        try {
            setLoading(true);
            setError(null);
            
            const projects = await profileService.addProject(data as any);
            setProfile({ ...profile, projects });
            reset();
            setIsAdding(false);
            toast.success('Project added successfully');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add project');
            toast.error('Failed to add project');
        } finally {
            setLoading(false);
        }
    };

    const addTech = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && techInput.trim()) {
            e.preventDefault();
            if (!techStack.includes(techInput.trim())) {
                setValue('techStack', [...techStack, techInput.trim()], { shouldValidate: true });
            }
            setTechInput('');
        }
    };

    const removeTech = (tech: string) => {
        setValue('techStack', techStack.filter(t => t !== tech), { shouldValidate: true });
    };

    const handleRemove = async (id: string) => {
        if (!confirm('Remove this project?')) return;
        try {
            const projects = await profileService.removeProject(id);
            setProfile({ ...profile, projects });
            toast.success('Project removed');
        } catch (err: any) { 
            setError('Failed to remove project'); 
            toast.error('Failed to remove project');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                        <Code2 size={20} className="text-rose-500" /> Key Projects
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">Showcase your best engineering work.</p>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="btn-primary py-2 px-4 shadow-sm text-sm flex items-center gap-2 bg-rose-600 hover:bg-rose-700 ring-rose-500">
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
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 rounded-3xl bg-slate-50 border border-slate-200 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-black text-slate-900">Project Details</h3>
                        <button type="button" onClick={() => { setIsAdding(false); reset(); }} className="p-1 text-slate-400 hover:text-slate-900 transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Project Title</label>
                            <input 
                                type="text" 
                                {...register('title')} 
                                placeholder="E-commerce Platform" 
                                className={`input-field py-2 ${errors.title ? 'border-red-500' : ''}`} 
                            />
                            {errors.title && <p className="text-[10px] font-bold text-red-500">{errors.title.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Description</label>
                            <textarea 
                                {...register('description')} 
                                placeholder="Detailed description of the project, architecture, and your contributions..." 
                                className={`input-field min-h-[120px] resize-y py-2 ${errors.description ? 'border-red-500' : ''}`} 
                            />
                            {errors.description && <p className="text-[10px] font-bold text-red-500">{errors.description.message}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live URL (Optional)</label>
                                <div className="relative">
                                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="url" 
                                        {...register('liveUrl')} 
                                        placeholder="https://project.com" 
                                        className={`input-field py-2 pl-9 ${errors.liveUrl ? 'border-red-500 bg-red-50' : ''}`} 
                                    />
                                </div>
                                {errors.liveUrl && <p className="text-[10px] font-bold text-red-500">{errors.liveUrl.message}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">GitHub URL (Optional)</label>
                                <div className="relative">
                                    <Github size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input 
                                        type="url" 
                                        {...register('githubUrl')} 
                                        placeholder="https://github.com/user/repo" 
                                        className={`input-field py-2 pl-9 ${errors.githubUrl ? 'border-red-500 bg-red-50' : ''}`} 
                                    />
                                </div>
                                {errors.githubUrl && <p className="text-[10px] font-bold text-red-500">{errors.githubUrl.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Technologies</label>
                            <div className={`input-field p-2 min-h-[42px] flex flex-wrap gap-2 ${errors.techStack ? 'border-red-500 bg-red-50' : ''}`}>
                                {techStack.map(tech => (
                                    <span key={tech} className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-600 text-[10px] font-black flex items-center gap-1">
                                        {tech}
                                        <X size={10} className="cursor-pointer hover:text-rose-800" onClick={() => removeTech(tech)} />
                                    </span>
                                ))}
                                <input 
                                    type="text" 
                                    value={techInput} 
                                    onChange={e => setTechInput(e.target.value)} 
                                    onKeyDown={addTech} 
                                    placeholder={techStack.length === 0 ? "Add tech (hit enter)" : ""} 
                                    className="bg-transparent border-none outline-none text-sm flex-1 min-w-[120px]" 
                                />
                            </div>
                            {errors.techStack && <p className="text-[10px] font-bold text-red-500">{errors.techStack.message}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Impact / Results (Optional)</label>
                            <input 
                                type="text" 
                                {...register('impact')} 
                                placeholder="e.g. Optimized performance by 30%, 500+ daily active users..." 
                                className={`input-field py-2 ${errors.impact ? 'border-red-500' : ''}`} 
                            />
                            {errors.impact && <p className="text-[10px] font-bold text-red-50">{errors.impact.message}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-8">
                        <button type="button" onClick={() => { setIsAdding(false); reset(); }} className="btn-secondary py-2">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary py-2 w-40 flex justify-center bg-rose-600 hover:bg-rose-700 ring-rose-500">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Project'}
                        </button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                {profile.projects?.length === 0 ? (
                    <div className="p-12 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center bg-slate-50 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center mb-4">
                            <Code2 size={32} className="text-slate-300" />
                        </div>
                        <h3 className="text-lg font-black text-slate-900">No projects added yet</h3>
                        <p className="text-sm font-bold text-slate-500 mt-1 max-w-xs">Showcase your coding skills by adding your best projects.</p>
                    </div>
                ) : (
                    profile.projects?.map((item) => (
                        <div key={item._id} className="group relative p-6 rounded-[2rem] bg-white border border-slate-200 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-500">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 group-hover:text-rose-600 transition-colors">{item.title}</h3>
                                </div>
                                <button
                                    onClick={() => handleRemove(item._id!)}
                                    className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <p className="text-sm text-slate-600 font-medium leading-relaxed mb-5">
                                {item.description}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {item.techStack?.map((tech) => (
                                    <span key={tech} className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-black text-slate-600 group-hover:bg-rose-50 group-hover:border-rose-100 group-hover:text-rose-600 transition-colors">
                                        {tech}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                                {item.githubUrl && (
                                    <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-rose-600 transition-colors">
                                        <Github size={14} /> GitHub Repo
                                    </a>
                                )}
                                {item.liveUrl && (
                                    <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-black text-slate-600 hover:text-rose-600 transition-colors">
                                        <Globe size={14} /> Live Demo
                                    </a>
                                )}
                                {item.impact && (
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full ml-auto">
                                        Impact: {item.impact}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ProjectsTab;
