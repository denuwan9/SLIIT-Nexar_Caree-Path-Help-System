import React, { useState } from 'react';
import { Plus, Trash, Globe, Github, Info } from 'lucide-react';
import type { Project } from '../../types/profile';
import { useForm } from 'react-hook-form';

interface ProjectListProps {
    projects: Project[];
    onAdd: (data: Omit<Project, '_id'>) => Promise<void>;
    onRemove: (id: string) => Promise<void>;
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects, onAdd, onRemove }) => {
    const [showAddForm, setShowAddForm] = useState(false);
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Omit<Project, '_id'>>();

    const onSubmit = async (data: Omit<Project, '_id'>) => {
        try {
            // Handle tech skills as array
            const techString = (data as any).technologiesStr || '';
            data.technologiesUsed = techString.split(',').map((s: string) => s.trim()).filter(Boolean);
            delete (data as any).technologiesStr;

            await onAdd(data);
            reset();
            setShowAddForm(false);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="text-blue-600" />
                    Projects
                </h3>
                {!showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                    >
                        <Plus size={16} /> Add Project
                    </button>
                )}
            </div>

            {showAddForm && (
                <form onSubmit={handleSubmit(onSubmit)} className="card bg-blue-50/30 border-blue-100 p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Project Title</label>
                            <input
                                {...register('title', { required: 'Title is required' })}
                                className={`w-full px-4 py-2 bg-white border ${errors.title ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none`}
                                placeholder="e.g. Portfolio Website"
                            />
                            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-sm font-bold text-slate-700">Technologies (Comma separated)</label>
                            <input
                                {...register('technologiesStr' as any, { required: 'Technologies are required' })}
                                className={`w-full px-4 py-2 bg-white border ${(errors as any).technologiesStr ? 'border-red-500' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none`}
                                placeholder="e.g. React, Tailwind, Node.js"
                            />
                            {(errors as any).technologiesStr && <p className="text-red-500 text-xs mt-1">{(errors as any).technologiesStr.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">GitHub Link</label>
                        <div className="relative">
                            <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                {...register('githubLink', {
                                    pattern: { value: /^(https?:\/\/)?(www\.)?github\.com\/.+/, message: 'Invalid GitHub URL' }
                                })}
                                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="https://github.com/your-username/repo"
                            />
                        </div>
                        {errors.githubLink && <p className="text-red-500 text-xs mt-1">{errors.githubLink.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700">Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            placeholder="Detailed description of your project and your contribution..."
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="submit" disabled={isSubmitting} className="btn-primary py-2 px-8 flex items-center gap-2">
                            {isSubmitting ? 'Saving...' : 'Add to Profile'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="btn-secondary py-2 px-8"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.length === 0 && !showAddForm && (
                    <div className="col-span-full text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                        <p className="text-slate-500 font-medium italic text-sm">No projects added yet.</p>
                    </div>
                )}

                {projects.map((project) => (
                    <div key={project._id} className="group relative card p-6 hover:border-blue-200 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="text-lg font-bold text-slate-900">{project.title}</h4>
                            <button
                                onClick={() => onRemove(project._id!)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash size={16} />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                            {project.technologiesUsed.map((tech, idx) => (
                                <span key={idx} className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase tracking-wider">
                                    {tech}
                                </span>
                            ))}
                        </div>

                        {project.description && (
                            <p className="text-sm text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                                {project.description}
                            </p>
                        )}

                        {project.githubLink && (
                            <a
                                href={project.githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors"
                            >
                                <Github size={16} /> Repository
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
