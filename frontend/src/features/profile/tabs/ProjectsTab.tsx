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
                    <h2 className="text-2xl font-black tracking-tight text-[#0F172A] flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center text-white">
                            <Code2 size={20} />
                        </div> 
                        Key Projects
                    </h2>
                    <p className="text-[13px] font-bold text-[#64748B] mt-1 ml-13">Showcase your engineering prowess through concrete work.</p>
                </div>
                {!isAdding && (
                    <button onClick={() => setIsAdding(true)} className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-black text-[13px] shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all flex items-center gap-2">
                        <Plus size={18} /> Add Project
                    </button>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-3 p-5 rounded-3xl bg-rose-50 text-rose-600 border border-rose-100 text-[13px] font-bold">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            {isAdding && (
                <form onSubmit={handleSubmit(onSubmit)} className="p-8 rounded-[2.5rem] bg-slate-50/50 border border-slate-200/60 animate-in slide-in-from-top-4 duration-500 shadow-inner">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Project Details</h3>
                        <button type="button" onClick={() => { setIsAdding(false); reset(); }} className="p-2 text-[#94A3B8] hover:text-[#0F172A] hover:bg-white rounded-xl transition-all">
                            <X size={24} />
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

            <div className="space-y-6">
                {profile.projects?.length === 0 && !isAdding && (
                    <div className="text-center py-20 px-8 rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-slate-50/50 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center text-[#94A3B8] mb-6 group-hover:scale-110 transition-transform">
                                <Code2 size={32} />
                            </div>
                            <h3 className="text-xl font-black text-[#0F172A] tracking-tight">Showcase Your Work</h3>
                            <p className="text-sm font-medium text-[#64748B] mt-2 max-w-sm mx-auto leading-relaxed">
                                Projects are the best way to prove your technical skills to the NEXAR AI and potential recruiters. Add your GitHub repos or live demos.
                            </p>
                            <button onClick={() => setIsAdding(true)} className="mt-8 px-8 py-3.5 bg-rose-600 text-white rounded-2xl font-black text-[13px] shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all">
                                Add First Project
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-[100px] opacity-30 -z-0"></div>
                    </div>
                )}

                {profile.projects?.map((item) => (
                    <div key={item._id} className="group relative p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-rose-200 hover:shadow-xl hover:shadow-rose-100/30 transition-all duration-500">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500">
                                    <Code2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[#0F172A] tracking-tight group-hover:text-rose-600 transition-colors leading-tight">{item.title}</h3>
                                    {item.impact && (
                                        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-100/50 w-fit">
                                            {item.impact}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => handleRemove(item._id!)}
                                className="p-2.5 rounded-2xl bg-slate-50 text-[#94A3B8] hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <p className="text-[14px] font-medium text-[#64748B] leading-relaxed mb-6 pl-4 border-l-2 border-slate-50 group-hover:border-rose-200 transition-colors">
                            {item.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {item.techStack?.map((tech) => (
                                <span key={tech} className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100/50 text-[11px] font-black text-[#64748B] group-hover:bg-rose-50 group-hover:border-rose-100 group-hover:text-rose-600 transition-all">
                                    {tech}
                                </span>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-50/80">
                            {item.githubUrl && (
                                <a href={item.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[12px] font-black text-[#0F172A] hover:text-rose-600 transition-colors group/link">
                                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover/link:bg-rose-50">
                                        <Github size={16} />
                                    </div>
                                    Browse Source
                                </a>
                            )}
                            {item.liveUrl && (
                                <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[12px] font-black text-[#0F172A] hover:text-rose-600 transition-colors group/link">
                                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center group-hover/link:bg-rose-50">
                                        <Globe size={16} />
                                    </div>
                                    Live Demonstration
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
